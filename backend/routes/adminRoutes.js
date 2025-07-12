import express from "express"
import {
  getDashboardStats,
  getRecentActivities,
  getTopCourses,
  getMonthlyData,
} from "../controllers/admin/dashboardController.js"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"

const router = express.Router()

// All routes require authentication and admin privileges
router.use(protect)
router.use(adminOnly)

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats)
router.get("/dashboard/activities", getRecentActivities)
router.get("/dashboard/top-courses", getTopCourses)
router.get("/dashboard/monthly-data", getMonthlyData)

export default router
