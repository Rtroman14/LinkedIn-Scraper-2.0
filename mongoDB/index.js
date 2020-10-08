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
        }).save();

        return user;
    }

    async updateUserField(client, attributes) {
        const existingUser = await User.findOne({ client });

        return await User.findByIdAndUpdate(existingUser._id, attributes, { new: true });
    }

    async addConnection(client, contact) {
        const existingUser = await User.findOne({ client });

        const existingConnection = await Connection.findOne({ _user: existingUser._id });

        await existingConnection.connections.push(contact);

        await existingConnection.save();
    }
}

module.exports = new MongoDB();
