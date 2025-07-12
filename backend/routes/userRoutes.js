import express from "express"
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  enrollUserInCourse,
} from "../controllers/admin/userController.js"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
import { createLimiter } from "../middlewares/securityMiddleware.js"
import {
  validateUserRegistration,
  validateUserUpdate,
  validateObjectId,
  validatePagination,
} from "../middlewares/validationMiddleware.js"

const router = express.Router()

// All routes require authentication and admin privileges
router.use(protect)
router.use(adminOnly)

// User management routes
router.route("/").get(validatePagination, getUsers).post(createLimiter, validateUserRegistration, createUser)

router.get("/stats", getUserStats)

router
  .route("/:id")
  .get(validateObjectId, getUserById)
  .put(validateObjectId, validateUserUpdate, updateUser)
  .delete(validateObjectId, deleteUser)

router.patch("/:id/status", validateObjectId, toggleUserStatus)
router.post("/:id/enroll", validateObjectId, enrollUserInCourse)

export default router
