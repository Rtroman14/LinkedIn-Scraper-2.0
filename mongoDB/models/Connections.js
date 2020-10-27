const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContactSchema = require("./Contact");
const ProfileSchema = require("./Profile");

const connectionSchema = new Schema(
    {
        _user: { type: Schema.Types.ObjectId, ref: "User" },
        account: String,
        connectionsProfile: [ProfileSchema],
        connections: [ContactSchema],
        lastConnections: [ContactSchema],
    },
    { minimize: false }
);

// "connections" = collection name
mongoose.model("connections", connectionSchema);
