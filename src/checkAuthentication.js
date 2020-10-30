module.exports = async (page) => {
    try {
        await page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle2" });

        // wait for element
        await page.waitForSelector(".msg-overlay-bubble-header");

        if (page.url().includes("linkedin.com/feed")) {
            console.log("SUCCESSFULLY SET COOKIES");
            return true;
        } else {
            console.log("COOKIES HAVE EXPIRED. REPLACE COOKIES AND TRY AGAIN!!");
            return false;
        }
    } catch (error) {
        console.log("NEEDS NEW COOKIES!");
        return false;
    }
};
