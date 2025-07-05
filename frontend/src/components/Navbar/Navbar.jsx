"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import styles from "./Navbar.module.css"

const Navbar = () => {
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [courses, setCourses] = useState([])
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/courses")
      setCourses(response.data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length > 2) {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.category.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchSuggestions(filtered.slice(0, 5))
    } else {
      setSearchSuggestions([])
    }
  }

  const handleSuggestionClick = (courseId) => {
    navigate(`/course/${courseId}`)
    setSearchQuery("")
    setSearchSuggestions([])
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="Saral Sikshya" />
          <span>Saral Sikshya</span>
        </Link>

        <ul className={styles.navLinks}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li
            className={styles.dropdown}
            onMouseEnter={() => setIsCoursesOpen(true)}
            onMouseLeave={() => setIsCoursesOpen(false)}
          >
            <Link to="/courses">Our Courses</Link>
            {isCoursesOpen && (
              <div className={styles.dropdownMenu}>
                {courses.slice(0, 6).map((course) => (
                  <Link key={course._id} to={`/course/${course._id}`} className={styles.dropdownItem}>
                    {course.title}
                  </Link>
                ))}
                <Link to="/courses" className={styles.viewAll}>
                  View All Courses
                </Link>
              </div>
            )}
          </li>
          <li>
            <Link to="/books">Books</Link>
          </li>
          <li>
            <Link to="/about">About Us</Link>
          </li>
        </ul>

        <div className={styles.rightSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search Courses..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            {searchSuggestions.length > 0 && (
              <div className={styles.suggestions}>
                {searchSuggestions.map((course) => (
                  <div key={course._id} className={styles.suggestion} onClick={() => handleSuggestionClick(course._id)}>
                    <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} />
                    <div>
                      <h4>{course.title}</h4>
                      <p>{course.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.authButtons}>
            {user ? (
              <div className={styles.userMenu}>
                <span>Welcome, {user.name}</span>
                {user.role === "admin" && (
                  <Link to="/admin" className={styles.adminBtn}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/register" className={styles.signupBtn}>
                  Sign Up
                </Link>
                <Link to="/login" className={styles.loginBtn}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
