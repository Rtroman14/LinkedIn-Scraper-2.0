const MongoDB = require("../mongoDB/index");
const { checkForScrapedContact, getAllContacts, scroll } = require("./helpers");

module.exports = async (page, user) => {
    try {
        const { client, scriptMode } = user;

        let previousHeight = 0;
        let currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        let total = 0;

        let secondLastContact;
        let lastContact;

        if (scriptMode === "Update") {
            let lastConnections = await MongoDB.getLastTwoConnections(client);

            secondLastContact = lastConnections[0].profileUrl;
            lastContact = lastConnections[1].profileUrl;
        }

        while (previousHeight < currentHeight) {
            previousHeight = await page.evaluate("document.scrollingElement.scrollHeight");
            console.log("Scrolling...");
            total++;

            await scroll(page, previousHeight);

            // scroll step up to load contacts list
            if (total === 2) {
                await scroll(page, -850);
                await scroll(page, 850);
                await scroll(page, -250);
            }

            // return list of updated contacts
            if (scriptMode === "Update") {
                const newConnections = await page.evaluate(checkForScrapedContact);

                if (newConnections) {
                    await MongoDB.addConnections(client, newConnections);
                    return;
                }
            }

            currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        }

        const newConnections = await page.evaluate(getAllContacts);

        await MongoDB.addConnections(client, newConnections);
        return;
    } catch (error) {
        console.log(`SCROLLING ERROR --- ${error}`);
    }
};
