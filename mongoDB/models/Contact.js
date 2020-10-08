const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
    firstName: String,
    lastName: String,
    profileUrl: String,
});

mongoose.model("contact", contactSchema);
