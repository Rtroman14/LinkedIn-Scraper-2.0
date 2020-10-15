require("dotenv").config();

const puppeteer = require("puppeteer");
const moment = require("moment");

const scrollPage = require("./src/scrollPage");
const scrapeContact = require("./src/scrapeContact");
const configBrowser = require("./src/configBrowser");
const checkAuthentication = require("./src/checkAuthentication");
const { randomWait } = require("./src/helpers");

const MongoDB = require("./mongoDB/index");

const user = await MongoDB.getUser("Ryan Roman 1");
const { client } = user;
let { scriptMode } = user;

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

        await MongoDB.updateUserField(client, { httpRequestCount: 0 });

        let loggedIn = await checkAuthentication(page);
        await MongoDB.incrementHttpRequestCount(client);

        if (loggedIn) {
            await page.waitFor(randomWait());

            if (scriptMode !== "Resume") {
                // navigate to connections page
                await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/", {
                    waitUntil: "networkidle2",
                });
                await page.waitFor(randomWait());

                await MongoDB.incrementHttpRequestCount(client);

                await scrollPage(page, user);

                await page.waitFor(randomWait());
            }

            while (loggedIn) {
                let nextContact = await MongoDB.getNextConnection(client);

                if (!nextContact) {
                    break;
                }

                await page.goto(`${nextContact}detail/contact-info/`, {
                    waitUntil: "networkidle2",
                });

                await page.waitFor(randomWait());

                if (page.url() !== "https://www.linkedin.com/in/unavailable/") {
                    let contactProfile = await page.evaluate(scrapeContact);

                    await MongoDB.addProfile(client, contactProfile);

                    // ADD CONTACTPROFILE TO AIRTABLE
                }

                let httpCount = await MongoDB.incrementHttpRequestCount(client);

                await page.waitFor(randomWait());

                if (httpCount >= httpRequestMax) {
                    loggedIn = false;
                }
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
