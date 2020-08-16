require("dotenv").config();

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require("googleapis");

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

let wksht = 340039574;

let gSheet = async () => {
    try {
        await doc.useServiceAccountAuth(require("./keys.json"));
        await doc.loadInfo();
        let sheet = doc.sheetsById[wksht];

        console.log(sheet.title);

        const newRow = {
            firstName: "Ryan",
            Last_Name: "Roman",
            job: "WebDev",
            city: "Broomfield",
            company: "Summa Media",
            email: "ryan@summamedia.co",
            phone: "715-252-5555",
            linkedInURL: "https://www.linkedin.com/user",
            dateConnected: "June 27, 2020",
            birthday: "",
        };

        const newRow2 = [
            "Ryan",
            "Roman",
            "WebDev",
            "Broomfield",
            "Summa Media",
            "ryan@summamedia.co",
            "715-252-5555",
            "https://www.linkedin.com/user",
            "June 27, 2020",
            "Birthday",
        ];

        await sheet.addRow(newRow2, (err) => {
            console.log(`There was an error while adding contact = ${err}`);
        });
    } catch (error) {
        console.log(`gSheet error = ${error}`);
    }
};

gSheet();
