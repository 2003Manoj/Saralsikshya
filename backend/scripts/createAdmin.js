import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"
import Course from "../models/Course.js"

// Load environment variables
dotenv.config()

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/saralsikshya")
    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@saralsikshya.com" })

    if (existingAdmin) {
      console.log("Admin user already exists!")
      console.log("Email: admin@saralsikshya.com")
      console.log("Password: admin123456")
      process.exit(0)
    }

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@saralsikshya.com",
      phone: "9999999999",
      password: "admin123456",
      role: "admin",
    })

    console.log("Admin user created successfully!")
    console.log("Email: admin@saralsikshya.com")
    console.log("Password: admin123456")

    // Seed default courses
    await Course.seedCourses()

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error)
    process.exit(1)
  }
}

createAdmin()
