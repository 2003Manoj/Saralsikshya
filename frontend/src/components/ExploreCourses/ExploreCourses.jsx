"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./ExploreCourses.module.css"

const ExploreCourses = ({ courses }) => {
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filter out undefined/null categories before creating the Set
  const categories = ["all", ...new Set(courses
    .map((course) => course?.category)
    .filter(category => category != null && category !== "")
  )]

  const filteredCourses =
    selectedCategory === "all" ? courses : courses.filter((course) => course.category === selectedCategory)

  return (
    <section className={styles.exploreCourses}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Explore Our Courses</h2>
          <p>Choose from our wide range of courses designed to help you succeed</p>
        </div>

        <div className={styles.categoryFilter}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {/* Fixed: Added null check before charAt */}
              {category && typeof category === 'string' 
                ? category.charAt(0).toUpperCase() + category.slice(1)
                : category
              }
            </button>
          ))}
        </div>

        <div className={styles.coursesGrid}>
          {filteredCourses.slice(0, 8).map((course) => (
            <div key={course._id} className={styles.courseCard}>
              <div className={styles.courseImage}>
                <img src={course.thumbnail || "/placeholder.svg?height=200&width=300"} alt={course.title} />
                <div className={styles.coursePrice}>₹{course.price}</div>
              </div>
              <div className={styles.courseContent}>
                <div className={styles.courseCategory}>{course.category}</div>
                <h3>{course.title}</h3>
                <p>{course.description?.substring(0, 100) || "No description available"}...</p>
                <div className={styles.courseStats}>
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

        <div className={styles.viewAllContainer}>
          <Link to="/courses" className={styles.viewAllBtn}>
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ExploreCourses