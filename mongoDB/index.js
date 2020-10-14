require("dotenv").config();

const mongoose = require("mongoose");

require("./models/User");
require("./models/Connections");

const User = mongoose.model("users");
const Connection = mongoose.model("connections");

mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

class MongoDB {
    async createUser(newUser) {
        const user = await new User(newUser).save();

        await new Connection({
            _user: user._id,
            account: newUser.client,
        }).save();

        return user;
    }

    async getUser(client) {
        try {
            return await User.findOne({ client });
        } catch (error) {
            console.log(`ERROR RETRIEVING USER: ${client} --- ${error}`);
        }
    }

    async updateUserField(client, attributes) {
        const user = await this.getUser(client);

        if (user) {
            return await User.findByIdAndUpdate(
                user._id,
                attributes,
                { new: true },
                (err, updatedUser) => {
                    if (err) {
                        console.log("ERROR UPDATED USER FIELD ---", err);
                    }

                    console.log("Updated user =", updatedUser);
                }
            );
        } else {
            console.log(`COULD NOT FIND USER: ${client}`);
        }
    }

    async addConnection(client, contact) {
        const user = await this.getUser(client);

        if (user) {
            const existingConnection = await Connection.findOne({ _user: user._id });

            await existingConnection.connections.push(contact);
            return await existingConnection.save();
        } else {
            console.log(`COULD NOT FIND USER: ${client}`);
        }
    }

    async addConnections(client, contacts) {
        const user = await this.getUser(client);

        if (user) {
            const existingConnection = await Connection.findOne({ _user: user._id });

            for (let contact of contacts) {
                await existingConnection.connections.push(contact);
            }
            return await existingConnection.save();
        } else {
            console.log(`COULD NOT FIND USER: ${client}`);
        }
    }

    async addProfile(client, profile) {
        const user = await this.getUser(client);

        if (user) {
            const existingConnection = await Connection.findOne({ _user: user._id });

            await existingConnection.connectionsData.push(profile);
            return await existingConnection.save();
        } else {
            console.log(`COULD NOT FIND USER: ${client}`);
        }
    }

    async getNextConnection(client) {
        const user = await this.getUser(client);

        const existingConnection = await Connection.findOne({ _user: user._id });

        const nextConnection = existingConnection.connections.$pop();

        existingConnection.save((error) => {
            if (error) {
                return console.log("SAVE ERROR ---", error);
            }
        });

        return nextConnection;
    }

    async getLastTwoConnections(client) {
        const user = await this.getUser(client);

        if (user) {
            const existingConnection = await Connection.findOne({ _user: user._id });

            return existingConnection.connections.slice(-2);
        } else {
            return console.log(`COULD NOT FIND USER: ${client}`);
        }
    }
}

module.exports = new MongoDB();

// (async () => {
// const newUser = {
//     client: "Ryan Roman 1",
//     lastRun: Date.now(),
//     airtable: {
//         base: "aslkng8432",
//         projectName: "Linkedin",
//         baseName: "Base",
//     },
//     cookie: "asleninrha89w49vasr",
//     cookieStatus: false,
//     proxyUsername: "proxyUsername",
//     proxyPassword: "proxyPassword",
//     scriptMode: "Initial",
// };
// await mongoDB.createUser(newUser).then((user) => console.log(`Created new user: ${user.client}`));
// ---------------------------------------
// await mongoDB.updateUserField("Ryan Roman 1", {
//     proxyUsername: "proxyUsername",
//     proxyPassword: "proxyPassword",
// });
// ---------------------------------------
// const newContact = {
//     firstName: "Ryan Roman 2",
//     lastName: "Roman",
//     profileUrl: "https://www.linkedin.com/rtoman14",
// };
// await mongoDB.addConnection("Ryan Roman 1", newContact);
// ---------------------------------------
// const newProfile = {
//     firstName: "Ryan 1",
//     lastName: "Roman",
//     job: "Web Developer",
//     city: "Broomfield",
//     company: "Summa Media",
//     email: "Ryan@summamedia.co",
//     phone: "715-252-9999",
//     profileUrl: "https://www.linkedin.com/rtroman14",
//     connected: "November 3, 2019",
//     birthday: "September 15",
// };
// await mongoDB.addProfile("Ryan Roman 1", newProfile);
// ---------------------------------------
// const nextUser = await mongoDB.getNextConnection("Ryan Roman 1");
// nextUser ? console.log(nextUser) : console.log("NO USER");
// })();
