const puppeteer = require("puppeteer"),
    accounts = require("./accounts"),
    { scriptType } = require("./modules/scriptType/scriptType"),
    login = require("./modules/login/login"),
    scrollPage = require("./modules/scrollPage/scrollPage"),
    recordContactUrls = require("./modules/recordContactUrls/recordContactUrls"),
    scrapeContacts = require("./modules/scrapeContacts/scrapeContacts"),
    exportData = require("./modules/exportData/exportData");

let { username, password, wksht } = accounts.users.ryanRoman;

let scriptMode;
let googleSheet;

let httpRequestCount = 0;

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
        );

        // navigate to linkedIn
        let linkedIn = "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";
        await page.goto(linkedIn, { waitUntil: "networkidle2" });
        httpRequestCount++;

        // login
        await login(username, password, page);
        console.log(`Logged in as ${username}.`);

        // while loop here. maximum 2 loops. if scripMode = true

        // Check how to run the script (initial or update)
        googleSheet = await scriptType(wksht, httpRequestCount);
        scriptMode = googleSheet.scriptMode;

        // collect contacts URL
        let contacts = [];
        // collect all contacts info
        let allContactsData = [];

        if (scriptMode !== "Resume") {
            // navigate to connections page
            await page.goto("https://www.linkedin.com/mynetwork/invite-connect/connections/", {
                waitUntil: "networkidle2"
            });
            httpRequestCount++;

            let lastContact = googleSheet.lastContact;
            let secondLastContact = googleSheet.secondLastContact;

            // scroll
            let lastContactIndex = await page.evaluate(scrollPage(scriptMode, lastContact, secondLastContact));

            // record each contacts URL
            contacts = await recordContactUrls(page, scriptMode, lastContactIndex);
        } else if (scriptMode === "Resume") {
            contacts = [...googleSheet.contacts];
        } else {
            console.log("Run script later....");
            break;
        }

        // scrape each contacts page
        await scrapeContacts(page, contacts);

        // close browser
        await browser.close();
        console.log("Browser closed.");

        // export scraped contacts
        await exportData(allContactsData, scriptMode);
    } catch (error) {
        console.log(`Our error = ${error}`);

        // export scraped contacts
        await exportData(allContactsData, scriptMode);
    }
})();

// UPDATE HTTPREQUESTCOUNT
