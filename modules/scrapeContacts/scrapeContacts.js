module.exports = async (page, contacts) => {
    try {
        // scrape each contacts page
        for (let contact of contacts) {
            await page.waitFor(randomWait());
            await page.goto(`${contact}detail/contact-info/`, {
                waitUntil: "networkidle2"
            });

            // scrape profile page
            let contactData = await page.evaluate(contact => {
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
                        if (getText(section, ".pv-contact-info__header") == header) return getText(section, selector);
                    }
                    return "";
                };

                try {
                    let name = getText(document, "li.t-24");

                    contactObj.firstName = name.split(" ")[0];
                    contactObj.lastName = name
                        .split(" ")
                        .slice(1)
                        .join(" ");
                    contactObj.job = getText(document, "h2.t-18");
                    contactObj.city = getText(document, ".pv-top-card--list-bullet > li");
                    contactObj.company = getText(document, "span.lt-line-clamp--multi-line");
                    contactObj.email = contactInfo("Email", ".pv-contact-info__contact-link");
                    contactObj.phone = contactInfo("Phone", ".pv-contact-info__ci-container > span");
                    contactObj.profile = contact;
                    contactObj.connected = contactInfo("Connected", ".pv-contact-info__contact-item");
                    contactObj.birthday = contactInfo("Birthday", ".pv-contact-info__contact-item");
                } catch (err) {
                    console.log(err);
                }

                return contactObj;
            }, contact);

            allContactsData.push(contactData);
        }
    } catch (error) {
        console.log(error);
    }
};

// Create wait on each page
const randomWait = async () => {
    return Math.floor(Math.random() * 5 + 2);
};
