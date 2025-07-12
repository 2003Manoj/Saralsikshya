import { body, param, query, validationResult } from "express-validator"

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User validation rules
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  body("role").optional().isIn(["user", "admin", "instructor"]).withMessage("Invalid role"),

  handleValidationErrors,
]

export const validateUserUpdate = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role").optional().isIn(["user", "admin", "instructor"]).withMessage("Invalid role"),

  handleValidationErrors,
]

export const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
]

// Course validation rules
export const validateCourseCreation = [
  body("title").trim().isLength({ min: 5, max: 100 }).withMessage("Course title must be between 5 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Course description must be between 20 and 1000 characters"),

  body("instructor.name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("subCategory").trim().notEmpty().withMessage("Subcategory is required"),

  body("level")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),

  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("originalPrice").optional().isFloat({ min: 0 }).withMessage("Original price must be a positive number"),

  body("duration").trim().notEmpty().withMessage("Duration is required"),

  body("lessons").isInt({ min: 1 }).withMessage("Number of lessons must be at least 1"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("requirements").optional().isArray().withMessage("Requirements must be an array"),

  body("whatYouWillLearn").optional().isArray().withMessage("What you will learn must be an array"),

  handleValidationErrors,
]

export const validateCourseUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Course title must be between 5 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Course description must be between 20 and 1000 characters"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("level")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),

  handleValidationErrors,
]

// Parameter validation
export const validateObjectId = [
  param("id").isMongoId().withMessage("Invalid ID format"),

  handleValidationErrors,
]

// Query validation
export const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
]
