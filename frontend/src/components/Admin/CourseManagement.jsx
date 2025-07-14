"use client"

import { useState, useEffect } from "react"
import styles from "./CourseManagement.module.css"

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("token")
}

// API Headers
const getHeaders = () => {
  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

// API Headers for file upload
const getFileHeaders = () => {
  const token = getToken()
  const headers = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

// Course API functions
const courseAPI = {
  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}/courses${queryString ? `?${queryString}` : ""}`
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
  createCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
  createCourseWithFile: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: getFileHeaders(),
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
  updateCourse: async (id, courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
  updateCourseWithFile: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: getFileHeaders(),
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
  deleteCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
  toggleCourseStatus: async (id, isActive) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  },
}

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSubCategory, setFilterSubCategory] = useState("")
  const [filterLevel, setFilterLevel] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [imageUploadType, setImageUploadType] = useState("url") // 'url' or 'file'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // Hierarchical category structure
  const categoryStructure = {
    लोकसेवा: {
      निजामति: ["शाखा अधिकृत", "नासु", "खरिदार", "प्राविधिक", "सहायक", "विद्यालय", "निरीक्षक"],
      संस्थान: ["टेलिकम", "विद्युत", "खाद्यन्न"],
      "सुरक्षा सेवा": [],
      प्रविधिक: [],
      "प्रदेश लोक सेवा": ["कोशी प्रदेश", "मधेस प्रदेश", "बागमती प्रदेश", "गण्डकी प्रदेश", "लुम्बिनी प्रदेश"],
      बैंक: [],
    },
    "Web Development": {
      Frontend: ["React", "Vue.js", "Angular"],
      Backend: ["Node.js", "Python", "Java"],
      "Full Stack": [],
    },
    "Data Science": {
      "Machine Learning": ["Supervised", "Unsupervised", "Deep Learning"],
      Analytics: ["Statistics", "Visualization", "Big Data"],
    },
  }

  const levels = ["Beginner", "Intermediate", "Advanced"]

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: { name: "", bio: "", image: "" },
    category: "",
    subCategory: "",
    subSubCategory: "",
    level: "",
    price: "",
    originalPrice: "",
    duration: "",
    lessons: "",
    image: "",
    rating: 0,
    numReviews: 0,
    isActive: true,
    tags: "",
    requirements: "",
    whatYouWillLearn: "",
    enrolledStudents: 0,
    // New fields for overview features
    overview: {
      dailyLiveClasses: false,
      freeVideos: false,
      freeNotes: false,
      weeklyClass: false,
      askToGurusFeature: false,
      description: "",
    },
    curriculum: "",
    routine: "",
    courseImage: "",
  })

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  // Get available subcategories based on selected category
  const getSubCategories = (category) => {
    return categoryStructure[category] ? Object.keys(categoryStructure[category]) : []
  }

  // Get available sub-subcategories based on selected category and subcategory
  const getSubSubCategories = (category, subCategory) => {
    return categoryStructure[category] && categoryStructure[category][subCategory]
      ? categoryStructure[category][subCategory]
      : []
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)")
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        setError("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image upload type change
  const handleImageUploadTypeChange = (type) => {
    setImageUploadType(type)
    setSelectedFile(null)
    setImagePreview("")
    setFormData((prev) => ({ ...prev, courseImage: "" }))
  }

  // Fetch courses with filters
  const fetchCourses = async (page = 1) => {
    setLoading(true)
    setError("")
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterSubCategory && { subCategory: filterSubCategory }),
        ...(filterLevel && { level: filterLevel }),
      }
      const response = await courseAPI.getAllCourses(params)
      if (response.success) {
        setCourses(response.data || [])
        setPagination(
          response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          },
        )
      } else {
        setError(response.message || "Failed to fetch courses")
      }
    } catch (error) {
      setError(`Failed to fetch courses: ${error.message}`)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const createCourse = async (courseData, hasFile = false) => {
    try {
      let response
      if (hasFile) {
        response = await courseAPI.createCourseWithFile(courseData)
      } else {
        response = await courseAPI.createCourse(courseData)
      }

      if (response.success) {
        setSuccess("Course created successfully!")
        await fetchCourses()
        return response
      } else {
        throw new Error(response.message || "Failed to create course")
      }
    } catch (error) {
      throw new Error(`Failed to create course: ${error.message}`)
    }
  }

  const updateCourse = async (id, courseData, hasFile = false) => {
    try {
      let response
      if (hasFile) {
        response = await courseAPI.updateCourseWithFile(id, courseData)
      } else {
        response = await courseAPI.updateCourse(id, courseData)
      }

      if (response.success) {
        setSuccess("Course updated successfully!")
        await fetchCourses()
        return response
      } else {
        throw new Error(response.message || "Failed to update course")
      }
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`)
    }
  }

  const deleteCourse = async (id) => {
    try {
      const response = await courseAPI.deleteCourse(id)
      if (response.success) {
        setSuccess("Course deleted successfully!")
        await fetchCourses()
      } else {
        throw new Error(response.message || "Failed to delete course")
      }
    } catch (error) {
      throw new Error(`Failed to delete course: ${error.message}`)
    }
  }

  const toggleStatus = async (id, isActive) => {
    try {
      const response = await courseAPI.toggleCourseStatus(id, isActive)
      if (response.success) {
        setSuccess(`Course ${isActive ? "activated" : "deactivated"} successfully!`)
        await fetchCourses()
      } else {
        throw new Error(response.message || "Failed to toggle course status")
      }
    } catch (error) {
      setError(`Failed to toggle course status: ${error.message}`)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCourses(1)
    }, 500)
    return () => clearTimeout(delayedSearch)
  }, [searchTerm, filterCategory, filterSubCategory, filterLevel])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }))
    } else {
      // Reset subcategories when category changes
      if (name === "category") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          subCategory: "",
          subSubCategory: "",
        }))
      } else if (name === "subCategory") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          subSubCategory: "",
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }))
      }
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error("Course title is required")
    }
    if (!formData.description.trim()) {
      throw new Error("Course description is required")
    }
    if (!formData.instructor.name.trim()) {
      throw new Error("Instructor name is required")
    }
    if (!formData.category) {
      throw new Error("Category is required")
    }
    if (!formData.subCategory) {
      throw new Error("Subcategory is required")
    }
    if (!formData.level) {
      throw new Error("Level is required")
    }
    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      throw new Error("Valid price is required")
    }
    if (!formData.duration.trim()) {
      throw new Error("Duration is required")
    }
    if (!formData.lessons || Number.parseInt(formData.lessons) <= 0) {
      throw new Error("Valid number of lessons is required")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      validateForm()

      const hasFile = imageUploadType === "file" && selectedFile

      if (hasFile) {
        // Create FormData for file upload
        const formDataToSend = new FormData()

        // Add all form fields to FormData
        Object.keys(formData).forEach((key) => {
          if (key === "overview") {
            formDataToSend.append("overview", JSON.stringify(formData[key]))
          } else if (key === "instructor") {
            formDataToSend.append("instructor", JSON.stringify(formData[key]))
          } else if (["tags", "requirements", "whatYouWillLearn", "curriculum", "routine"].includes(key)) {
            const processedValue = formData[key]
              .split(key === "tags" ? "," : "\n")
              .map((item) => item.trim())
              .filter((item) => item)
            formDataToSend.append(key, JSON.stringify(processedValue))
          } else if (key !== "courseImage") {
            // Skip courseImage from form data when uploading file
            formDataToSend.append(key, formData[key])
          }
        })

        // Add the file
        formDataToSend.append("courseImage", selectedFile)

        console.log("Submitting with file upload")

        if (editingCourse) {
          await updateCourse(editingCourse._id, formDataToSend, true)
        } else {
          await createCourse(formDataToSend, true)
        }
      } else {
        // Regular JSON submission
        const courseData = {
          ...formData,
          price: Number.parseFloat(formData.price),
          originalPrice: Number.parseFloat(formData.originalPrice) || Number.parseFloat(formData.price),
          lessons: Number.parseInt(formData.lessons),
          enrolledStudents: Number.parseInt(formData.enrolledStudents) || 0,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          requirements: formData.requirements
            .split("\n")
            .map((req) => req.trim())
            .filter((req) => req),
          whatYouWillLearn: formData.whatYouWillLearn
            .split("\n")
            .map((learn) => learn.trim())
            .filter((learn) => learn),
          curriculum: formData.curriculum
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item),
          routine: formData.routine
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item),
          // Explicitly include courseImage
          courseImage: formData.courseImage || "",
        }

        console.log("Submitting with URL:", courseData.courseImage)

        if (editingCourse) {
          await updateCourse(editingCourse._id, courseData)
        } else {
          await createCourse(courseData)
        }
      }

      resetForm()
      setShowForm(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructor: { name: "", bio: "", image: "" },
      category: "",
      subCategory: "",
      subSubCategory: "",
      level: "",
      price: "",
      originalPrice: "",
      duration: "",
      lessons: "",
      image: "",
      rating: 0,
      numReviews: 0,
      isActive: true,
      tags: "",
      requirements: "",
      whatYouWillLearn: "",
      enrolledStudents: 0,
      overview: {
        dailyLiveClasses: false,
        freeVideos: false,
        freeNotes: false,
        weeklyClass: false,
        askToGurusFeature: false,
        description: "",
      },
      curriculum: "",
      routine: "",
      courseImage: "",
    })
    setEditingCourse(null)
    setSelectedFile(null)
    setImagePreview("")
    setImageUploadType("url")
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      ...course,
      tags: course.tags ? course.tags.join(", ") : "",
      requirements: course.requirements ? course.requirements.join("\n") : "",
      whatYouWillLearn: course.whatYouWillLearn ? course.whatYouWillLearn.join("\n") : "",
      curriculum: course.curriculum ? course.curriculum.join("\n") : "",
      routine: course.routine ? course.routine.join("\n") : "",
      overview: course.overview || {
        dailyLiveClasses: false,
        freeVideos: false,
        freeNotes: false,
        weeklyClass: false,
        askToGurusFeature: false,
        description: "",
      },
    })

    // Set image preview if course has an image
    if (course.courseImage) {
      setImagePreview(course.courseImage)
      setImageUploadType("url")
    }

    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setLoading(true)
      try {
        await deleteCourse(id)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    setLoading(true)
    await toggleStatus(id, !currentStatus)
    setLoading(false)
  }

  const handlePageChange = (newPage) => {
    fetchCourses(newPage)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterCategory("")
    setFilterSubCategory("")
    setFilterLevel("")
    fetchCourses(1)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Course Management</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)} disabled={loading}>
          + Add New Course
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className={styles.success}>
          <span>✅ {success}</span>
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value)
            setFilterSubCategory("")
          }}
          className={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {Object.keys(categoryStructure).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {filterCategory && (
          <select
            value={filterSubCategory}
            onChange={(e) => setFilterSubCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Subcategories</option>
            {getSubCategories(filterCategory).map((subCategory) => (
              <option key={subCategory} value={subCategory}>
                {subCategory}
              </option>
            ))}
          </select>
        )}

        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={styles.filterSelect}>
          <option value="">All Levels</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <button onClick={clearFilters} className={styles.clearBtn}>
          Clear Filters
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading...</span>
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCourse ? "Edit Course" : "Add New Course"}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.form}>
              {/* Basic Information */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>📚 Basic Information</h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Course Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                      <option value="">Select Category</option>
                      {Object.keys(categoryStructure).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.category && (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Subcategory *</label>
                      <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} required>
                        <option value="">Select Subcategory</option>
                        {getSubCategories(formData.category).map((subCategory) => (
                          <option key={subCategory} value={subCategory}>
                            {subCategory}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.subCategory &&
                      getSubSubCategories(formData.category, formData.subCategory).length > 0 && (
                        <div className={styles.formGroup}>
                          <label>Specialization</label>
                          <select name="subSubCategory" value={formData.subSubCategory} onChange={handleInputChange}>
                            <option value="">Select Specialization</option>
                            {getSubSubCategories(formData.category, formData.subCategory).map((subSubCategory) => (
                              <option key={subSubCategory} value={subSubCategory}>
                                {subSubCategory}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    maxLength={1000}
                    rows={4}
                  />
                </div>

                {/* Course Image Upload Section */}
                <div className={styles.formGroup}>
                  <label>Course Image</label>

                  {/* Image Upload Type Selector */}
                  <div className={styles.imageUploadTypeSelector}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="imageUploadType"
                        value="url"
                        checked={imageUploadType === "url"}
                        onChange={(e) => handleImageUploadTypeChange(e.target.value)}
                      />
                      <span>Image URL</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="imageUploadType"
                        value="file"
                        checked={imageUploadType === "file"}
                        onChange={(e) => handleImageUploadTypeChange(e.target.value)}
                      />
                      <span>Upload File</span>
                    </label>
                  </div>

                  {/* URL Input */}
                  {imageUploadType === "url" && (
                    <input
                      type="url"
                      name="courseImage"
                      value={formData.courseImage}
                      onChange={(e) => {
                        handleInputChange(e)
                        setImagePreview(e.target.value)
                      }}
                      placeholder="https://example.com/course-image.jpg"
                      className={styles.imageUrlInput}
                    />
                  )}

                  {/* File Upload */}
                  {imageUploadType === "file" && (
                    <div className={styles.fileUploadContainer}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className={styles.fileInput}
                        id="courseImageFile"
                      />
                      <label htmlFor="courseImageFile" className={styles.fileInputLabel}>
                        📁 Choose Image File
                      </label>
                      {selectedFile && (
                        <div className={styles.fileInfo}>
                          <span>Selected: {selectedFile.name}</span>
                          <span>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className={styles.imagePreview}>
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Course preview"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Course Overview Features */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>🎯 Course Overview Features</h3>

                <div className={styles.overviewFeatures}>
                  <div className={styles.featureGrid}>
                    <label className={styles.featureLabel}>
                      <input
                        type="checkbox"
                        name="overview.dailyLiveClasses"
                        checked={formData.overview.dailyLiveClasses}
                        onChange={handleInputChange}
                      />
                      <span className={styles.featureText}>📺 Daily Live Classes</span>
                    </label>

                    <label className={styles.featureLabel}>
                      <input
                        type="checkbox"
                        name="overview.freeVideos"
                        checked={formData.overview.freeVideos}
                        onChange={handleInputChange}
                      />
                      <span className={styles.featureText}>🎥 Free Videos</span>
                    </label>

                    <label className={styles.featureLabel}>
                      <input
                        type="checkbox"
                        name="overview.freeNotes"
                        checked={formData.overview.freeNotes}
                        onChange={handleInputChange}
                      />
                      <span className={styles.featureText}>📝 Free Notes</span>
                    </label>

                    <label className={styles.featureLabel}>
                      <input
                        type="checkbox"
                        name="overview.weeklyClass"
                        checked={formData.overview.weeklyClass}
                        onChange={handleInputChange}
                      />
                      <span className={styles.featureText}>📅 Weekly Class</span>
                    </label>

                    <label className={styles.featureLabel}>
                      <input
                        type="checkbox"
                        name="overview.askToGurusFeature"
                        checked={formData.overview.askToGurusFeature}
                        onChange={handleInputChange}
                      />
                      <span className={styles.featureText}>🧑‍🏫 Ask to Gurus Feature</span>
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Overview Description</label>
                    <textarea
                      name="overview.description"
                      value={formData.overview.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe what makes this course special..."
                    />
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>📋 Curriculum</h3>
                <div className={styles.formGroup}>
                  <label>Course Curriculum (one topic per line)</label>
                  <textarea
                    name="curriculum"
                    value={formData.curriculum}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Week 1: Introduction to the subject&#10;Week 2: Basic concepts&#10;Week 3: Advanced topics&#10;Week 4: Practical applications"
                  />
                </div>
              </div>

              {/* Routine */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>⏰ Class Routine</h3>
                <div className={styles.formGroup}>
                  <label>Class Schedule (one schedule per line)</label>
                  <textarea
                    name="routine"
                    value={formData.routine}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Monday: 10:00 AM - 12:00 PM&#10;Wednesday: 2:00 PM - 4:00 PM&#10;Friday: 6:00 PM - 8:00 PM"
                  />
                </div>
              </div>

              {/* Instructor Information */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>👨‍🏫 Instructor Information</h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Instructor Name *</label>
                    <input
                      type="text"
                      name="instructor.name"
                      value={formData.instructor.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Level *</label>
                    <select name="level" value={formData.level} onChange={handleInputChange} required>
                      <option value="">Select Level</option>
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Instructor Bio</label>
                  <textarea
                    name="instructor.bio"
                    value={formData.instructor.bio}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </div>

              {/* Pricing and Duration */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>💰 Pricing & Duration</h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Original Price (₹)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 3 months"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Number of Lessons *</label>
                    <input
                      type="number"
                      name="lessons"
                      value={formData.lessons}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>📌 Additional Information</h3>

                <div className={styles.formGroup}>
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., लोकसेवा, परीक्षा, तयारी"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Requirements (one per line)</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Basic computer skills&#10;Nepali language proficiency"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>What You Will Learn (one per line)</label>
                  <textarea
                    name="whatYouWillLearn"
                    value={formData.whatYouWillLearn}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Exam pattern understanding&#10;Subject mastery"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                      Active Course
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.submitBtn} disabled={loading} onClick={handleSubmit}>
                  {loading ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className={styles.coursesGrid}>
        {courses.map((course) => (
          <div key={course._id} className={styles.courseCard}>
            {/* Course Image */}
            <div className={styles.courseImageContainer}>
              <img
                src={course.courseImage || course.image || "/placeholder.svg?height=200&width=300"}
                alt={course.title}
                className={styles.courseImage}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=200&width=300"
                }}
              />
            </div>

            {/* Course Content */}
            <div className={styles.courseContent}>
              {/* Course Title - Highlighted */}
              <h3 className={styles.courseTitle}>{course.title}</h3>

              {/* Course Description - Truncated */}
              <p className={styles.courseDescription}>
                {course.description.length > 120 ? `${course.description.substring(0, 120)}...` : course.description}
              </p>

              {/* Course Actions */}
              <div className={styles.courseActions}>
                <button
                  className={`${styles.statusBtn} ${course.isActive ? styles.active : styles.inactive}`}
                  onClick={() => handleStatusToggle(course._id, course.isActive)}
                  disabled={loading}
                >
                  {course.isActive ? "✓ Active" : "✗ Inactive"}
                </button>
                <button className={styles.editBtn} onClick={() => handleEdit(course)} disabled={loading}>
                  ✏️ Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(course._id)} disabled={loading}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className={styles.paginationBtn}
          >
            ← Previous
          </button>

          <span className={styles.paginationInfo}>
            Page {pagination.page} of {pagination.pages}({pagination.total} total courses)
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages || loading}
            className={styles.paginationBtn}
          >
            Next →
          </button>
        </div>
      )}

      {courses.length === 0 && !loading && (
        <div className={styles.empty}>
          <h3>📚 No courses found</h3>
          <p>Try adjusting your search or filter criteria, or add a new course to get started.</p>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
