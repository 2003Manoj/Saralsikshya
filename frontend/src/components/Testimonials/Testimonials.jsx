// Testimonials.jsx
import styles from "./Testimonials.module.css"

const Testimonials = ({ courses }) => {
  const featuredCourses = courses && courses.length > 0 ? courses.slice(0, 3) : []

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Featured Courses</h2>
          <p>Discover our most popular and highly-rated courses</p>
        </div>

        <div className={styles.coursesGrid}>
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course, index) => (
              <div key={course._id || course.id || `course-${index}`} className={styles.courseCard}>
                <div className={styles.courseImage}>
                  <img
                    src={course.thumbnail || "/placeholder.png"}
                    alt={course.title || "Course thumbnail"}
                    loading="lazy"
                  />
                  <div className={styles.rating}>
                    <span>⭐ {course.rating?.toFixed(1) || "4.5"}</span>
                  </div>
                </div>
                <div className={styles.courseInfo}>
                  <div className={styles.category}>{course.category || "General"}</div>
                  <h3>{course.title || "Untitled Course"}</h3>
                  <p>{course.description ? `${course.description.substring(0, 120)}...` : "No description available."}</p>
                  <div className={styles.instructor}>
                    <img
                      src={course.instructor?.image || "/placeholder.png"}
                      alt={course.instructor?.name || "Instructor"}
                      loading="lazy"
                    />
                    <span>{course.instructor?.name || "Expert Instructor"}</span>
                  </div>
                  <div className={styles.courseFooter}>
                    <div className={styles.price}>₹{course.price ?? "N/A"}</div>
                    <div className={styles.students}>{course.students ?? 0} students</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No featured courses available.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Testimonials