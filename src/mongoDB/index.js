const User = mongoose.model("users");

class MongoDB {
    async findUser(obj) {
        return await User.findOne(obj);
    }
}

// const existingUser = await User.findOne({ googleId: profile.id });
// const user = await new User({ googleId: profile.id }).save();
