const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ── Email validation (mirrors the frontend rules) ──
// - username: letters, numbers, ., _, -, + (no spaces)
// - exactly one @
// - domain: letters/numbers/hyphens, must contain a dot, TLD at least 2 letters
const EMAIL_REGEX = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

function getEmailError(email) {
  if (!email || !email.trim()) {
    return "Email is required.";
  }

  const trimmed = email.trim();

  if (/\s/.test(trimmed)) {
    return "Email cannot contain spaces.";
  }
  if ((trimmed.match(/@/g) || []).length !== 1) {
    return "Email must contain exactly one '@'.";
  }

  const [username, domain] = trimmed.split("@");

  if (!username) {
    return "Email must have a username before '@'.";
  }
  if (!domain || !domain.includes(".")) {
    return "Email must have a valid domain (e.g. example.com).";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  return null;
}

// POST /api/auth/register
const register = async (req, res, next) => {
  console.log("REGISTER API HIT");
  console.log(req.body);

  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    // ── NEW: server-side email format validation ──
    const emailError = getEmailError(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const finalRole = ["user", "owner", "admin"].includes(role) ? role : "user";

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Only one admin allowed, mirrors the original frontend rule
    if (finalRole === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res
          .status(400)
          .json({ message: "Admin account already exists. Only one admin is allowed." });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: finalRole,
      approved: finalRole === "owner" ? false : true,
      notifications:
        finalRole === "owner"
          ? [{ message: "Your shop account is waiting for Admin approval." }]
          : [],
    });

    res.status(201).json({
      message:
        finalRole === "owner"
          ? "Registration successful! Your Shop Owner account is waiting for Admin approval."
          : "Registration successful!",
      user: user.toSafeObject(),
    });
  } catch (err) {
    // ── NEW: catch MongoDB duplicate-key errors (race condition safety net) ──
    // This covers the rare case where two requests for the same email
    // both pass the findOne() check before either create() finishes.
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: "Email already registered." });
    }

    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password. Please try again." });
    }

    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected) - lets the frontend refresh role/approval status
const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

module.exports = { register, login, getMe };