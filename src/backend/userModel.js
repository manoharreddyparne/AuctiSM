const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  password: { type: String }, // ✅ Made optional (Google users don't need it)
  authProvider: { type: String, enum: ["manual", "google"], default: "manual" }, // ✅ Tracks user type
  googleId: { type: String },  // Optional for Google auth
  needsPassword: { type: Boolean, default: false }, // Tracks whether password is needed for Google users
});

// Hash password before saving (only if modified and not from Google auth)
userSchema.pre('save', async function (next) {
  // Hash the password only if it's being set and it's not a Google user
  if (this.authProvider === "manual" && this.isModified('password')) {
    // Hash the password only for manual users (not Google login users)
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare stored password (manual login)
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
