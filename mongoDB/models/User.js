const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    client: String,
    lastRun: Date,
    cookie: String,
    cookieStatus: { type: Boolean, default: true },
    proxyUsername: String,
    proxyPassword: String,
    scriptMode: { type: String, default: "Initial" },
    httpRequestCount: { type: Number, default: 0 },
    airtableRecordID: { type: String, default: "" },
});

// "users" = collection name
mongoose.model("users", userSchema);

// USAGE
// const User = mongoose.model("users");
// const existingUser = await User.findOne({ googleId: profile.id });
// const user = await new User({ googleId: profile.id }).save();

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose

// https://www.udemy.com/course/node-with-react-fullstack-web-development/learn/lecture/7605216?start=225#questions
// Lesson 126 - goes into detail on configuring mongoDB documents

// https://www.udemy.com/course/node-with-react-fullstack-web-development/learn/lecture/7605218#questions
// Lesson 127 - creating SubDocs

// MongoDB Docs < 4MB
