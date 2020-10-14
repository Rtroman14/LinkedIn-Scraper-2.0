require("dotenv").config();

const puppeteer = require("puppeteer");
const moment = require("moment");

const scrollPage = require("./src/scrollPage");
const scrapeContacts = require("./src/scrapeContacts");
const configBrowser = require("./src/configBrowser");
const checkAuthentication = require("./src/checkAuthentication");
const MongoDB = require("./mongoDB/index");

const user = await MongoDB.getUser("Ryan Roman 1");

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
            let { scriptMode } = user;
            console.log({ scriptMode });

            if (!loggedIn) {
                break;
            }

            if (scriptMode !== "Resume") {
                // navigate to connections page
                await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/", {
                    waitUntil: "networkidle2",
                });
                httpRequestCount++;

                await scrollPage(page, user);
            }

            // scrape each contacts page
            let allContactsData = await scrapeContacts(page, contacts, httpRequestCount);

            httpRequestCount = allContactsData.httpRequestCount;

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
