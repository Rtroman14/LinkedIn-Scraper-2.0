require("dotenv").config();

const puppeteer = require("puppeteer");
const moment = require("moment");

const scrollPage = require("./src/scrollPage");
const scrapeContact = require("./src/scrapeContact");
const configBrowser = require("./src/configBrowser");
const checkAuthentication = require("./src/checkAuthentication");
const { randomWait, convertToAirtableRecord } = require("./src/helpers");
const AirtableClass = require("./src/airtable");

const MongoDB = require("./mongoDB/index");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

let account;
let user;
let client;

let httpRequestMax = Math.floor(Math.random() * (80 - 68)) + 68;

(async () => {
    try {
        account = await AirtableClass.getNextUser();
        user = await MongoDB.getUser(account);
        client = user.client;

        const date = new Date(user.lastRun);
        const lastRunTime = moment(date).format("YYYY-MM-DD");
        const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

        if (lastRunTime < yesterday) {
            await scrapeLinkedin();
        } else {
            const nextRunDate = moment(lastRunTime, "YYYY-MM-DD").add(2, "days").format("LL");
            console.log(
                `To fly under LinkedIn's radar, please don't run the script on this account until ${nextRunDate}`
            );
        }
    } catch (error) {
        console.log("ERROR INITIALIZING SCRIPT ---", error);
    }
})();

const scrapeLinkedin = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            // args: [
            // "--proxy-server=zproxy.lum-superproxy.io:22225",
            // "--no-sandbox",
            // "--disable-setuid-sandbox",
            // "--disable-dev-shm-usage",
            // "--disable-gpu",
            // ],
        });

        const page = await browser.newPage();

        await configBrowser(page, user);

        console.log(`Launching ${account}'s account`);

        await MongoDB.updateUserField(client, { httpRequestCount: 0 });

        let loggedIn = await checkAuthentication(page);
        await MongoDB.incrementHttpRequestCount(client);

        if (loggedIn) {
            await page.waitFor(randomWait());

            // navigate to connections page
            await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/", {
                waitUntil: "networkidle2",
            });
            await page.waitFor(randomWait());

            await MongoDB.incrementHttpRequestCount(client);

            await scrollPage(page, user);

            await page.waitFor(randomWait());

            while (loggedIn) {
                let nextContact = await MongoDB.getNextConnection(client);

                if (!nextContact) {
                    const today = moment(new Date()).format("YYYY-MM-DD");
                    await MongoDB.updateUserField(client, { lastRun: today });
                    await AirtableClass.updateRecord(user.airtableRecordID, { "Last Run": today });

                    break;
                }

                await page.goto(`${nextContact}detail/contact-info/`, {
                    waitUntil: "networkidle2",
                });

                await page.waitFor(randomWait());

                if (page.url() !== "https://www.linkedin.com/in/unavailable/") {
                    let contactProfile = await page.evaluate(scrapeContact);

                    let contactProfileAirtable = convertToAirtableRecord(contactProfile);

                    let airtableRecordID = await AirtableClass.createRecord(
                        client,
                        contactProfileAirtable
                    );

                    let contactProfileMongoDB = {
                        ...contactProfile,
                        airtableRecordID,
                    };

                    await MongoDB.addProfile(client, contactProfileMongoDB);
                }

                let httpCount = await MongoDB.incrementHttpRequestCount(client);

                await page.waitFor(randomWait());

                if (httpCount >= httpRequestMax) {
                    loggedIn = false;
                    const today = moment(new Date()).format("YYYY-MM-DD");
                    await MongoDB.updateUserField(client, { lastRun: today });
                    await AirtableClass.updateRecord(user.airtableRecordID, { "Last Run": today });
                }
            }
        } else {
            await MongoDB.updateUserField(client, { cookieStatus: false });
            await AirtableClass.updateRecord(user.airtableRecordID, { "Cookie Status": "Expired" });
        }

        // close browser
        await browser.close();
        console.log("Browser closed");
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        console.log(`INDEX.JS ERROR --- ${error}`);
    }
};
