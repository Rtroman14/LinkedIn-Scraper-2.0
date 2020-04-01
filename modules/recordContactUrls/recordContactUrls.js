module.exports = async (page, scriptMode, lastContactIndex) => {
    let contactProfiles = await page.$$eval(".mn-connection-card__details > a", el =>
        el.map(x => "https://www.linkedin.com" + x.getAttribute("href"))
    );

    // contactsToScrape.push(...contactProfiles);
    if (scriptMode === "Update") {
        return contactProfiles.splice(0, lastContactIndex);
    } else {
        return contactProfiles;
    }
};
