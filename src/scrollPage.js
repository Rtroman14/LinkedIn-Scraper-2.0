const MongoDB = require("../mongoDB/index");

const { getAllContacts, scroll, checkForScrapedContact } = require("./helpers");

module.exports = async (page, user) => {
    try {
        const { client, scriptMode } = user;

        let previousHeight = 0;
        let currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        let total = 0;

        let lastConnections;

        if (scriptMode === "Update") {
            lastConnections = await MongoDB.getLastTwoConnections(client);
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
                const newConnections = await checkForScrapedContact(page, lastConnections);

                if (newConnections) {
                    console.log("ADDING NEW CONNECTIONS TO MONGODB");
                    for (let connection of newConnections.reverse()) {
                        await MongoDB.addConnection(client, connection);
                    }

                    const lastContacts = newConnections.slice(0, 2);

                    for (let contact of lastContacts) {
                        await MongoDB.addLastConnections(client, contact);
                    }

                    return;
                }
            }

            currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        }

        const newConnections = await page.evaluate(getAllContacts);

        for (let newConnection of newConnections) {
            await MongoDB.addConnection(client, newConnection);
        }

        await MongoDB.addLastConnections(client, newConnections.slice(0, 2));

        await MongoDB.updateUserField(client, { scriptMode: "Update" });

        return;
    } catch (error) {
        console.log(`SCROLLING ERROR --- ${error}`);
    }
};
