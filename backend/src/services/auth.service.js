const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const UserModel = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

const BCRYPT_ROUNDS = 10;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await UserModel.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await UserModel.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return user;
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await UserModel.findByEmail(normalizedEmail);
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken(user.id);
  const { password: _password, ...safeUser } = user;
  return { token, user: safeUser };
}

async function getProfile(userId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
}

async function updateProfile(userId, fields) {
  const current = await UserModel.findById(userId);
  if (!current) {
    throw new ApiError(404, "User not found.");
  }

  const updates = {
    name: fields.name !== undefined ? fields.name.trim() : undefined,
    email: fields.email !== undefined ? normalizeEmail(fields.email) : undefined,
    phone: fields.phone !== undefined ? fields.phone.trim() : undefined,
    location: fields.location !== undefined ? fields.location.trim() : undefined,
    bio: fields.bio !== undefined ? fields.bio.trim() : undefined,
  };

  if (updates.email !== undefined && updates.email !== current.email) {
    const existing = await UserModel.findByEmail(updates.email);
    if (existing && existing.id !== userId) {
      throw new ApiError(409, "An account with this email already exists.");
    }
  }

  const user = await UserModel.updateProfile(userId, updates);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const [rows] = await pool.query(
    "SELECT password FROM users WHERE id = ? LIMIT 1",
    [userId]
  );
  const user = rows[0];
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await UserModel.updatePassword(userId, hashedPassword);
}

async function deleteAccount(userId) {
  const removed = await UserModel.remove(userId);
  if (!removed) {
    throw new ApiError(404, "User not found.");
  }
}

function requestPasswordReset() {
  return { message: "If an account exists with that email, a password reset link has been sent." };
}

async function getSettings(userId) {
  return UserModel.getSettings(userId);
}

async function updateSettings(userId, fields) {
  const allowed = ["lowStockAlerts", "weeklyDigest", "orderUpdates", "language", "currency"];
  const entries = Object.entries(fields).filter(
    ([key]) => allowed.includes(key) && fields[key] !== undefined
  );

  if (entries.length === 0) {
    throw new ApiError(400, "No valid settings provided.");
  }

  const values = Object.fromEntries(entries);
  const booleans = ["lowStockAlerts", "weeklyDigest", "orderUpdates"];
  for (const key of booleans) {
    if (values[key] !== undefined) {
      values[key] = Boolean(values[key]) ? 1 : 0;
    }
  }

  return UserModel.updateSettings(userId, values);
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getSettings,
  updateSettings,
  requestPasswordReset,
};
