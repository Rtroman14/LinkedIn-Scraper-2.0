const MongoDB = require("../mongoDB/index");
const mongoose = require("mongoose");

const { checkForScrapedContact, getAllContacts, scroll } = require("./helpers");

const Contact = mongoose.model("contact");

module.exports = async (page, user) => {
    try {
        const { client, scriptMode } = user;

        let previousHeight = 0;
        let currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        let total = 0;

        // let secondLastContact;
        // let lastContact;

        let lastConnections;

        if (scriptMode === "Update") {
            lastConnections = await MongoDB.getLastTwoConnections(client);

            // secondLastContact = lastConnections[0].profileUrl;
            // lastContact = lastConnections[1].profileUrl;
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
                const newConnections = await page.evaluate(checkForScrapedContact(lastConnections));

                if (newConnections) {
                    for (let connection of newConnections) {
                        const contact = new Contact(connection);

                        await MongoDB.addConnection(client, contact);
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

        return;
    } catch (error) {
        console.log(`SCROLLING ERROR --- ${error}`);
    }
};
