import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Admin from "../models/Admin.js"

// Protect routes - general authentication
export const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      let user

      // First try to find in User collection
      user = await User.findById(decoded.id).select("-password")

      // If not found in User collection, try Admin collection
      if (!user) {
        user = await Admin.findById(decoded.id).select("-password")
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        })
      }

      req.user = user
      next()
    } catch (error) {
      console.error("Token verification error:", error)
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    })
  }
}

// Admin only access
export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "super_admin")) {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    })
  }
}

// Super admin only access
export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "super_admin") {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin privileges required.",
    })
  }
}

// Check permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === "super_admin") {
      return next()
    }
    if (req.user.permissions && (req.user.permissions.includes(permission) || req.user.permissions.includes("all"))) {
      return next()
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. ${permission} permission required.`,
    })
  }
}

// Generate JWT token
export const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  })
}
