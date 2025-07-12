import Course from "../../models/Course.js"
import User from "../../models/User.js"
import { asyncHandler } from "../../middlewares/errorMiddleware.js"

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const search = req.query.search || ""
  const category = req.query.category || ""
  const subCategory = req.query.subCategory || ""
  const level = req.query.level || ""
  const isActive = req.query.isActive
  const sortBy = req.query.sortBy || "createdAt"
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

  // Build query
  const query = {}

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "instructor.name": { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ]
  }

  if (category) {
    query.category = category
  }

  if (subCategory) {
    query.subCategory = subCategory
  }

  if (level) {
    query.level = level
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true"
  }

  // Execute query with pagination
  const courses = await Course.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("reviews.user", "name")

  const total = await Course.countDocuments(query)

  res.json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("reviews.user", "name avatar")

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
})

// @desc    Create course (Admin only)
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res) => {
  const courseData = {
    ...req.body,
    createdBy: req.user._id,
  }

  const course = await Course.create(courseData)

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: course,
  })
})

// @desc    Update course (Admin only)
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Update course
  course = await Course.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastUpdated: new Date() },
    { new: true, runValidators: true },
  )

  res.json({
    success: true,
    message: "Course updated successfully",
    data: course,
  })
})

// @desc    Delete course (Admin only)
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if course has enrolled students
  const enrolledCount = await User.countDocuments({
    "enrolledCourses.course": req.params.id,
  })

  if (enrolledCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete course. ${enrolledCount} students are enrolled.`,
    })
  }

  await Course.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: "Course deleted successfully",
  })
})

// @desc    Toggle course status (Admin only)
// @route   PATCH /api/courses/:id/status
// @access  Private/Admin
export const toggleCourseStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  const course = await Course.findById(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  course.isActive = isActive
  course.lastUpdated = new Date()
  await course.save()

  res.json({
    success: true,
    message: `Course ${isActive ? "activated" : "deactivated"} successfully`,
    data: course,
  })
})

// @desc    Get course categories
// @route   GET /api/courses/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$category",
        subCategories: { $addToSet: "$subCategory" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  res.json({
    success: true,
    data: categories,
  })
})

// @desc    Get course statistics (Admin only)
// @route   GET /api/courses/stats
// @access  Private/Admin
export const getCourseStats = asyncHandler(async (req, res) => {
  const totalCourses = await Course.countDocuments()
  const activeCourses = await Course.countDocuments({ isActive: true })
  const inactiveCourses = await Course.countDocuments({ isActive: false })

  // Get courses by category
  const coursesByCategory = await Course.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalRevenue" },
        totalEnrollments: { $sum: "$enrolledStudents" },
      },
    },
    { $sort: { count: -1 } },
  ])

  // Get courses by level
  const coursesByLevel = await Course.aggregate([
    {
      $group: {
        _id: "$level",
        count: { $sum: 1 },
      },
    },
  ])

  // Get top performing courses
  const topCourses = await Course.find({ isActive: true })
    .sort({ enrolledStudents: -1, rating: -1 })
    .limit(10)
    .select("title instructor enrolledStudents rating totalRevenue")

  // Get course creation trend (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const courseGrowth = await Course.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ])

  res.json({
    success: true,
    stats: {
      totalCourses,
      activeCourses,
      inactiveCourses,
      coursesByCategory,
      coursesByLevel,
      topCourses,
      courseGrowth,
    },
  })
})

// @desc    Add review to course
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addCourseReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  const courseId = req.params.id

  const course = await Course.findById(courseId)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if user is enrolled in the course
  const user = await User.findById(req.user._id)
  const isEnrolled = user.enrolledCourses.some((enrollment) => enrollment.course.toString() === courseId)

  if (!isEnrolled) {
    return res.status(400).json({
      success: false,
      message: "You must be enrolled in this course to leave a review",
    })
  }

  // Check if user already reviewed
  const alreadyReviewed = course.reviews.find((review) => review.user.toString() === req.user._id.toString())

  if (alreadyReviewed) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this course",
    })
  }

  // Add review
  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment,
    isApproved: false, // Reviews need admin approval
  }

  course.reviews.push(review)
  course.calculateAverageRating()
  await course.save()

  res.status(201).json({
    success: true,
    message: "Review added successfully. It will be visible after admin approval.",
  })
})

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
export const getFeaturedCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ rating: -1, enrolledStudents: -1 })
    .limit(6)

  res.json({
    success: true,
    data: courses,
  })
})
