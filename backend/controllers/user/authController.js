import User from "../../models/User.js"
import jwt from "jsonwebtoken"

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "saralsikshya2024", {
    expiresIn: "30d",
  })
}

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Check if phone already exists
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
    })

    if (user) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: generateToken(user._id),
      })
    }
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    })
  }
}

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("Login attempt:", { email, password: "***" })

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password")

    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      })
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password)
    console.log("Password match:", isPasswordMatch)

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Login successful
    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id),
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
}

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses.course")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        enrolledCourses: user.enrolledCourses,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } })
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        })
      }
    }

    user.name = name || user.name
    user.phone = phone || user.phone

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
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
