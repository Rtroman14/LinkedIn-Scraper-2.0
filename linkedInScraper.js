const puppeteer = require("puppeteer"),
    accounts = require("./accounts"),
    { scriptType } = require("./src/scriptType"),
    login = require("./src/login"),
    scrollPage = require("./src/scrollPage"),
    scrapeContacts = require("./src/scrapeContacts"),
    exportData = require("./src/exportData");

let { username, password, wksht } = accounts.users.ryanRoman;

let scriptMode = true;
let googleSheet;

let httpRequestCount = 0;

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
        );

        // navigate to linkedIn
        let linkedIn =
            "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";
        await page.goto(linkedIn, { waitUntil: "networkidle2" });
        httpRequestCount++;

        // login
        await login(username, password, page);
        console.log(`Logged in as ${username}`);

        while (scriptMode) {
            // Check how to run the script (initial, update, resume)
            googleSheet = await scriptType(wksht, httpRequestCount);
            scriptMode = googleSheet.scriptMode;

            if (!scriptMode) {
                break;
            }

            console.log(`scriptMode = ${scriptMode}`);

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

            if (httpRequestCount > 80) {
                scriptMode = false;
            } else if (scriptMode === "Resume") {
                scriptMode = false;
            }
        }

        // close browser
        await browser.close();
        console.log("Browser closed");
    } catch (error) {
        console.log(`linkedInScraper.js error = ${error}`);

        // take screenshot to analyze problem
        await page.screenshot({ path: "./image.jpg", type: "jpeg" });

        // export scraped contacts
        await exportData(allContactsData, scriptMode);
    }
})();
