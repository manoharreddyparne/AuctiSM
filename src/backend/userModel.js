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
    password: { type: String, select: false }, // Password should not be selected unless explicitly needed
    authProvider: { type: String, enum: ["manual", "google"], default: "manual" },
    googleId: { type: String },
    needsPassword: { type: Boolean, default: false }, // Flag for Google users to set password
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

// Pre-save hook: Hash the password if the user is manual and the password field is modified
userSchema.pre("save", async function (next) {
  if (this.authProvider === "manual" && this.isModified("password")) {
    // Hash the password only for manual users
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

// Instance method to set a new password (for Google users)
userSchema.methods.setPassword = async function (newPassword) {
  this.password = await bcrypt.hash(newPassword, 10); // Hash the new password
  this.needsPassword = false;  // Set the flag to false after setting the password
  this.authProvider = "manual"; // Change auth provider to manual after password is set
  await this.save(); // Save the updated user
};

module.exports = mongoose.model("User", userSchema);
