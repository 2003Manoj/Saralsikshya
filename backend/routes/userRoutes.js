// import express from "express"
// import { registerUser, loginUser, getUserProfile, updateUserProfile } from "../controllers/user/authController.js"
// import { protect } from "../middlewares/authMiddleware.js"

// const router = express.Router()

// // Public routes
// router.post("/register", registerUser)
// router.post("/login", loginUser)

// // Protected routes
// router.get("/profile", protect, getUserProfile)
// router.put("/profile", protect, updateUserProfile)

// export default router
import express from "express"
import { 
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from "../controllers/admin/adminController.js"
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} from "../controllers/user/authController.js"
import { protect, admin } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Public routes
router.post("/auth/register", registerUser)
router.post("/auth/login", loginUser)

// Protected user routes
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile)

// Admin-only user management routes (these match your frontend API calls)
router.get("/users", protect, admin, getAllUsers)
router.post("/users", protect, admin, createUser)  // Admin creates user
router.put("/users/:userId", protect, admin, updateUser)
router.delete("/users/:userId", protect, admin, deleteUser)
router.patch("/users/:userId/status", protect, admin, updateUserStatus)

export default router