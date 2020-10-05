const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new Schema({
    firstName: String,
    lastName: String,
    profileUrl: String,
});

// "profile" = collection name
mongoose.model("profile", profileSchema);
