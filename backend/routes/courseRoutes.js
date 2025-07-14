import express from "express"
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  getCategories,
  getCourseStats,
  addCourseReview,
  getFeaturedCourses,
  upload,
} from "../controllers/admin/courseController.js"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
import { createLimiter } from "../middlewares/securityMiddleware.js"
import {
  validateObjectId,
  validatePagination,
  validateCourseCreationEnhanced,
  validateCourseUpdateEnhanced,
} from "../middlewares/validationMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", validatePagination, getCourses)
router.get("/featured", getFeaturedCourses)
router.get("/categories", getCategories)
router.get("/:id", validateObjectId, getCourseById)

// Protected routes (require authentication)
router.post("/:id/reviews", protect, validateObjectId, addCourseReview)

// Admin only routes
router.post(
  "/",
  protect,
  adminOnly,
  createLimiter,
  upload.single("courseImage"),
  validateCourseCreationEnhanced,
  createCourse,
)
router.get("/admin/stats", protect, adminOnly, getCourseStats)
router
  .route("/:id")
  .put(protect, adminOnly, validateObjectId, upload.single("courseImage"), validateCourseUpdateEnhanced, updateCourse)
  .delete(protect, adminOnly, validateObjectId, deleteCourse)

router.patch("/:id/status", protect, adminOnly, validateObjectId, toggleCourseStatus)

export default router
