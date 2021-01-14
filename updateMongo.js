require("dotenv").config();

const moment = require("moment");

const AirtableClass = require("./src/airtable");

const MongoDB = require("./mongoDB/index");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const updateCookie = async (client, cookie) => {
    try {
        const user = await MongoDB.getUser(client);
        await MongoDB.updateUserField(client, { cookie });
        await MongoDB.updateUserField(client, { cookieStatus: true });
        await AirtableClass.updateRecord(user.airtableRecordID, { "Cookie Status": "Active" });
        await AirtableClass.updateRecord(user.airtableRecordID, { Cookie: cookie });
    } catch (error) {
        console.log("ERROR UPDATING COOKIE ---", error);
    }
};

const newUser = {
    client: "Keith Keller",
    lastRun: "10/16/2020",
    cookie:
        "AQEDARNbnawBPUMeAAABdm0bWDQAAAF2kSfcNE4AhzJ2FJamVjtffSq-DML75r-cov7kMqzan82SqnJEmydkbKiUqH0iQsasfOvlMkmh9dOURGpi24nGQznYzr-O6EbvomDONOBx0k0k0lNQtj5QoOfb",
    cookieStatus: true,
    proxyUsername: "",
    proxyPassword: "",
    scriptMode: "Initial",
    httpRequestCount: 0,
    airtableRecordID: "recPD2v7p6YxCgD77",
};

const lastConnections = [
    {
        name: "Steve Layton",
        profileUrl: "https://www.linkedin.com/in/steve-layton-a69679139/",
    },
    {
        name: "Vicente Cantua - Investment Sales",
        profileUrl: "https://www.linkedin.com/in/vicente-cantua-investment-sales-232b0119/",
    },
];

(async () => {
    try {
        // -------------- UPDATE COOKIE --------------
        const cookies = await AirtableClass.getCookie();
        for (let user of cookies) {
            const { name, cookie } = user;
            await updateCookie(name, cookie);
            console.log(`Updated ${name}'s cookies`);
        }

        // -------------- ADD LAST CONNECTIONS --------------
        // await MongoDB.updateLastConnections(client, newConnections);
        // -------------- ADD NEW USER --------------
        // await MongoDB.createUser(newUser);
        // console.log("Done");
        // -------------- ADD LASTCONNECTIONS --------------
        // for (let contact of lastConnections) {
        //     await MongoDB.addLastConnections(client, contact);
        //     console.log("Added ", contact.name);
        // }
    } catch (error) {
        console.log(`UPDATE MONGO ERROR --- ${error}`);
    }
})();

const newConnections = [
    {
        name: "New Connection 1",
        profileUrl: "https://www.linkedin.com/",
    },
    {
        name: "New Connection 2",
        profileUrl: "https://www.linkedin.com/",
    },
];
