import User from "../../models/User.js"
import Course from "../../models/Course.js"
import { asyncHandler } from "../../middlewares/errorMiddleware.js"

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const search = req.query.search || ""
  const role = req.query.role || ""
  const isActive = req.query.isActive

  // Build query
  const query = {}

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ]
  }

  if (role) {
    query.role = role
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true"
  }

  // Execute query with pagination
  const users = await User.find(query)
    .populate("enrolledCourses.course", "title")
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await User.countDocuments(query)

  res.json({
    success: true,
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      limit,
    },
  })
})

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("enrolledCourses.course", "title instructor price")
    .select("-password")

  if (user) {
    res.json({
      success: true,
      user,
    })
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    })
  }
})

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = "user", isActive = true } = req.body

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email }, { phone }],
  })

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email or phone number",
    })
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    isActive,
    isEmailVerified: true, // Admin created users are pre-verified
  })

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  })
})

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Check if email is being changed and if it already exists
  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email })
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      })
    }
  }

  // Check if phone is being changed and if it already exists
  if (req.body.phone && req.body.phone !== user.phone) {
    const phoneExists = await User.findOne({ phone: req.body.phone })
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      })
    }
  }

  // Update fields
  const fieldsToUpdate = ["name", "email", "phone", "role", "isActive"]
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field]
    }
  })

  // Update password if provided
  if (req.body.password) {
    user.password = req.body.password
  }

  const updatedUser = await user.save()

  res.json({
    success: true,
    message: "User updated successfully",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      updatedAt: updatedUser.updatedAt,
    },
  })
})

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Prevent deletion of admin users by regular admins
  if (user.role === "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Cannot delete admin users",
    })
  }

  await User.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: "User deleted successfully",
  })
})

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  user.isActive = isActive
  await user.save()

  res.json({
    success: true,
    message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  })
})

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ isActive: true })
  const inactiveUsers = await User.countDocuments({ isActive: false })
  const adminUsers = await User.countDocuments({ role: "admin" })
  const regularUsers = await User.countDocuments({ role: "user" })

  // Get user growth data for last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const userGrowth = await User.aggregate([
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
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      regularUsers,
      userGrowth,
    },
  })
})

// @desc    Enroll user in course
// @route   POST /api/users/:id/enroll
// @access  Private/Admin
export const enrollUserInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body
  const userId = req.params.id

  const user = await User.findById(userId)
  const course = await Course.findById(courseId)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  // Check if already enrolled
  const alreadyEnrolled = user.enrolledCourses.some((enrollment) => enrollment.course.toString() === courseId)

  if (alreadyEnrolled) {
    return res.status(400).json({
      success: false,
      message: "User is already enrolled in this course",
    })
  }

  // Add enrollment
  user.enrolledCourses.push({
    course: courseId,
    enrolledAt: new Date(),
    progress: 0,
  })

  await user.save()

  // Update course enrollment count
  await course.updateEnrollmentCount()

  res.json({
    success: true,
    message: "User enrolled in course successfully",
  })
})
