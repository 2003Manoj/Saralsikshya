import express from "express"
import { getCourses, getCourseById } from "../controllers/admin/courseController.js"

const router = express.Router()

// Public routes
router.route("/").get(getCourses)
router.route("/:id").get(getCourseById)

export default router
