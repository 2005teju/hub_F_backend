const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },

    // Owner accounts need admin approval before they can operate
    approved: { type: Boolean, default: true },

    // Login tracking (mirrors what the Admin dashboard displays)
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },

    notifications: [notificationSchema],
  },
  { timestamps: true }
);

// Hash password whenever it is set/changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Shape returned to the client - never leaks the password hash
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    approved: this.approved,
    loginCount: this.loginCount,
    lastLogin: this.lastLogin,
    notifications: this.notifications,
  };
};

module.exports = mongoose.model("User", userSchema);