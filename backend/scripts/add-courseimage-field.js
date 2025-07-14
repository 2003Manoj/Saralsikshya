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

// Migration function
const addCourseImageField = async () => {
  try {
    console.log("🔄 Starting migration to add courseImage field...")

    // Find all courses that don't have courseImage field or have it as null/undefined
    const coursesWithoutImage = await Course.find({
      $or: [{ courseImage: { $exists: false } }, { courseImage: null }, { courseImage: undefined }],
    })

    console.log(`📊 Found ${coursesWithoutImage.length} courses without courseImage field`)

    if (coursesWithoutImage.length === 0) {
      console.log("✅ All courses already have courseImage field")
      return
    }

    // Update all courses to have courseImage field with empty string as default
    const updateResult = await Course.updateMany(
      {
        $or: [{ courseImage: { $exists: false } }, { courseImage: null }, { courseImage: undefined }],
      },
      {
        $set: { courseImage: "" },
      },
    )

    console.log(`✅ Updated ${updateResult.modifiedCount} courses with courseImage field`)

    // Verify the migration
    const totalCourses = await Course.countDocuments()
    const coursesWithImage = await Course.countDocuments({ courseImage: { $exists: true } })

    console.log(`📈 Migration Summary:`)
    console.log(`   Total courses: ${totalCourses}`)
    console.log(`   Courses with courseImage field: ${coursesWithImage}`)
    console.log(`   Migration successful: ${totalCourses === coursesWithImage ? "✅" : "❌"}`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
  }
}

// Run migration
const runMigration = async () => {
  await connectDB()
  await addCourseImageField()
  await mongoose.connection.close()
  console.log("🔚 Migration completed and database connection closed")
  process.exit(0)
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
}

export { addCourseImageField }
