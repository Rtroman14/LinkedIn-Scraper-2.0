const puppeteer = require("puppeteer"),
    accounts = require("./accounts"),
    { scriptType } = require("./src/scriptType"),
    login = require("./src/login"),
    scrollPage = require("./src/scrollPage"),
    scrapeContacts = require("./src/scrapeContacts"),
    exportData = require("./src/exportData");

const { username, password, wksht, projectName } = accounts.users.tylerFreilinger;

let googleSheet;

let httpRequestCount = 0;

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // turns request interceptor on
        await page.setRequestInterception(true);

        page.on("request", (request) => {
            if (request.resourceType() === "image") {
                request.abort();
            } else {
                request.continue();
            }
        });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36"
        );

        let linkedIn =
            "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";

        try {
            // navigate to linkedIn
            await page.goto(linkedIn, { waitUntil: "networkidle2" });
            httpRequestCount++;
        } catch (error) {
            console.log("Error while navigating to www.linkedin.com");
        }

        // login
        let loggedIn = await login(username, password, page);

        while (loggedIn) {
            // Check how to run the script (initial, update, resume)
            googleSheet = await scriptType(wksht, httpRequestCount);
            scriptMode = googleSheet.scriptMode;

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
            let allContactsData = await scrapeContacts(
                page,
                contacts,
                httpRequestCount,
                projectName
            );

            httpRequestCount = allContactsData.httpRequestCount || 80;

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

            if (httpRequestCount >= 80) {
                loggedIn = false;
            } else if (scriptMode === "Resume") {
                loggedIn = false;
            }
        }

        // close browser
        await browser.close();
        console.log("Browser closed");
    } catch (error) {
        console.log(`LINKEDINSCRAPER.JS ERROR --- ${error}`);

        // take screenshot to analyze problem
        await page.screenshot({ path: "./image.jpg", type: "jpeg" });

        // export scraped contacts
        await exportData(allContactsData, scriptMode);
    }
})();
