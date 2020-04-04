require("dotenv").config();

const moment = require("moment");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

let googleSheet = {};

exports.scriptType = async (wksht, httpRequestCount) => {
    try {
        await doc.useServiceAccountAuth(require("./keys.json"));

        // loads document properties and worksheets
        await doc.loadInfo();
        let sheet = doc.sheetsById[wksht];

        let twoDaysAgo = moment().subtract(2, "days").format("LL");

        if (httpRequestCount < 2) {
            await sheet.loadCells("H:H");
            googleSheet.numContacts = sheet.cellStats.nonEmpty;
            await sheet.loadCells("I:I");
            googleSheet.numRecordedContacts = sheet.cellStats.nonEmpty - googleSheet.numContacts;

            googleSheet.lastRecordedContact = sheet.getCellByA1("I2").formattedValue;

            if (googleSheet.numContacts === 1) {
                googleSheet.scriptMode = "Initial";

                return googleSheet;
            } else if (googleSheet.lastRecordedContact > twoDaysAgo) {
                googleSheet.lastContact = sheet.getCellByA1("H2").formattedValue;
                googleSheet.secondLastContact = sheet.getCellByA1("H3").formattedValue;
                googleSheet.scriptMode = "Update";

                return googleSheet;
            } else {
                let nextRunDate = moment(googleSheet.lastRecordedContact, "MMMM DD, YYYY").add(2, "days").format("LL");
                console.log(`To fly under LinkedIn's radar, please don't run the script on this account until ${nextRunDate}`);

                let scriptMode = false;
                return scriptMode;
            }
        } else {
            await sheet.loadCells("H:H");
            googleSheet.numContacts = sheet.cellStats.nonEmpty;
            await sheet.loadCells("I:I");
            googleSheet.numRecordedContacts = sheet.cellStats.nonEmpty - googleSheet.numContacts;

            if (googleSheet.numRecordedContacts < googleSheet.numContacts) {
                googleSheet.scriptMode = "Resume";
                googleSheet.contacts = [];

                // push next contacts to scrape to array
                for (let i = 0; i < httpRequestCount; i++) {
                    googleSheet.contacts.push(sheet.getCell(googleSheet.numRecordedContacts + i, 7).formattedValue);
                }

                return googleSheet;
            } else {
                let scriptMode = false;
                return scriptMode;
            }
        }
    } catch (error) {
        console.log(error);

        let scriptMode = false;
        return scriptMode;
    }
};
