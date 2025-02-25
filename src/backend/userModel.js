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
});

// Hash password before saving (only if modified and not from Google auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.authProvider === "google") return next(); 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare stored password (manual login)
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
