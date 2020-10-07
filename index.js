const puppeteer = require("puppeteer"),
    accounts = require("./accounts"),
    { scriptType } = require("./src/scriptType"),
    login = require("./src/login"),
    scrollPage = require("./src/scrollPage"),
    scrapeContacts = require("./src/scrapeContacts"),
    configBrowser = require("./src/configBrowser");

require("./src/mongoDB/models/Users");
require("./src/mongoDB/models/Connections");

let { username, password, cookie, base, projectName } = accounts.users.tylerFreilinger;

const mongoose = require("mongoose");
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

let httpRequestCount = 0;
let httpRequestMax = Math.floor(Math.random() * (80 - 68)) + 68;

// login with cookies
let loggedIn = false;

// ON AIRTABLE BRANCH !!!

(async () => {
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

        await configBrowser(page);

        try {
            await page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle0" });
            httpRequestCount++;

            // wait for element
            await page.waitForSelector("header.msg-overlay-bubble-header");

            if (page.url().contains("linkedin.com/feed")) {
                console.log("SUCCESSFULLY SET COOKIES");
                loggedIn = true;
            } else {
                console.log("COOKIES HAVE EXPIRED. REPLACE COOKIES AND TRY AGAIN!!");
            }
        } catch (error) {
            console.log("ERROR NAVIGATING TO WWW.LINKEDIN.COM");
        }

        while (loggedIn) {
            let scriptMode = await checkScriptMode();

            if (!scriptMode) {
                break;
            }

            console.log({ scriptMode });

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
        console.log(`INDEX.JS ERROR --- ${error}`);
    }
})();
