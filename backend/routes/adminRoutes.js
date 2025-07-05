import express from "express"
import { 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getAdminCourses, 
  toggleCourseStatus, 
  getCourseStats 
} from "../controllers/admin/courseController.js"
import { 
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from "../controllers/admin/adminController.js"
import { validateCourse, validateCourseUpdate } from "../middlewares/validateCourse.js"
import { protect, admin } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Apply authentication middleware to all admin routes
router.use(protect)
router.use(admin)

// Course management routes
router.post("/courses", validateCourse, createCourse)
router.put("/courses/:id", validateCourseUpdate, updateCourse)
router.delete("/courses/:id", deleteCourse)
router.get("/courses", getAdminCourses)
router.patch("/courses/:id/status", toggleCourseStatus)
router.get("/courses/stats", getCourseStats)

// User management routes
router.get("/users", getAllUsers)
router.post("/users", createUser)  // For creating users via admin panel
router.put("/users/:userId", updateUser)
router.delete("/users/:userId", deleteUser)
router.patch("/users/:userId/status", updateUserStatus)

export default router