module.exports = async (page, googleSheet) => {
    let scriptMode = googleSheet.scriptMode;
    let lastContact = googleSheet.lastContact;
    let secondLastContact = googleSheet.secondLastContact;

    try {
        let previousHeight = 0;
        let currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        let total = 0;

        while (previousHeight < currentHeight) {
            console.log("Scrolling...");
            total++;
            previousHeight = await page.evaluate("document.scrollingElement.scrollHeight");
            await page.evaluate(`window.scrollBy({
                top: ${previousHeight},
                behavior: "smooth",
            })`);
            await new Promise((resolve) => {
                setTimeout(resolve, 3000);
            });

            // scroll step up to load contacts list
            if (total === 2) {
                await page.evaluate(`window.scrollBy({
                    top: -850,
                    behavior: "smooth",
                })`);
                await new Promise((resolve) => {
                    setTimeout(resolve, 3000);
                });
            }

            // return list of updated contacts
            if (scriptMode === "Update") {
                let contacts = await page.evaluate(extractContactUrls);

                // break while loop if lastContact in DOM
                for (let i = 0; i < contacts.length; i++) {
                    if (contacts[i] === (lastContact || secondLastContact)) {
                        return contacts.splice(0, i);
                    }
                }
            }

            currentHeight = await page.evaluate("document.scrollingElement.scrollHeight");
        }

        // return all contacts
        return await page.evaluate(extractContactUrls);
    } catch (error) {
        console.log(`Scroll error = ${error}`);
    }
};

let extractContactUrls = () => {
    let contactUrls = [];
    let contacts = document.querySelectorAll(".mn-connection-card__details > a");
    for (let contact of contacts) {
        contactUrls.push(contact.href);
    }
    return contactUrls;
};
