module.exports = async (page) => {
    try {
        try {
            await page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle0" });

            // wait for element
            await page.waitForSelector("header.msg-overlay-bubble-header");

            if (page.url().contains("linkedin.com/feed")) {
                console.log("SUCCESSFULLY SET COOKIES");
                return true;
            } else {
                console.log("COOKIES HAVE EXPIRED. REPLACE COOKIES AND TRY AGAIN!!");
                return false;
            }
        } catch (error) {
            console.log("ERROR NAVIGATING TO WWW.LINKEDIN.COM ---", error);
            return false;
        }
    } catch (error) {
        console.log(`CHECK SCRIPTMODE ERROR --- ${error}`);
        return false;
    }
};
