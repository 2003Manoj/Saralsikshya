"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import styles from "./Navbar.module.css"

const Navbar = () => {
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Sample course categories structure - replace with your actual data
  const courseCategories = [
    {
      id: 1,
      name: "Programming",
      subcategories: [
        { id: 11, name: "Web Development", courses: ["HTML/CSS", "JavaScript", "React", "Node.js"] },
        { id: 12, name: "Mobile Development", courses: ["React Native", "Flutter", "Swift", "Kotlin"] },
        { id: 13, name: "Data Science", courses: ["Python", "R", "Machine Learning", "Statistics"] },
        { id: 14, name: "Backend Development", courses: ["Express.js", "Django", "Spring Boot", "Laravel"] }
      ]
    },
    {
      id: 2,
      name: "Design",
      subcategories: [
        { id: 21, name: "UI/UX Design", courses: ["Figma", "Adobe XD", "Sketch", "Prototyping"] },
        { id: 22, name: "Graphic Design", courses: ["Photoshop", "Illustrator", "InDesign", "Canva"] },
        { id: 23, name: "3D Design", courses: ["Blender", "Maya", "3ds Max", "Cinema 4D"] }
      ]
    },
    {
      id: 3,
      name: "Business",
      subcategories: [
        { id: 31, name: "Marketing", courses: ["Digital Marketing", "SEO", "Social Media", "Content Marketing"] },
        { id: 32, name: "Finance", courses: ["Accounting", "Investment", "Financial Planning", "Cryptocurrency"] },
        { id: 33, name: "Management", courses: ["Project Management", "Leadership", "HR Management", "Operations"] }
      ]
    },
    {
      id: 4,
      name: "Languages",
      subcategories: [
        { id: 41, name: "English", courses: ["Grammar", "Speaking", "Writing", "Literature"] },
        { id: 42, name: "Nepali", courses: ["Basic Nepali", "Advanced Nepali", "Literature", "Poetry"] },
        { id: 43, name: "Other Languages", courses: ["Hindi", "Chinese", "Japanese", "Spanish"] }
      ]
    }
  ]

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

  const handleCategoryHover = (categoryId) => {
    setActiveCategory(categoryId)
  }

  const handleCategoryLeave = () => {
    setActiveCategory(null)
  }

  const handleCoursesDropdownEnter = () => {
    setIsCoursesOpen(true)
  }

  const handleCoursesDropdownLeave = () => {
    setIsCoursesOpen(false)
    setActiveCategory(null)
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
            onMouseEnter={handleCoursesDropdownEnter}
            onMouseLeave={handleCoursesDropdownLeave}
          >
            <Link to="/courses">Our Courses</Link>
            {isCoursesOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.categoriesContainer}>
                  {courseCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`${styles.categoryItem} ${activeCategory === category.id ? styles.active : ''}`}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onMouseLeave={handleCategoryLeave}
                    >
                      <Link to={`/courses/category/${category.name.toLowerCase()}`} className={styles.categoryLink}>
                        {category.name}
                        <span className={styles.arrow}>›</span>
                      </Link>
                      
                      {activeCategory === category.id && (
                        <div className={styles.subcategoriesMenu}>
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className={styles.subcategoryItem}>
                              <Link 
                                to={`/courses/subcategory/${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className={styles.subcategoryTitle}
                              >
                                {subcategory.name}
                              </Link>
                              <div className={styles.coursesList}>
                                {subcategory.courses.map((course, index) => (
                                  <Link
                                    key={index}
                                    to={`/courses/search?q=${course}`}
                                    className={styles.courseLink}
                                  >
                                    {course}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className={styles.dropdownFooter}>
                  <Link to="/courses" className={styles.viewAll}>
                    View All Courses
                  </Link>
                </div>
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