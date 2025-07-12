import User from "../../models/User.js"
import Course from "../../models/Course.js"
import { asyncHandler } from "../../middlewares/errorMiddleware.js"

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get current date and calculate periods
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  // Basic counts
  const totalUsers = await User.countDocuments()
  const totalCourses = await Course.countDocuments()
  const activeEnrollments = await User.aggregate([{ $unwind: "$enrolledCourses" }, { $count: "total" }])

  // Calculate total revenue
  const revenueData = await Course.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalRevenue" },
      },
    },
  ])

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0

  // Growth calculations
  const usersLastMonth = await User.countDocuments({
    createdAt: { $gte: lastMonth },
  })
  const coursesLastMonth = await Course.countDocuments({
    createdAt: { $gte: lastMonth },
  })

  const usersLastYear = await User.countDocuments({
    createdAt: { $gte: lastYear, $lt: lastMonth },
  })
  const coursesLastYear = await Course.countDocuments({
    createdAt: { $gte: lastYear, $lt: lastMonth },
  })

  // Calculate growth percentages
  const userGrowth = usersLastYear > 0 ? ((usersLastMonth / usersLastYear) * 100).toFixed(1) : 0
  const courseGrowth = coursesLastYear > 0 ? ((coursesLastMonth / coursesLastYear) * 100).toFixed(1) : 0

  // Revenue growth (mock calculation - you can implement based on your payment system)
  const revenueGrowth = 15.8 // This should be calculated based on actual payment data

  // Enrollment growth
  const enrollmentsLastMonth = await User.aggregate([
    { $unwind: "$enrolledCourses" },
    { $match: { "enrolledCourses.enrolledAt": { $gte: lastMonth } } },
    { $count: "total" },
  ])

  const enrollmentsLastYear = await User.aggregate([
    { $unwind: "$enrolledCourses" },
    {
      $match: {
        "enrolledCourses.enrolledAt": {
          $gte: lastYear,
          $lt: lastMonth,
        },
      },
    },
    { $count: "total" },
  ])

  const currentEnrollments = enrollmentsLastMonth.length > 0 ? enrollmentsLastMonth[0].total : 0
  const previousEnrollments = enrollmentsLastYear.length > 0 ? enrollmentsLastYear[0].total : 0
  const enrollmentGrowth = previousEnrollments > 0 ? ((currentEnrollments / previousEnrollments) * 100).toFixed(1) : 0

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalCourses,
      totalRevenue,
      activeEnrollments: activeEnrollments.length > 0 ? activeEnrollments[0].total : 0,
      userGrowth: Number.parseFloat(userGrowth),
      courseGrowth: Number.parseFloat(courseGrowth),
      revenueGrowth: Number.parseFloat(revenueGrowth),
      enrollmentGrowth: Number.parseFloat(enrollmentGrowth),
    },
  })
})

// @desc    Get recent activities
// @route   GET /api/admin/dashboard/activities
// @access  Private/Admin
export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 10

  // Get recent user registrations
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt")

  // Get recent course enrollments
  const recentEnrollments = await User.aggregate([
    { $unwind: "$enrolledCourses" },
    { $sort: { "enrolledCourses.enrolledAt": -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses.course",
        foreignField: "_id",
        as: "courseInfo",
      },
    },
    {
      $project: {
        name: 1,
        enrolledAt: "$enrolledCourses.enrolledAt",
        courseTitle: { $arrayElemAt: ["$courseInfo.title", 0] },
      },
    },
  ])

  // Get recent courses
  const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(3).select("title instructor createdAt")

  // Format activities
  const activities = []

  // Add user registrations
  recentUsers.forEach((user) => {
    activities.push({
      id: user._id,
      type: "user_registration",
      user: user.name,
      action: "registered for an account",
      time: getTimeAgo(user.createdAt),
      icon: "UserPlus",
      color: "blue",
    })
  })

  // Add course enrollments
  recentEnrollments.forEach((enrollment) => {
    activities.push({
      id: enrollment._id,
      type: "course_enrollment",
      user: enrollment.name,
      action: `enrolled in "${enrollment.courseTitle}"`,
      time: getTimeAgo(enrollment.enrolledAt),
      icon: "BookPlus",
      color: "green",
    })
  })

  // Add course creations
  recentCourses.forEach((course) => {
    activities.push({
      id: course._id,
      type: "course_creation",
      user: "Admin",
      action: `created new course "${course.title}"`,
      time: getTimeAgo(course.createdAt),
      icon: "BookOpen",
      color: "indigo",
    })
  })

  // Sort by time and limit
  activities.sort((a, b) => new Date(b.time) - new Date(a.time))
  const limitedActivities = activities.slice(0, limit)

  res.json({
    success: true,
    activities: limitedActivities,
  })
})

// @desc    Get top performing courses
// @route   GET /api/admin/dashboard/top-courses
// @access  Private/Admin
export const getTopCourses = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 4

  const topCourses = await Course.find({ isActive: true })
    .sort({ enrolledStudents: -1, rating: -1 })
    .limit(limit)
    .select("title instructor enrolledStudents rating totalRevenue")

  // Calculate progress (mock data - you can implement based on completion rates)
  const coursesWithProgress = topCourses.map((course) => ({
    id: course._id,
    title: course.title,
    instructor: course.instructor.name,
    enrollments: course.enrolledStudents,
    rating: course.rating,
    revenue: course.totalRevenue,
    progress: Math.floor(Math.random() * 30) + 70, // Mock progress 70-100%
  }))

  res.json({
    success: true,
    courses: coursesWithProgress,
  })
})

// @desc    Get monthly data for charts
// @route   GET /api/admin/dashboard/monthly-data
// @access  Private/Admin
export const getMonthlyData = asyncHandler(async (req, res) => {
  const months = 6
  const monthlyData = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    // Get users count for this month
    const usersCount = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })

    // Get courses count for this month
    const coursesCount = await Course.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })

    // Mock revenue data (implement based on your payment system)
    const revenue = Math.floor(Math.random() * 15000) + 8000

    monthlyData.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      users: usersCount,
      courses: coursesCount,
      revenue: revenue,
    })
  }

  res.json({
    success: true,
    data: monthlyData,
  })
})

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date()
  const diffInMs = now - new Date(date)
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}
