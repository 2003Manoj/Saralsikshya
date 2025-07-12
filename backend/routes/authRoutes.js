import express from "express"
import {
  registerUser,
  loginUser,
  loginAdmin,
  getProfile,
  updateProfile,
  logout,
} from "../controllers/user/authController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { authLimiter } from "../middlewares/securityMiddleware.js"
import { validateUserRegistration, validateLogin } from "../middlewares/validationMiddleware.js"

const router = express.Router()

// Public routes
router.post("/register", authLimiter, validateUserRegistration, registerUser)
router.post("/login", authLimiter, validateLogin, loginUser)
router.post("/admin/login", authLimiter, validateLogin, loginAdmin)

// Protected routes
router.get("/profile", protect, getProfile)
router.put("/profile", protect, updateProfile)
router.post("/logout", protect, logout)

export default router
