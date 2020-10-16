require("dotenv").config();

const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base("app5w9e4NrsA14kZa");

class AirtableClass {
    async createRecord(tableName, record) {
        return new Promise((resolve, reject) => {
            base(tableName).create(record, (err, record) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(record.getId());
            });
        });
    }

    async getSingleRecordFrom(tableName, id) {
        return new Promise((resolve, reject) => {
            base(tableName).find(id, (err, record) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                resolve(record);
            });
        });
    }
}

module.exports = new AirtableClass();
