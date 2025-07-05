"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import styles from "./Courses.module.css"

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCourses()
    fetchCategories()
  }, [currentPage, selectedCategory, searchQuery])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      }

      const response = await axios.get("/api/courses", { params })
      setCourses(response.data.courses)
      setFilteredCourses(response.data.courses)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/courses/categories")
      setCategories(["all", ...response.data.categories])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className={styles.coursesPage}>
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1>Explore Our Courses</h1>
          <p>Discover the perfect course to advance your skills and career</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoryFilter}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading courses...</div>
        ) : (
          <>
            <div className={styles.coursesGrid}>
              {filteredCourses.map((course) => (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.courseImage}>
                    <img src={course.thumbnail || "/placeholder.svg?height=200&width=300"} alt={course.title} />
                    <div className={styles.coursePrice}>₹{course.price}</div>
                    <div className={styles.courseLevel}>{course.level}</div>
                  </div>
                  <div className={styles.courseContent}>
                    <div className={styles.courseCategory}>{course.category}</div>
                    <h3>{course.title}</h3>
                    <p>{course.description.substring(0, 100)}...</p>
                    <div className={styles.courseInstructor}>
                      <img src={course.instructor?.image || "/placeholder.svg?height=30&width=30"} alt="Instructor" />
                      <span>{course.instructor?.name || "Expert Instructor"}</span>
                    </div>
                    <div className={styles.courseStats}>
                      <span>⭐ {course.rating || 4.5}</span>
                      <span>{course.duration} hours</span>
                      <span>{course.students || 0} students</span>
                    </div>
                    <Link to={`/course/${course._id}`} className={styles.viewCourseBtn}>
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.active : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Courses
