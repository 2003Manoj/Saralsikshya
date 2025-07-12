import User from "../models/User.js"
import Course from "../models/Course.js"
import Admin from "../models/Admin.js"
import connectDB from "../config/db.js"
import dotenv from "dotenv"

dotenv.config()

const seedData = async () => {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany()
    await Course.deleteMany()
    await Admin.deleteMany()

    // Create admin user
    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@saralsikshya.com",
      password: "admin123456",
      role: "super_admin",
      permissions: ["all"],
      isActive: true,
    })

    // Create sample users
    const users = await User.create([
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        password: "password123",
        role: "user",
        isActive: true,
        isEmailVerified: true,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "9876543211",
        password: "password123",
        role: "user",
        isActive: true,
        isEmailVerified: true,
      },
      {
        name: "राम बहादुर श्रेष्ठ",
        email: "ram@example.com",
        phone: "9876543212",
        password: "password123",
        role: "instructor",
        isActive: true,
        isEmailVerified: true,
      },
    ])

    // Create sample courses
    const courses = await Course.create([
      {
        title: "निजामति सेवा तयारी कोर्स",
        description:
          "लोकसेवा आयोगको निजामति सेवाको लागि पूर्ण तयारी कोर्स। यस कोर्समा सबै विषयहरूको विस्तृत अध्ययन सामग्री र अभ्यास प्रश्नहरू समावेश छन्।",
        instructor: {
          name: "राम बहादुर श्रेष्ठ",
          bio: "१५ वर्षको अनुभव भएका अनुभवी शिक्षक",
          email: "ram@example.com",
        },
        category: "लोकसेवा",
        subCategory: "निजामति",
        subSubCategory: "शाखा अधिकृत",
        level: "Intermediate",
        price: 2500,
        originalPrice: 3000,
        duration: "3 months",
        lessons: 45,
        rating: 4.5,
        numReviews: 125,
        isActive: true,
        isFeatured: true,
        tags: ["लोकसेवा", "निजामति", "परीक्षा"],
        requirements: ["कम्प्युटर जानकारी", "नेपाली भाषा"],
        whatYouWillLearn: ["परीक्षा ढाँचा", "सिलेबस समझ", "समयको व्यवस्थापन"],
        enrolledStudents: 85,
        totalRevenue: 212500,
      },
      {
        title: "Complete React Development Course",
        description:
          "Master React.js from beginner to advanced level. Build real-world projects and learn modern React patterns, hooks, and state management.",
        instructor: {
          name: "John Smith",
          bio: "Full Stack Developer with 8+ years experience",
          email: "john.smith@example.com",
        },
        category: "Web Development",
        subCategory: "Frontend",
        subSubCategory: "React",
        level: "Beginner",
        price: 3000,
        originalPrice: 4000,
        duration: "4 months",
        lessons: 60,
        rating: 4.7,
        numReviews: 200,
        isActive: true,
        isFeatured: true,
        tags: ["React", "JavaScript", "Frontend", "Web Development"],
        requirements: ["Basic JavaScript", "HTML/CSS knowledge"],
        whatYouWillLearn: ["React Components", "State Management", "Hooks", "Redux"],
        enrolledStudents: 150,
        totalRevenue: 450000,
      },
      {
        title: "Python for Data Science",
        description:
          "Learn Python programming for data analysis, visualization, and machine learning. Perfect for beginners in data science.",
        instructor: {
          name: "Dr. Sarah Johnson",
          bio: "Data Scientist and ML Engineer",
          email: "sarah@example.com",
        },
        category: "Data Science",
        subCategory: "Machine Learning",
        subSubCategory: "Python",
        level: "Beginner",
        price: 3500,
        originalPrice: 4500,
        duration: "5 months",
        lessons: 75,
        rating: 4.8,
        numReviews: 180,
        isActive: true,
        isFeatured: false,
        tags: ["Python", "Data Science", "Machine Learning", "Analytics"],
        requirements: ["Basic programming knowledge", "Mathematics basics"],
        whatYouWillLearn: ["Python fundamentals", "Data analysis", "Visualization", "ML algorithms"],
        enrolledStudents: 120,
        totalRevenue: 420000,
      },
    ])

    // Enroll users in courses
    users[0].enrolledCourses.push({
      course: courses[1]._id,
      enrolledAt: new Date(),
      progress: 75,
    })

    users[1].enrolledCourses.push({
      course: courses[0]._id,
      enrolledAt: new Date(),
      progress: 45,
    })

    users[1].enrolledCourses.push({
      course: courses[2]._id,
      enrolledAt: new Date(),
      progress: 30,
    })

    await users[0].save()
    await users[1].save()

    console.log("✅ Sample data seeded successfully!")
    console.log("Admin credentials:")
    console.log("Email: admin@saralsikshya.com")
    console.log("Password: admin123456")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

// Run seeder
if (process.argv[2] === "--seed") {
  seedData()
}

export default seedData
