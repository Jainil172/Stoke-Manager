const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: "Account created successfully. Please sign in.",
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.loginUser(req.body);

  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, token, user });
});

const profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, message: "Profile updated successfully", user });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, {
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });
  res.json({ success: true, message: "Password changed successfully" });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user.id);
  res.clearCookie("access_token");
  res.json({ success: true, message: "Account deleted successfully" });
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await authService.getSettings(req.user.id);
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await authService.updateSettings(req.user.id, req.body);
  res.json({ success: true, message: "Settings updated successfully", settings });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = authService.requestPasswordReset(req.body.email);
  res.json({ success: true, ...result });
});

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  changePassword,
  deleteAccount,
  getSettings,
  updateSettings,
  forgotPassword,
};
