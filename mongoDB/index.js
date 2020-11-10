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

                    console.log("Updated user =", attributes);
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

    async addLastConnections(client, contact) {
        try {
            const existingConnection = await this.getUserConnection(client);

            const newContact = new Contact(contact);

            await existingConnection.lastConnections.shift();
            await existingConnection.lastConnections.push(newContact);
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

            await existingConnection.connectionsProfile.push(newProfile);
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

            if (!nextConnection) {
                return false;
            }

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

            return existingConnection.lastConnections;
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

    async findProfile(client, profile) {
        try {
            const existingConnection = await this.getUserConnection(client);

            return await existingConnection.connections.pull(profile);
        } catch (error) {
            console.log("ERROR FINDING ONE ---", error);
        }
    }
}

module.exports = new MongoDB();
