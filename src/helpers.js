module.exports = {
    async checkForScrapedContact(page, lastConnections) {
        return await page.evaluate((lastConnections) => {
            const secondLastContact = lastConnections[0].profileUrl;
            const lastContact = lastConnections[1].profileUrl;

            try {
                let newConnections = [];

                const connections = document.querySelectorAll(".mn-connection-card__details > a");

                for (let connection of connections) {
                    let contact = {};

                    if (connection.href === lastContact || connection.href === secondLastContact) {
                        console.log("RETURN NEWCONNECTIONS");
                        return newConnections;
                    } else {
                        contact.name = connection.querySelector(
                            ".mn-connection-card__name"
                        ).innerText;
                        contact.profileUrl = connection.href;

                        newConnections.push(contact);
                        console.log("PUSH CONTACT");
                    }
                }

                return false;
            } catch (error) {
                console.log("CHECKFORSCRAPEDCONTACT ERROR ---", error);
            }
        }, lastConnections);
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

    randomWait() {
        return Math.floor(Math.random() * 10000 + 10000);
    },

    convertToAirtableRecord(contactProfile) {
        return {
            "First Name": contactProfile.firstName,
            "Last Name": contactProfile.lastName,
            Job: contactProfile.job,
            City: contactProfile.city,
            Company: contactProfile.company,
            Email: contactProfile.email,
            "Phone Number": contactProfile.phone,
            "LinkedIn Page": contactProfile.profileUrl,
            "Date Connected": contactProfile.connected,
            Birthday: contactProfile.birthday,
        };
    },
};
