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

    async updateRecord(id, attrs) {
        return new Promise((resolve, reject) => {
            base("Clients").update(id, attrs, (err, record) => {
                if (err) {
                    console.error(err);
                    reject();
                    return;
                }

                resolve(record);
            });
        });
    }

    async getCookie() {
        const table = base("Clients");

        const records = await table
            .select({ filterByFormula: "{Cookie Status} = 'Update'" })
            .firstPage();

        // return record;
        return records.map((record) => {
            return {
                name: record.fields.User,
                cookie: record.fields.Cookie,
            };
        });
    }

    async getNextUser() {
        const table = base("Clients");

        const records = await table
            .select({ filterByFormula: "IF(AND({Status}='Active'),({Cookie Status} = 'Active'))" })
            .firstPage();

        // return record;
        const clients = records.map((record) => {
            return {
                name: record.fields.User,
                lastRun: record.fields["Last Run"],
            };
        });

        clients.sort((a, b) => {
            let dateA = new Date(a.lastRun),
                dateB = new Date(b.lastRun);
            return dateA - dateB; //sort by date ascending
        });

        return clients[0].name;
    }
}

module.exports = new AirtableClass();
