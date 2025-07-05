import User from "../../models/User.js"

// Get all users with search and pagination
export const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit
    
    let query = {}
    
    // Search functionality
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }
    }
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .populate('enrolledCourses.course')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    // Get total count for pagination
    const total = await User.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching users"
    })
  }
}

// Create new user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'user', isActive = true } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      })
    }

    // Check if phone already exists
    const phoneExists = await User.findOne({ phone })
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone number"
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      isActive
    })

    if (user) {
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
          createdAt: user.createdAt
        }
      })
    }
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Server error during user creation"
    })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { name, email, phone, password, role, isActive } = req.body

    console.log("Update user request:", { userId, body: req.body })

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } })
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        })
      }
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: userId } })
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists"
        })
      }
    }

    // Update user fields
    user.name = name || user.name
    user.email = email || user.email
    user.phone = phone || user.phone
    user.role = role || user.role
    user.isActive = isActive !== undefined ? isActive : user.isActive

    // Only update password if provided
    if (password && password.trim() !== '') {
      user.password = password
    }

    const updatedUser = await user.save()

    console.log("User updated successfully:", updatedUser._id)

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
        createdAt: updatedUser.createdAt
      }
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Server error during user update"
    })
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    console.log("Delete user request:", userId)

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      })
    }

    await User.findByIdAndDelete(userId)

    console.log("User deleted successfully:", userId)

    res.json({
      success: true,
      message: "User deleted successfully"
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during user deletion"
    })
  }
}

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params
    const { isActive } = req.body

    console.log("Update user status request:", { userId, isActive })

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      })
    }

    user.isActive = isActive
    const updatedUser = await user.save()

    console.log("User status updated successfully:", updatedUser._id)

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt
      }
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during status update"
    })
  }
}