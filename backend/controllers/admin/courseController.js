// import Course from "../models/Course.js"
import Course from "../../models/Course.js"

import asyncHandler from "express-async-handler"

// @desc    Get all courses with filtering and search
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const { search, category, level, page = 1, limit = 10 } = req.query

  // Build query object
  const query = {}

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "instructor.name": { $regex: search, $options: "i" } },
    ]
  }

  // Filter by category
  if (category) {
    query.category = category
  }

  // Filter by level
  if (level) {
    query.level = level
  }

  // Only show active courses for public access
  query.isActive = true

  try {
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Course.countDocuments(query)

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    })
  }
})

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message,
    })
  }
})

// @desc    Get all courses for admin (including inactive)
// @route   GET /api/admin/courses
// @access  Private/Admin
export const getAdminCourses = asyncHandler(async (req, res) => {
  const { search, category, level, page = 1, limit = 10 } = req.query

  // Build query object
  const query = {}

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "instructor.name": { $regex: search, $options: "i" } },
    ]
  }

  // Filter by category
  if (category) {
    query.category = category
  }

  // Filter by level
  if (level) {
    query.level = level
  }

  try {
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Course.countDocuments(query)

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    })
  }
})

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res) => {
  try {
    const course = await Course.create(req.body)

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    })
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    })
  }
})

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
export const updateCourse = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Error updating course",
      error: error.message,
    })
  }
})

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    await Course.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting course",
      error: error.message,
    })
  }
})

// @desc    Toggle course status (active/inactive)
// @route   PATCH /api/admin/courses/:id/status
// @access  Private/Admin
export const toggleCourseStatus = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    course.isActive = req.body.isActive !== undefined ? req.body.isActive : !course.isActive

    await course.save()

    res.json({
      success: true,
      message: `Course ${course.isActive ? "activated" : "deactivated"} successfully`,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating course status",
      error: error.message,
    })
  }
})

// @desc    Get course statistics
// @route   GET /api/admin/courses/stats
// @access  Private/Admin
export const getCourseStats = asyncHandler(async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments()
    const activeCourses = await Course.countDocuments({ isActive: true })
    const inactiveCourses = await Course.countDocuments({ isActive: false })

    const categoryStats = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const levelStats = await Course.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const totalEnrollments = await Course.aggregate([{ $group: { _id: null, total: { $sum: "$enrolledStudents" } } }])

    res.json({
      success: true,
      data: {
        totalCourses,
        activeCourses,
        inactiveCourses,
        categoryStats,
        levelStats,
        totalEnrollments: totalEnrollments[0]?.total || 0,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching course statistics",
      error: error.message,
    })
  }
})
