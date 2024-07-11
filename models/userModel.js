const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
    {
        companyName: { type: String, required: true, unique: true },
        clientID: { type: String, required: true },
        clientSecret: { type: String, required: true },
        ownerName: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        rollNo: { type: String, required: true }
      }

)

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('clientSecret')) {
      user.clientSecret = await bcrypt.hash(user.clientSecret, 10);
    }
    next();
  });

module.exports = mongoose.model("User", userSchema);