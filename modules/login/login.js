module.exports = async (username, password, page) => {
    try {
        let loginBtn = "#app__container > main > div > form > div.login__form_action_container > button";

        await page.waitForSelector(loginBtn);
        await page.type("#username", username, { delay: 30 });
        await page.type("#password", password, { delay: 30 });
        await page.click(loginBtn, { delay: 30 });
    } catch (err) {
        console.log(err);
    }
};
