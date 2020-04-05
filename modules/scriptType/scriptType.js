require("dotenv").config();

const moment = require("moment");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

let googleSheet = {};

exports.scriptType = async (wksht, httpRequestCount) => {
    try {
        await doc.useServiceAccountAuth(require("./keys.json"));

        // // loads document properties and worksheets
        // await doc.loadInfo();
        // let sheet = doc.sheetsById[wksht];

        let twoDaysAgo = moment().subtract(2, "days").format("LL");

        if (httpRequestCount < 2) {
            // loads document properties and worksheets
            await doc.loadInfo();
            let sheet = doc.sheetsById[wksht];

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

                googleSheet.scriptMode = false;
                return googleSheet;
            }
        } else {
            if (googleSheet.numRecordedContacts < googleSheet.numContacts) {
                googleSheet.scriptMode = "Resume";
                googleSheet.contacts = [];

                await doc.loadInfo();
                let sheet = doc.sheetsById[wksht];
                await sheet.loadCells("H:H");
                await sheet.loadCells("I:I");

                // decide how many contacts to scrape
                let httpLimit = 80 - httpRequestCount;
                let remainingContacts = googleSheet.numContacts - googleSheet.numRecordedContacts;
                let contactsToScrape = Math.min(httpLimit, remainingContacts);

                // push next contacts to scrape to array
                for (let i = 0; i < contactsToScrape; i++) {
                    googleSheet.contacts.push(sheet.getCell(googleSheet.numRecordedContacts + i, 7).formattedValue);
                }

                return googleSheet;
            } else {
                googleSheet.scriptMode = false;
                return googleSheet;
            }
        }
    } catch (error) {
        console.log(error);

        googleSheet.scriptMode = false;
        return googleSheet;
    }
};
