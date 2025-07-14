import { body, param, query, validationResult } from "express-validator"
import mongoose from "mongoose"

// Helper function to handle validation errors
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

// Authentication validation middleware
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password")
      }
      return true
    }),
  
  handleValidationErrors,
]

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  
  handleValidationErrors,
]

export const validatePasswordReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  handleValidationErrors,
]

export const validateUpdatePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  
  body("confirmNewPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New password confirmation does not match new password")
      }
      return true
    }),
  
  handleValidationErrors,
]

export const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  handleValidationErrors,
]

export const validateResetPassword = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),
  
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  
  body("confirmNewPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password")
      }
      return true
    }),
  
  handleValidationErrors,
]

// User profile validation
export const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  
  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address must not exceed 200 characters"),
  
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
  
  handleValidationErrors,
]

export const validateUserProfile = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  
  handleValidationErrors,
]

// Validate ObjectId
export const validateObjectId = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid ID format")
    }
    return true
  }),
  handleValidationErrors,
]

// Validate pagination parameters
export const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "title", "price", "rating", "enrolledStudents"])
    .withMessage("Invalid sort field"),
  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),
  handleValidationErrors,
]

// Enhanced course creation validation
export const validateCourseCreationEnhanced = [
  // Basic required fields
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),

  body("instructor")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value)
          if (!parsed.name || parsed.name.trim().length < 2) {
            throw new Error("Instructor name must be at least 2 characters")
          }
          return true
        } catch (error) {
          throw new Error("Invalid instructor data")
        }
      }
      if (typeof value === "object" && value.name) {
        if (value.name.trim().length < 2) {
          throw new Error("Instructor name must be at least 2 characters")
        }
        return true
      }
      throw new Error("Instructor name is required")
    }),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("subCategory").trim().notEmpty().withMessage("Subcategory is required"),

  body("subSubCategory").optional().trim(),

  body("level")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),

  body("price")
    .isNumeric()
    .custom((value) => {
      if (Number.parseFloat(value) < 0) {
        throw new Error("Price must be a positive number")
      }
      return true
    }),

  body("originalPrice")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value && Number.parseFloat(value) < 0) {
        throw new Error("Original price must be a positive number")
      }
      return true
    }),

  body("duration").trim().notEmpty().withMessage("Duration is required"),

  body("lessons")
    .isNumeric()
    .custom((value) => {
      if (Number.parseInt(value) < 1) {
        throw new Error("Number of lessons must be at least 1")
      }
      return true
    }),

  body("image").optional().trim(),

  body("courseImage").optional().trim(),

  body("rating")
    .optional()
    .isNumeric()
    .custom((value) => {
      const num = Number.parseFloat(value)
      if (num < 0 || num > 5) {
        throw new Error("Rating must be between 0 and 5")
      }
      return true
    }),

  body("numReviews")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (Number.parseInt(value) < 0) {
        throw new Error("Number of reviews cannot be negative")
      }
      return true
    }),

  body("enrolledStudents")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (Number.parseInt(value) < 0) {
        throw new Error("Enrolled students cannot be negative")
      }
      return true
    }),

  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  // Overview fields validation
  body("overview")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          JSON.parse(value)
          return true
        } catch (error) {
          throw new Error("Invalid overview data")
        }
      }
      return true
    }),

  // Curriculum validation
  body("curriculum")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true // Allow empty curriculum
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value) // Validate JSON array
          }
          return true // Will be processed in controller
        } catch (error) {
          throw new Error("Invalid curriculum format")
        }
      }
      if (Array.isArray(value)) {
        return true // Already an array
      }
      throw new Error("Curriculum must be a string or array")
    }),

  // Routine validation
  body("routine")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true // Allow empty routine
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value) // Validate JSON array
          }
          return true // Will be processed in controller
        } catch (error) {
          throw new Error("Invalid routine format")
        }
      }
      if (Array.isArray(value)) {
        return true // Already an array
      }
      throw new Error("Routine must be a string or array")
    }),

  // Tags validation
  body("tags")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true // Allow empty tags
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value) // Validate JSON array
          }
          return true // Will be processed in controller
        } catch (error) {
          throw new Error("Invalid tags format")
        }
      }
      if (Array.isArray(value)) {
        return true // Already an array
      }
      throw new Error("Tags must be a string or array")
    }),

  // Requirements validation
  body("requirements")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true // Allow empty requirements
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value) // Validate JSON array
          }
          return true // Will be processed in controller
        } catch (error) {
          throw new Error("Invalid requirements format")
        }
      }
      if (Array.isArray(value)) {
        return true // Already an array
      }
      throw new Error("Requirements must be a string or array")
    }),

  // What you will learn validation
  body("whatYouWillLearn")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true // Allow empty whatYouWillLearn
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value) // Validate JSON array
          }
          return true // Will be processed in controller
        } catch (error) {
          throw new Error("Invalid whatYouWillLearn format")
        }
      }
      if (Array.isArray(value)) {
        return true // Already an array
      }
      throw new Error("What you will learn must be a string or array")
    }),

  handleValidationErrors,
]

