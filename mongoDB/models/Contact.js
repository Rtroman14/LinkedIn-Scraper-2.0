const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
    name: { type: String, default: "" },
    profileUrl: String,
});

mongoose.model("contact", contactSchema);
