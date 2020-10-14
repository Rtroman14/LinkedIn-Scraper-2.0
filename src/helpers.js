module.exports = {
    checkForScrapedContact() {
        try {
            let newConnections = [];

            const connections = document.querySelectorAll(".mn-connection-card__details > a");

            for (let connection of connections) {
                let contact = {};

                if (connection.href === lastContact || connection.href === secondLastContact) {
                    console.log("RETURN NEWCONNECTIONS");
                    return newConnections.reverse();
                } else {
                    contact.name = connection.querySelector(".mn-connection-card__name").innerText;
                    contact.profileUrl = connection.href;

                    newConnections.push(contact);
                    console.log("PUSH CONTACT");
                }
            }

            return false;
        } catch (error) {
            console.log("CHECKFORSCRAPEDCONTACT ERROR ---", error);
        }
    },

    getAllContacts() {
        try {
            let newConnections = [];

            const connections = document.querySelectorAll(".mn-connection-card__details > a");

            for (let connection of connections) {
                let contact = {};

                contact.name = connection.querySelector(".mn-connection-card__name").innerText;
                contact.profileUrl = connection.href;

                newConnections.push(contact);
            }

            return newConnections.reverse();
        } catch (error) {
            console.log("GETALLCONTACTS ERROR ---", error);
        }
    },

    async scroll(page, amount) {
        try {
            await page.evaluate(`window.scrollBy({
            top: ${amount},
            behavior: "smooth",
        })`);
            await new Promise((resolve) => {
                setTimeout(resolve, 3000);
            });
        } catch (error) {
            console.log("SCROLL ERROR ---", error);
        }
    },
};
