module.exports = async (username, password, page) => {
    try {
        let loginBtn =
            "#app__container > main > div > form > div.login__form_action_container > button";
        let messageBar = "header.msg-overlay-bubble-header";

        await page.waitForSelector(loginBtn);
        await page.type("#username", username, { delay: 30 });
        await page.type("#password", password, { delay: 30 });
        await page.click(loginBtn, { delay: 30 });
        await page.waitForSelector(messageBar);
        console.log(`Logged in as ${username}`);

        return true;
    } catch (error) {
        console.log(`LOGIN ERROR --- ${error}`);

        return false;
    }
};
