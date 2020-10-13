const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
    name: String,
    profileUrl: String,
});

mongoose.model("contact", contactSchema);
