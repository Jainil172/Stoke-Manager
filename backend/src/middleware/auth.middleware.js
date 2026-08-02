const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

function extractToken(req) {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }
  return req.cookies && req.cookies.access_token;
}

function authMiddleware(req, _res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(new ApiError(401, "Authentication required. Please sign in."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token. Please sign in again."));
  }
}

module.exports = authMiddleware;
