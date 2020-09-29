const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    client: String,
    lastRun: { type: Date, default: Date.now },
    airtable: {
        base: String,
        projectName: String,
        baseName: String,
    },
    cookie: String,
    cookieStatus: Boolean,
    proxyUsername: String,
    proxyPassword: String,
    httpRequestCount: Number,
    connectionsInfo: [
        {
            firstName: String,
            lastName: String,
            job: String,
            city: String,
            company: String,
            email: String,
            phone: String,
            profileUrl: String,
            connected: String,
            birthday: String, // Date ???
        },
    ],
    connections: [
        {
            firstName: String,
            lastName: String,
            profileUrl: String,
        },
    ],
});

// "users" = collection name
mongoose.model("users", userSchema);

// USAGE
// const User = mongoose.model("users");
// const existingUser = await User.findOne({ googleId: profile.id });
// const user = await new User({ googleId: profile.id }).save();

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
