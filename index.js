require("dotenv").config();

const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const moment = require("moment");

const scrollPage = require("./src/scrollPage");
const scrapeContacts = require("./src/scrapeContacts");
const configBrowser = require("./src/configBrowser");
const checkAuthentication = require("./src/checkAuthentication");

require("./mongoDB/models/User");
require("./mongoDB/models/Connections");

mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});

const User = mongoose.model("users");
const user = await User.findOne({ client: "Ryan Roman 1" });

let httpRequestCount = 0;
let httpRequestMax = Math.floor(Math.random() * (80 - 68)) + 68;

const lastRunTime = user.lastRun.split("T")[0];
const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

if (lastRunTime < yesterday) {
    await scrapeLinkedin();
} else {
    const nextRunDate = moment(lastRunTime, "YYYY-MM-DD").add(2, "days").format("LL");
    console.log(
        `To fly under LinkedIn's radar, please don't run the script on this account until ${nextRunDate}`
    );
}

const scrapeLinkedin = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                "--proxy-server=zproxy.lum-superproxy.io:22225",
                // "--no-sandbox",
                // "--disable-setuid-sandbox",
                // "--disable-dev-shm-usage",
                // "--disable-gpu",
            ],
        });

        const page = await browser.newPage();

        await configBrowser(page, user);

        let loggedIn = await checkAuthentication(page);
        httpRequestCount++;

        while (loggedIn) {
            let scriptMode = user.scriptMode;
            console.log({ scriptMode });

            if (!loggedIn) {
                break;
            }

            // collect contacts URL
            let contacts = [];

            // future contacts to scrape
            let futureContacts = [];

            if (scriptMode !== "Resume") {
                // navigate to connections page
                await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/", {
                    waitUntil: "networkidle2",
                });
                httpRequestCount++;

                // scroll
                contacts = await scrollPage(page, googleSheet);

                let numContacts = contacts.length;
                console.log({ numContacts });

                if (contacts.length > 80) {
                    futureContacts = contacts.splice(80);
                } else if (scriptMode === "Update" && contacts.length < 1) {
                    googleSheet = await scriptType(wksht, httpRequestCount);
                    scriptMode = googleSheet.scriptMode;
                    contacts = [...googleSheet.contacts];
                }
            } else {
                contacts = [...googleSheet.contacts];
            }

            // scrape each contacts page
            let allContactsData = await scrapeContacts(page, contacts, httpRequestCount);

            httpRequestCount = allContactsData.httpRequestCount;

            if (futureContacts.length > 0) {
                // push futureContacts onto allContactsData.contacts object
                futureContacts.forEach((profile) => {
                    let contactObj = {};
                    contactObj.firstName = "";
                    contactObj.lastName = "";
                    contactObj.job = "";
                    contactObj.city = "";
                    contactObj.company = "";
                    contactObj.email = "";
                    contactObj.phone = "";
                    contactObj.profile = profile;
                    contactObj.connected = "";
                    contactObj.birthday = "";
                    allContactsData.contacts.push(contactObj);
                });
            }

            // export scraped contacts
            await exportData(allContactsData, scriptMode);

            if (httpRequestCount >= httpRequestMax) {
                loggedIn = false;
            } else if (scriptMode === "Resume") {
                loggedIn = false;
            }
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
