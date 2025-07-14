import Course from "../../models/Course.js"
import User from "../../models/User.js"
import { asyncHandler } from "../../middlewares/errorMiddleware.js"
import multer from "multer"
import path from "path"
import fs from "fs"

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/courses"
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "course-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Helper function to get full URL for uploaded files
const getImageUrl = (req, filename) => {
  if (!filename) return ""

  // If it's already a full URL, return as is
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename
  }

  // If it's a relative path, convert to full URL
  const baseUrl = `${req.protocol}://${req.get("host")}`

  // Remove leading slash if present
  const cleanPath = filename.startsWith("/") ? filename.substring(1) : filename

  return `${baseUrl}/${cleanPath}`
}

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
      { curriculum: { $in: [new RegExp(search, "i")] } },
      { routine: { $in: [new RegExp(search, "i")] } },
      { "overview.description": { $regex: search, $options: "i" } },
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

  // Convert relative image paths to full URLs
  const coursesWithFullUrls = courses.map((course) => {
    const courseObj = course.toObject()
    if (courseObj.courseImage) {
      courseObj.courseImage = getImageUrl(req, courseObj.courseImage)
    }
    if (courseObj.image) {
      courseObj.image = getImageUrl(req, courseObj.image)
    }
    return courseObj
  })

  const total = await Course.countDocuments(query)

  res.json({
    success: true,
    data: coursesWithFullUrls,
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

  // Convert relative image paths to full URLs
  const courseObj = course.toObject()
  if (courseObj.courseImage) {
    courseObj.courseImage = getImageUrl(req, courseObj.courseImage)
  }
  if (courseObj.image) {
    courseObj.image = getImageUrl(req, courseObj.image)
  }

  res.json({
    success: true,
    data: courseObj,
  })
})

