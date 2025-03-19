const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  password: { type: String, select: false },
  authProvider: { type: String, enum: ["manual", "google"], default: "manual" },
  googleId: { type: String },
  needsPassword: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.authProvider === "manual" && this.isModified("password") && !this.password.startsWith("$2")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("Password not set for this user");
  }
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.setPassword = async function (newPassword) {
  this.password = newPassword;
  this.needsPassword = false;
  this.authProvider = "manual";
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
