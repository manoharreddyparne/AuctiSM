const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    address: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    // Password is optional for Google users and not returned by default
    password: { type: String, select: false },
    authProvider: { type: String, enum: ["manual", "google"], default: "manual" },
    googleId: { type: String },
    needsPassword: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

// Pre-save hook: Hash the password if user is manual and the password field is modified
userSchema.pre("save", async function (next) {
  if (this.authProvider === "manual" && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Instance method to compare an entered password with the stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("Password not set for this user");
  }
  return bcrypt.compare(enteredPassword, this.password);
};

// Instance method to set a new password for a Google user (converting them to manual authentication)
userSchema.methods.setPassword = async function (newPassword) {
  this.password = await bcrypt.hash(newPassword, 10);
  this.needsPassword = false;  // Mark that the password is now set
  this.authProvider = "manual"; // Convert the user to manual authentication
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
