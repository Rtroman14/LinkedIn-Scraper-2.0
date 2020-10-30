module.exports = () => {
    try {
        let contactObj = {};

        // record contact info headers
        const sections = document.querySelectorAll(".pv-contact-info__contact-type");

        const getText = (doc, selector) => {
            if (doc.querySelector(selector)) {
                return doc.querySelector(selector).innerText;
            } else {
                return "";
            }
        };

        const contactInfo = (header, selector) => {
            for (let section of sections) {
                if (getText(section, ".pv-contact-info__header") == header)
                    return getText(section, selector);
            }
            return "";
        };

        let name = getText(document, "li.t-24");

        contactObj.firstName = name.split(" ")[0];
        contactObj.lastName = name.split(" ").slice(1).join(" ");
        contactObj.job = getText(document, "h2.t-18");
        contactObj.city = getText(document, ".pv-top-card--list-bullet > li");
        contactObj.company = getText(document, "span.lt-line-clamp--multi-line");
        contactObj.email = contactInfo("Email", ".pv-contact-info__contact-link");
        contactObj.phone = contactInfo("Phone", ".pv-contact-info__ci-container > span");
        contactObj.profileUrl = location.href.slice(0, location.href.search("detail"));
        contactObj.connected = contactInfo("Connected", ".pv-contact-info__contact-item");
        contactObj.birthday = contactInfo("Birthday", ".pv-contact-info__contact-item");

        return contactObj;
    } catch (error) {
        console.log(`SCRAPECONTACT ERROR --- ${error}`);
    }
};