// @desc    Create course (Admin only)
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res) => {
  const courseData = { ...req.body }

  // Handle file upload
  if (req.file) {
    // Store relative path in database
    courseData.courseImage = `uploads/courses/${req.file.filename}`
    console.log("File uploaded:", courseData.courseImage)
  } else if (courseData.courseImage) {
    // If URL is provided, keep it as is
    console.log("Image URL provided:", courseData.courseImage)
  } else {
    // Set empty string if no image
    courseData.courseImage = ""
    console.log("No image provided")
  }

  // Parse JSON fields if they come as strings (from FormData)
  const jsonFields = ["overview", "instructor", "tags", "requirements", "whatYouWillLearn", "curriculum", "routine"]

  jsonFields.forEach((field) => {
    if (typeof courseData[field] === "string") {
      try {
        courseData[field] = JSON.parse(courseData[field])
      } catch (error) {
        console.log(`Failed to parse ${field}:`, error.message)
      }
    }
  })

  // Process curriculum and routine if they come as strings
  const processedCurriculum = Array.isArray(courseData.curriculum)
    ? courseData.curriculum
    : courseData.curriculum
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item) || []

  const processedRoutine = Array.isArray(courseData.routine)
    ? courseData.routine
    : courseData.routine
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item) || []

  // Process tags, requirements, whatYouWillLearn
  const processedTags = Array.isArray(courseData.tags)
    ? courseData.tags
    : courseData.tags
        ?.split(",")
        .map((item) => item.trim())
        .filter((item) => item) || []

  const processedRequirements = Array.isArray(courseData.requirements)
    ? courseData.requirements
    : courseData.requirements
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item) || []

  const processedWhatYouWillLearn = Array.isArray(courseData.whatYouWillLearn)
    ? courseData.whatYouWillLearn
    : courseData.whatYouWillLearn
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item) || []

  // Ensure overview has default values
  const processedOverview = {
    dailyLiveClasses: false,
    freeVideos: false,
    freeNotes: false,
    weeklyClass: false,
    askToGurusFeature: false,
    description: "",
    ...courseData.overview,
  }

  // Ensure instructor has default values
  const processedInstructor = {
    name: "",
    bio: "",
    image: "",
    ...courseData.instructor,
  }

  const finalCourseData = {
    ...courseData,
    overview: processedOverview,
    instructor: processedInstructor,
    curriculum: processedCurriculum,
    routine: processedRoutine,
    tags: processedTags,
    requirements: processedRequirements,
    whatYouWillLearn: processedWhatYouWillLearn,
    createdBy: req.user._id,
    courseImage: courseData.courseImage || "",
  }

  console.log("Final course data courseImage:", finalCourseData.courseImage)

  const course = await Course.create(finalCourseData)

  // Convert relative image path to full URL for response
  const courseObj = course.toObject()
  if (courseObj.courseImage) {
    courseObj.courseImage = getImageUrl(req, courseObj.courseImage)
  }

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: courseObj,
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

  const courseData = { ...req.body }

  // Handle file upload
  if (req.file) {
    // Delete old image if it exists and is a local file
    if (course.courseImage && course.courseImage.startsWith("uploads/")) {
      const oldImagePath = path.join(process.cwd(), course.courseImage)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
    }
    // Store relative path in database
    courseData.courseImage = `uploads/courses/${req.file.filename}`
    console.log("File uploaded for update:", courseData.courseImage)
  } else if (courseData.courseImage !== undefined) {
    // If URL is provided or explicitly set to empty, use it
    console.log("Image URL provided for update:", courseData.courseImage)
  }

  // Parse JSON fields if they come as strings (from FormData)
  const jsonFields = ["overview", "instructor", "tags", "requirements", "whatYouWillLearn", "curriculum", "routine"]

  jsonFields.forEach((field) => {
    if (typeof courseData[field] === "string") {
      try {
        courseData[field] = JSON.parse(courseData[field])
      } catch (error) {
        console.log(`Failed to parse ${field}:`, error.message)
      }
    }
  })

  // Process curriculum and routine if they come as strings
  const processedCurriculum = Array.isArray(courseData.curriculum)
    ? courseData.curriculum
    : courseData.curriculum
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item)

  const processedRoutine = Array.isArray(courseData.routine)
    ? courseData.routine
    : courseData.routine
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item)

  // Process tags, requirements, whatYouWillLearn
  const processedTags = Array.isArray(courseData.tags)
    ? courseData.tags
    : courseData.tags
        ?.split(",")
        .map((item) => item.trim())
        .filter((item) => item) || []

  const processedRequirements = Array.isArray(courseData.requirements)
    ? courseData.requirements
    : courseData.requirements
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item) || []

  const processedWhatYouWillLearn = Array.isArray(courseData.whatYouWillLearn)
    ? courseData.whatYouWillLearn
    : courseData.whatYouWillLearn
        ?.split("\n")
        .map((item) => item.trim())
        .filter((item) => item) || []

  // Merge overview with existing data
  const processedOverview = courseData.overview
    ? {
        ...course.overview,
        ...courseData.overview,
      }
    : course.overview

  // Merge instructor with existing data
  const processedInstructor = courseData.instructor
    ? {
        ...course.instructor,
        ...courseData.instructor,
      }
    : course.instructor

  const updateData = {
    ...courseData,
    lastUpdated: new Date(),
  }

  // Only update fields that are provided
  if (processedOverview) updateData.overview = processedOverview
  if (processedInstructor) updateData.instructor = processedInstructor
  if (processedCurriculum !== undefined) updateData.curriculum = processedCurriculum
  if (processedRoutine !== undefined) updateData.routine = processedRoutine
  if (processedTags !== undefined) updateData.tags = processedTags
  if (processedRequirements !== undefined) updateData.requirements = processedRequirements
  if (processedWhatYouWillLearn !== undefined) updateData.whatYouWillLearn = processedWhatYouWillLearn

  // Explicitly handle courseImage
  if (courseData.courseImage !== undefined) {
    updateData.courseImage = courseData.courseImage
  }

  console.log("Update data courseImage:", updateData.courseImage)

  // Update course
  course = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })

  // Convert relative image path to full URL for response
  const courseObj = course.toObject()
  if (courseObj.courseImage) {
    courseObj.courseImage = getImageUrl(req, courseObj.courseImage)
  }

  res.json({
    success: true,
    message: "Course updated successfully",
    data: courseObj,
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

  // Delete course image if it exists and is a local file
  if (course.courseImage && course.courseImage.startsWith("uploads/")) {
    const imagePath = path.join(process.cwd(), course.courseImage)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }
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

  // Convert relative image path to full URL for response
  const courseObj = course.toObject()
  if (courseObj.courseImage) {
    courseObj.courseImage = getImageUrl(req, courseObj.courseImage)
  }

  res.json({
    success: true,
    message: `Course ${isActive ? "activated" : "deactivated"} successfully`,
    data: courseObj,
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

  // Get overview features statistics
  const overviewStats = await Course.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        dailyLiveClasses: { $sum: { $cond: ["$overview.dailyLiveClasses", 1, 0] } },
        freeVideos: { $sum: { $cond: ["$overview.freeVideos", 1, 0] } },
        freeNotes: { $sum: { $cond: ["$overview.freeNotes", 1, 0] } },
        weeklyClass: { $sum: { $cond: ["$overview.weeklyClass", 1, 0] } },
        askToGurusFeature: { $sum: { $cond: ["$overview.askToGurusFeature", 1, 0] } },
      },
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
      overviewStats: overviewStats[0] || {
        totalCourses: 0,
        dailyLiveClasses: 0,
        freeVideos: 0,
        freeNotes: 0,
        weeklyClass: 0,
        askToGurusFeature: 0,
      },
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

  // Convert relative image paths to full URLs
  const coursesWithFullUrls = courses.map((course) => {
    const courseObj = course.toObject()
    if (courseObj.courseImage) {
      courseObj.courseImage = getImageUrl(req, courseObj.courseImage)
    }
    if (courseObj.image) {
      courseObj.image = getImageUrl(req, courseObj.image)
    }
    return courseObj
  })

  res.json({
    success: true,
    data: coursesWithFullUrls,
  })
})
