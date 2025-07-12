import User from "../../models/User.js"
import Admin from "../../models/Admin.js"
import { generateToken } from "../../middlewares/authMiddleware.js"
import { asyncHandler } from "../../middlewares/errorMiddleware.js"
import crypto from "crypto"

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = "user" } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    })
  }

  // Check phone number uniqueness
  const phoneExists = await User.findOne({ phone })
  if (phoneExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this phone number",
    })
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  })

  if (user) {
    // Generate email verification token
    const emailToken = crypto.randomBytes(20).toString("hex")
    user.emailVerificationToken = crypto.createHash("sha256").update(emailToken).digest("hex")

    await user.save()

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token: generateToken(user._id, user.role),
    })
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid user data",
    })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: "Account temporarily locked due to too many failed login attempts",
    })
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact support.",
    })
  }

  // Check password
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts()
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts()
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  res.json({
    success: true,
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    },
    token: generateToken(user._id, user.role),
  })
})

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for admin
  const admin = await Admin.findOne({ email }).select("+password")

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Check if account is locked
  if (admin.isLocked) {
    return res.status(423).json({
      success: false,
      message: "Account temporarily locked due to too many failed login attempts",
    })
  }

  // Check if account is active
  if (!admin.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact support.",
    })
  }

  // Check password
  const isMatch = await admin.comparePassword(password)

  if (!isMatch) {
    await admin.incLoginAttempts()
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Update last login
  admin.lastLogin = new Date()
  await admin.save()

  res.json({
    success: true,
    message: "Admin login successful",
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
    },
    token: generateToken(admin._id, admin.role),
  })
})

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      ...(user.enrolledCourses && { enrolledCourses: user.enrolledCourses }),
    },
  })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    })
  } else {
    res.status(404).json({
      success: false,
      message: "User not found",
    })
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  })
})
