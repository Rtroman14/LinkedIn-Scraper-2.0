let allContacts = {
    httpRequestCount: 80,
    contacts: [],
};

module.exports = async (page, contacts, httpRequestCount) => {
    try {
        let allContactsData = {
            httpRequestCount: "",
            contacts: [],
        };

        allContactsData.httpRequestCount = httpRequestCount;

        console.log("Scraping contacts...");

        // scrape each contacts page
        for (let contact of contacts) {
            await page.waitFor(randomWait());
            await page.goto(`${contact}detail/contact-info/`, {
                waitUntil: "networkidle2",
            });
            allContactsData.httpRequestCount++;

            if (page.url() === "https://www.linkedin.com/in/unavailable/") {
                let contactObj = {};
                contactObj.firstName = "";
                contactObj.lastName = "";
                contactObj.job = "";
                contactObj.city = "";
                contactObj.company = "";
                contactObj.email = "";
                contactObj.phone = "";
                contactObj.profile = "https://www.linkedin.com/in/unavailable/";
                contactObj.connected = "";
                contactObj.birthday = "";
                allContactsData.contacts.push(contactObj);
            } else {
                // scrape profile page
                let contactData = await page.evaluate((contact) => {
                    let contactObj = {};

                    let getText = (doc, selector) => {
                        if (doc.querySelector(selector)) {
                            return doc.querySelector(selector).innerText;
                        } else {
                            return "";
                        }
                    };

                    // record contact info headers
                    let sections = document.querySelectorAll(".pv-contact-info__contact-type");

                    // record contact info
                    let contactInfo = (header, selector) => {
                        for (let section of sections) {
                            if (getText(section, ".pv-contact-info__header") == header)
                                return getText(section, selector);
                        }
                        return "";
                    };

                    try {
                        let name = getText(document, "li.t-24");

                        contactObj.firstName = name.split(" ")[0];
                        contactObj.lastName = name.split(" ").slice(1).join(" ");
                        contactObj.job = getText(document, "h2.t-18");
                        contactObj.city = getText(document, ".pv-top-card--list-bullet > li");
                        contactObj.company = getText(document, "span.lt-line-clamp--multi-line");
                        contactObj.email = contactInfo("Email", ".pv-contact-info__contact-link");
                        contactObj.phone = contactInfo(
                            "Phone",
                            ".pv-contact-info__ci-container > span"
                        );
                        contactObj.profile = contact;
                        contactObj.connected = contactInfo(
                            "Connected",
                            ".pv-contact-info__contact-item"
                        );
                        contactObj.birthday = contactInfo(
                            "Birthday",
                            ".pv-contact-info__contact-item"
                        );
                    } catch (error) {
                        console.log(`contactObj error = ${error}`);
                    }

                    return contactObj;
                }, contact);

                allContactsData.contacts.push(contactData);
                allContacts.contacts.push(contactData); // incase failure
            }
        }

        return allContactsData;
    } catch (error) {
        console.log(`SCRAPECONTACTS ERROR --- ${error}`);

        return allContacts;
    }
};

// Create wait on each page
const randomWait = () => {
    return Math.floor(Math.random() * 10000 + 10000);
};
