import fs from "fs"
import path from "path"

// Create uploads directory structure
const createUploadsDirectory = () => {
  const uploadsPath = path.join(process.cwd(), "uploads")
  const coursesPath = path.join(uploadsPath, "courses")

  try {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true })
      console.log("✅ Created uploads directory")
    }

    // Create courses subdirectory if it doesn't exist
    if (!fs.existsSync(coursesPath)) {
      fs.mkdirSync(coursesPath, { recursive: true })
      console.log("✅ Created uploads/courses directory")
    }

    // Create .gitkeep file to ensure directory is tracked in git
    const gitkeepPath = path.join(coursesPath, ".gitkeep")
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, "")
      console.log("✅ Created .gitkeep file in uploads/courses")
    }

    console.log("✅ Upload directories setup complete!")
  } catch (error) {
    console.error("❌ Error creating upload directories:", error)
  }
}

// Run the script
createUploadsDirectory()
