const { scriptType } = require("./modules/scriptType/scriptType");

let scriptMode;
let contacts = [];

let wksht = 912272675;
let httpRequestCount = 20;

(async () => {
    try {
        googleSheet = await scriptType(wksht, httpRequestCount);
        // console.log(googleSheet);

        contacts = [...googleSheet.contacts];

        console.log(contacts);
    } catch (error) {
        console.log(error);
    }
})();
