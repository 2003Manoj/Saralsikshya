import mongoose from "mongoose"

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Lesson title is required"],
    trim: true,
    maxlength: [100, "Lesson title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Lesson description cannot exceed 500 characters"],
  },
  videoUrl: String,
  duration: {
    type: Number, // in minutes
    min: [1, "Duration must be at least 1 minute"],
  },
  order: {
    type: Number,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  resources: [
    {
      title: String,
      url: String,
      type: {
        type: String,
        enum: ["pdf", "video", "link", "document"],
      },
    },
  ],
})

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, "Review comment cannot exceed 500 characters"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"],
      minlength: [5, "Course title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [1000, "Course description cannot exceed 1000 characters"],
      minlength: [20, "Course description must be at least 20 characters"],
    },
    instructor: {
      name: {
        type: String,
        required: [true, "Instructor name is required"],
        trim: true,
        maxlength: [50, "Instructor name cannot exceed 50 characters"],
      },
      bio: {
        type: String,
        maxlength: [500, "Instructor bio cannot exceed 500 characters"],
      },
      image: String,
      email: String,
      experience: String,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    subCategory: {
      type: String,
      required: [true, "Subcategory is required"],
      trim: true,
    },
    subSubCategory: {
      type: String,
      trim: true,
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
      min: [0, "Original price cannot be negative"],
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
      trim: true,
    },
    lessons: {
      type: Number,
      required: [true, "Number of lessons is required"],
      min: [1, "Course must have at least 1 lesson"],
    },
    lessonsContent: [lessonSchema],
    image: {
      type: String,
      default: "",
    },
    thumbnail: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Requirement cannot exceed 100 characters"],
      },
    ],
    whatYouWillLearn: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Learning outcome cannot exceed 100 characters"],
      },
    ],
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: "English",
    },
    certificate: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
courseSchema.index({ title: "text", description: "text" })
courseSchema.index({ category: 1, subCategory: 1 })
courseSchema.index({ level: 1 })
courseSchema.index({ rating: -1 })
courseSchema.index({ enrolledStudents: -1 })
courseSchema.index({ isActive: 1 })
courseSchema.index({ createdAt: -1 })
courseSchema.index({ price: 1 })

// Virtual for discount percentage
courseSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0
    this.numReviews = 0
    return
  }

  const approvedReviews = this.reviews.filter((review) => review.isApproved)
  if (approvedReviews.length === 0) {
    this.rating = 0
    this.numReviews = 0
    return
  }

  const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
  this.rating = (totalRating / approvedReviews.length).toFixed(1)
  this.numReviews = approvedReviews.length
}

// Method to update enrollment count
courseSchema.methods.updateEnrollmentCount = async function () {
  const User = mongoose.model("User")
  const count = await User.countDocuments({
    "enrolledCourses.course": this._id,
  })
  this.enrolledStudents = count
  return this.save()
}

// Pre-save middleware
courseSchema.pre("save", function (next) {
  // Set original price if not provided
  if (!this.originalPrice) {
    this.originalPrice = this.price
  }

  // Update lastUpdated
  this.lastUpdated = new Date()

  next()
})

export default mongoose.model("Course", courseSchema)
