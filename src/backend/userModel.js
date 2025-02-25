const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" }, // Phone is now optional for Google users
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  profilePicture: { type: String, default: "" }, // ✅ Added profile picture field for Google users
  password: { type: String, required: true }, // Required but will have "google-auth" for Google users
});

// Hash password before saving (only if modified)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.password === "google-auth") return next(); 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare stored password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
