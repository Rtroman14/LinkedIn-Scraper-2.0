const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new Schema({
    firstName: String,
    lastName: String,
    job: String,
    city: String,
    company: String,
    email: String,
    phone: String,
    profileUrl: String,
    connected: String,
    birthday: String,
    airtableRecordID: { type: String, default: "" },
});

mongoose.model("profile", profileSchema);