// Enhanced course update validation
export const validateCourseUpdateEnhanced = [
  // All fields are optional for updates
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),

  body("instructor")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value)
          if (parsed.name && parsed.name.trim().length < 2) {
            throw new Error("Instructor name must be at least 2 characters")
          }
          return true
        } catch (error) {
          throw new Error("Invalid instructor data")
        }
      }
      if (typeof value === "object" && value.name) {
        if (value.name.trim().length < 2) {
          throw new Error("Instructor name must be at least 2 characters")
        }
        return true
      }
      return true
    }),

  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),

  body("subCategory").optional().trim().notEmpty().withMessage("Subcategory cannot be empty"),

  body("level")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),

  body("price")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (Number.parseFloat(value) < 0) {
        throw new Error("Price must be a positive number")
      }
      return true
    }),

  body("originalPrice")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value && Number.parseFloat(value) < 0) {
        throw new Error("Original price must be a positive number")
      }
      return true
    }),

  body("duration").optional().trim().notEmpty().withMessage("Duration cannot be empty"),

  body("lessons")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (Number.parseInt(value) < 1) {
        throw new Error("Number of lessons must be at least 1")
      }
      return true
    }),

  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  // Overview fields validation (all optional)
  body("overview")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          JSON.parse(value)
          return true
        } catch (error) {
          throw new Error("Invalid overview data")
        }
      }
      return true
    }),

  // Other optional fields with same validation as creation
  body("curriculum")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value)
          }
          return true
        } catch (error) {
          throw new Error("Invalid curriculum format")
        }
      }
      if (Array.isArray(value)) {
        return true
      }
      throw new Error("Curriculum must be a string or array")
    }),

  body("routine")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === "") {
        return true
      }
      if (typeof value === "string") {
        try {
          if (value.startsWith("[")) {
            JSON.parse(value)
          }
          return true
        } catch (error) {
          throw new Error("Invalid routine format")
        }
      }
      if (Array.isArray(value)) {
        return true
      }
      throw new Error("Routine must be a string or array")
    }),

  body("courseImage").optional().trim(),

  handleValidationErrors,
]

// Basic course creation validation (fallback)
export const validateCourseCreation = [
  body("title").trim().isLength({ min: 5, max: 100 }).withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("instructor.name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("subCategory").trim().notEmpty().withMessage("Subcategory is required"),
  body("level")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),
  body("price")
    .isNumeric()
    .custom((value) => {
      if (Number.parseFloat(value) < 0) {
        throw new Error("Price must be a positive number")
      }
      return true
    }),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
  body("lessons")
    .isNumeric()
    .custom((value) => {
      if (Number.parseInt(value) < 1) {
        throw new Error("Number of lessons must be at least 1")
      }
      return true
    }),
  handleValidationErrors,
]

// Basic course update validation (fallback)
export const validateCourseUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("instructor.name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Instructor name must be between 2 and 50 characters"),
  body("level")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Level must be Beginner, Intermediate, or Advanced"),
  body("price")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (Number.parseFloat(value) < 0) {
        throw new Error("Price must be a positive number")
      }
      return true
    }),
  handleValidationErrors,
]