module.exports = async (page, linkedinAccount) => {
    try {
        const { proxyUsername, proxyPassword, cookie } = linkedinAccount;

        // await page.authenticate({
        //     username: proxyUsername,
        //     password: proxyPassword,
        // });

        await page.setViewport({ width: 1366, height: 768 });

        await page.setRequestInterception(true);

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36"
        );

        page.on("request", (request) => {
            if (request.resourceType() === "image") {
                request.abort();
            } else {
                request.continue();
            }
        });

        // authenticate user
        await page.setCookie({ name: "li_at", value: cookie, domain: "www.linkedin.com" });
    } catch (error) {
        console.log(`BROWSER CONFIGURATION ERROR --- ${error}`);
    }
};
