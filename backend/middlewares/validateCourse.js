import { body, validationResult } from "express-validator"

// Validation rules for creating a course
export const validateCourse = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Course description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("instructor.name").trim().notEmpty().withMessage("Instructor name is required"),

  body("instructor.bio").optional().isLength({ max: 500 }).withMessage("Instructor bio cannot exceed 500 characters"),

  body("category")
    .notEmpty()
    .withMessage("Course category is required")
    .isIn([
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
    ])
    .withMessage("Invalid category"),

  body("level")
    .notEmpty()
    .withMessage("Course level is required")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Invalid level"),

  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),

  body("originalPrice")
    .optional()
    .isNumeric()
    .withMessage("Original price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Original price cannot be negative"),

  body("duration").trim().notEmpty().withMessage("Course duration is required"),

  body("lessons").isInt({ min: 1 }).withMessage("Course must have at least 1 lesson"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("requirements").optional().isArray().withMessage("Requirements must be an array"),

  body("whatYouWillLearn").optional().isArray().withMessage("What you will learn must be an array"),

  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      })
    }
    next()
  },
]

// Validation rules for updating a course (more lenient)
export const validateCourseUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Course title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Course description cannot be empty")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("instructor.name").optional().trim().notEmpty().withMessage("Instructor name cannot be empty"),

  body("instructor.bio").optional().isLength({ max: 500 }).withMessage("Instructor bio cannot exceed 500 characters"),

  body("category")
    .optional()
    .isIn([
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
    ])
    .withMessage("Invalid category"),

  body("level").optional().isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Invalid level"),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),

  body("originalPrice")
    .optional()
    .isNumeric()
    .withMessage("Original price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Original price cannot be negative"),

  body("duration").optional().trim().notEmpty().withMessage("Course duration cannot be empty"),

  body("lessons").optional().isInt({ min: 1 }).withMessage("Course must have at least 1 lesson"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("requirements").optional().isArray().withMessage("Requirements must be an array"),

  body("whatYouWillLearn").optional().isArray().withMessage("What you will learn must be an array"),

  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      })
    }
    next()
  },
]
