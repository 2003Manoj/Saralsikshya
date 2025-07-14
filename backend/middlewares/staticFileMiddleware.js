import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware to serve static files with proper headers
export const serveStaticFiles = () => {
  return express.static(path.join(__dirname, "../uploads"), {
    maxAge: "1d", // Cache for 1 day
    setHeaders: (res, path) => {
      // Set proper MIME types for images
      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg")
      } else if (path.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png")
      } else if (path.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif")
      } else if (path.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp")
      }

      // Allow cross-origin requests for images
      res.setHeader("Access-Control-Allow-Origin", "*")
    },
  })
}

// Middleware to handle image not found
export const handleImageNotFound = (req, res, next) => {
  // If the request is for an image and it's not found, serve a placeholder
  if (req.path.startsWith("/uploads/") && req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    // You can serve a default placeholder image here
    return res.status(404).json({
      success: false,
      message: "Image not found",
    })
  }
  next()
}
