const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
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
});

// "contact" = collection name
mongoose.model("contact", contactSchema);
