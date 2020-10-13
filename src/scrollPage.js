const MongoDB = require("../mongoDB/index");

module.exports = async (page, user) => {
    try {
        const { client, scriptMode } = user;

        let previousHeight = 0;
        let currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        let total = 0;
        let lastContact;
        let secondLastContact;

        if (scriptMode === "Update") {
            let lastConnections = await MongoDB.getLastTwoConnections(client);

            lastContact = lastConnections[1].email;
            secondLastContact = lastConnections[0].email;
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

                await MongoDB.addConnections(client, newConnections);
            }

            currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        }

        // return all contacts
        return await page.evaluate(extractContactUrls);
    } catch (error) {
        console.log(`SCROLLING ERROR --- ${error}`);
    }
};

const checkForScrapedContact = () => {
    const connections = document.querySelectorAll(".mn-connection-card__details > a");

    const foundScrapedContact = false;

    for (let connection of connections) {
        if (connection.href === (lastContact || secondLastContact)) {
            foundScrapedContact = true;
        }
    }

    if (foundScrapedContact) {
        let newConnections = [];
        let contact = {};

        for (let connection of connections) {
            const name = connection.querySelector(".mn-connection-card__name").innerText;

            if (connection.href !== (lastContact || secondLastContact)) {
                contact.name = name;
                contact.profileUrl = connection.href;

                newConnections.push(contact);
            }

            return newConnections;
        }
    }
};

const scroll = async (page, amount) => {
    await page.evaluate(`window.scrollBy({
        top: ${amount},
        behavior: "smooth",
    })`);
    await new Promise((resolve) => {
        setTimeout(resolve, 3000);
    });
};
