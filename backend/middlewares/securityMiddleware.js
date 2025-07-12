import rateLimit from "express-rate-limit"
import helmet from "helmet"
import mongoSanitize from "express-mongo-sanitize"
import xss from "xss-clean"
import hpp from "hpp"

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Much higher limit for development
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development if needed
  skip: isDevelopment ? () => false : () => false, // Set to true to completely disable in dev
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // More login attempts for development
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
})

export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100 : 10, // Much higher for development
  message: {
    success: false,
    message: "Too many create requests from this IP, please try again later.",
  },
})

// Development-only: Bypass rate limiting for localhost
export const developmentBypass = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10000, // Very high limit
  message: {
    success: false,
    message: "Rate limit exceeded",
  },
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment) {
      const clientIP = req.ip || req.connection.remoteAddress
      return clientIP === "127.0.0.1" || clientIP === "::1" || clientIP.includes("localhost")
    }
    return false
  },
})

// Security middleware setup
export const setupSecurity = (app) => {
  // Set security headers
  app.use(
    helmet({
      contentSecurityPolicy: isDevelopment
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          },
      crossOriginEmbedderPolicy: false,
    }),
  )

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize())

  // Data sanitization against XSS
  app.use(xss())

  // Prevent parameter pollution
  app.use(
    hpp({
      whitelist: ["tags", "requirements", "whatYouWillLearn"],
    }),
  )

  // Apply appropriate rate limiting based on environment
  if (isDevelopment) {
    console.log("🚀 Development mode: Using relaxed rate limiting")
    app.use("/api/", developmentBypass)
  } else {
    console.log("🔒 Production mode: Using strict rate limiting")
    app.use("/api/", generalLimiter)
  }
}

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags from string inputs
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].replace(/<[^>]*>?/gm, "").trim()
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key])
      }
    }
  }

  if (req.body) {
    sanitizeObject(req.body)
  }
  next()
}

// File upload security
export const validateFileUpload = (req, res, next) => {
  if (req.file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      })
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      })
    }
  }
  next()
}

// Middleware to log rate limit info (helpful for debugging)
export const rateLimitLogger = (req, res, next) => {
  if (isDevelopment) {
    const remaining = res.getHeader("X-RateLimit-Remaining")
    const limit = res.getHeader("X-RateLimit-Limit")
    if (remaining !== undefined && limit !== undefined) {
      console.log(`Rate limit: ${remaining}/${limit} remaining for ${req.ip}`)
    }
  }
  next()
}
