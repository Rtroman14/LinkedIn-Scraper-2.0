const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContactSchema = require("./Contact");
const ProfileSchema = require("./Profile");

const connectionSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: "User" },
    connectionsInfo: [ContactSchema],
    connectionsProfile: [ProfileSchema],
});

// "connections" = collection name
mongoose.model("connections", userSchema);
