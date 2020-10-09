const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContactSchema = require("./Profile");
const ProfileSchema = require("./Contact");

const connectionSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: "User" },
    account: String,
    connectionsData: [ProfileSchema],
    connections: [ContactSchema],
});

// "connections" = collection name
mongoose.model("connections", connectionSchema);
