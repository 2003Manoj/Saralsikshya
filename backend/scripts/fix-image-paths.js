import mongoose from "mongoose"
import Course from "../models/Course.js"

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name")
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

// Fix image paths in database
const fixImagePaths = async () => {
  try {
    console.log("🔄 Starting image path fix...")

    // Find all courses with courseImage that starts with /uploads/
    const coursesWithAbsolutePaths = await Course.find({
      courseImage: { $regex: "^/uploads/" },
    })

    console.log(`📊 Found ${coursesWithAbsolutePaths.length} courses with absolute paths`)

    if (coursesWithAbsolutePaths.length > 0) {
      // Update courses to use relative paths
      const updateResult = await Course.updateMany({ courseImage: { $regex: "^/uploads/" } }, [
        {
          $set: {
            courseImage: {
              $substr: ["$courseImage", 1, -1], // Remove leading slash
            },
          },
        },
      ])

      console.log(`✅ Updated ${updateResult.modifiedCount} courses with relative paths`)
    }

    // Verify the fix
    const totalCourses = await Course.countDocuments({ courseImage: { $ne: "" } })
    const coursesWithRelativePaths = await Course.countDocuments({
      courseImage: { $regex: "^uploads/" },
    })
    const coursesWithUrls = await Course.countDocuments({
      courseImage: { $regex: "^https?://" },
    })

    console.log(`📈 Image Path Summary:`)
    console.log(`   Total courses with images: ${totalCourses}`)
    console.log(`   Courses with relative paths: ${coursesWithRelativePaths}`)
    console.log(`   Courses with URLs: ${coursesWithUrls}`)
    console.log(`   Fix successful: ${(coursesWithRelativePaths + coursesWithUrls) === totalCourses ? "✅" : "❌"}`)
  } catch (error) {
    console.error("❌ Image path fix failed:", error)
  }
}

// Run the fix
const runFix = async () => {
  await connectDB()
  await fixImagePaths()
  await mongoose.connection.close()
  console.log("🔚 Image path fix completed and database connection closed")
  process.exit(0)
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFix()
}

export { fixImagePaths }
