require("dotenv").config();

const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base("app5w9e4NrsA14kZa");

module.exports = async (projectName, fields) => {
    try {
        base(projectName).create([{ fields }], (err, records) => {
            if (err) {
                console.error(err);
                return;
            }
            records.forEach((record) => {
                console.log("Created record with ID = ", record.getId());
            });
        });
    } catch (error) {
        console.log(`AIRTABLE ERROR --- ${error}`);
    }
};
