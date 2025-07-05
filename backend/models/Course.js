import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    instructor: {
      name: {
        type: String,
        required: [true, "Instructor name is required"],
      },
      bio: {
        type: String,
        maxlength: [500, "Instructor bio cannot exceed 500 characters"],
      },
      image: {
        type: String,
        default: "/placeholder.svg?height=200&width=300",
      },
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      enum: [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Machine Learning",
        "DevOps",
        "Cybersecurity",
        "UI/UX Design",
        "Digital Marketing",
        "Business",
        "Programming",
        "Database",
        "Cloud Computing",
      ],
    },
    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price
      },
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
    },
    lessons: {
      type: Number,
      required: [true, "Number of lessons is required"],
      min: [1, "Course must have at least 1 lesson"],
    },
    image: {
      type: String,
      default: "/placeholder.svg?height=200&width=300",
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    curriculum: [
      {
        title: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        topics: [String],
      },
    ],
    requirements: [String],
    whatYouWillLearn: [String],
    enrolledStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
courseSchema.index({ title: "text", description: "text", category: "text" })

// Add some default courses when the model is first created
courseSchema.statics.seedCourses = async function () {
  const count = await this.countDocuments()
  if (count === 0) {
   const defaultCourses = [
  {
    title: "Complete Web Development Bootcamp",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive web development course.",
    instructor: {
      name: "John Smith",
      bio: "Experienced full-stack developer and bootcamp instructor.",
    },
    category: "Web Development",
    level: "Beginner",
    price: 2999,
    originalPrice: 4999,
    duration: "12 weeks",
    lessons: 120,
    rating: 4.8,
    numReviews: 1250,
    enrolledStudents: 5000,
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    whatYouWillLearn: [
      "Build responsive websites with HTML and CSS",
      "Master JavaScript fundamentals and ES6+",
      "Create dynamic web apps with React",
      "Build backend APIs with Node.js and Express",
      "Work with databases (MongoDB)",
    ],
    requirements: [
      "Basic computer skills",
      "No programming experience required",
      "Willingness to learn and practice",
    ],
  },
  {
    title: "React.js Complete Course",
    description:
      "Master React.js from basics to advanced concepts including hooks, context, and state management.",
    instructor: {
      name: "Sarah Johnson",
      bio: "Frontend developer and React specialist.",
    },
    category: "Web Development",
    level: "Intermediate",
    price: 1999,
    originalPrice: 3499,
    duration: "8 weeks",
    lessons: 80,
    rating: 4.7,
    numReviews: 890,
    enrolledStudents: 3200,
    tags: ["React", "JavaScript", "Hooks", "Redux"],
    whatYouWillLearn: [
      "Build modern React applications",
      "Master React Hooks and Context API",
      "State management with Redux",
      "Testing React components",
    ],
    requirements: [
      "Basic JavaScript knowledge",
      "HTML and CSS fundamentals",
      "Understanding of ES6 features",
    ],
  },
  {
    title: "Python for Data Science",
    description:
      "Learn Python programming for data analysis, visualization, and machine learning applications.",
    instructor: {
      name: "Dr. Michael Chen",
      bio: "Data scientist and professor with years of industry experience.",
    },
    category: "Data Science",
    level: "Beginner",
    price: 2499,
    originalPrice: 3999,
    duration: "10 weeks",
    lessons: 100,
    rating: 4.9,
    numReviews: 1500,
    enrolledStudents: 4500,
    tags: ["Python", "Data Analysis", "Pandas", "NumPy", "Matplotlib"],
    whatYouWillLearn: [
      "Python programming fundamentals",
      "Data manipulation with Pandas",
      "Data visualization with Matplotlib",
      "Introduction to machine learning",
    ],
    requirements: [
      "Basic mathematics knowledge",
      "No programming experience required",
      "Interest in data and analytics",
    ],
  },
]


    await this.insertMany(defaultCourses)
    console.log("Default courses seeded successfully")
  }
}

export default mongoose.model("Course", courseSchema)
