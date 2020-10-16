require("dotenv").config();

const mongoose = require("mongoose");

require("./models/User");
require("./models/Contact");
require("./models/Profile");
require("./models/Connections");

const User = mongoose.model("users");
const Profile = mongoose.model("profile");
const Contact = mongoose.model("contact");
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

    async getUserConnection(client) {
        try {
            const user = await this.getUser(client);

            return await Connection.findOne({ _user: user._id });
        } catch (error) {
            console.log(`ERROR RETRIEVING USER'S CONNECTIONS: ${client} --- ${error}`);
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
        try {
            const existingConnection = await this.getUserConnection(client);

            const newContact = new Contact(contact);

            await existingConnection.connections.push(newContact);
            await existingConnection.save();

            return;
        } catch (error) {
            console.log("ERROR ADDING CONNECTION ---", error);
        }
    }

    async addProfile(client, profile) {
        try {
            const existingConnection = await this.getUserConnection(client);

            const newProfile = new Profile(profile);

            await existingConnection.connectionsData.push(newProfile);
            await existingConnection.save();

            console.log(`Scraped ${profile.profileUrl}`);

            return;
        } catch (error) {
            console.log("ERROR ADDING PROFILE ---", error);
        }
    }

    async getNextConnection(client) {
        try {
            const existingConnection = await this.getUserConnection(client);

            const nextConnection = existingConnection.connections.$pop();

            existingConnection.save();

            return nextConnection.profileUrl;
        } catch (error) {
            console.log("ERROR GETTING NEXT CONNECTION ---", error);

            return false;
        }
    }

    async getLastTwoConnections(client) {
        try {
            const existingConnection = await this.getUserConnection(client);

            return existingConnection.connections.slice(-2);
        } catch (error) {
            console.log("ERROR GETTING LAST TWO CONNECTIONS ---", error);
        }
    }

    async incrementHttpRequestCount(client) {
        const user = await this.getUser(client);

        await user.httpRequestCount++;

        await user.save();

        return user.httpRequestCount;
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
