import { Link } from "react-router-dom"
import styles from "./Banner.module.css"

const Banner = () => {
  return (
    <section className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h1>
              Empower <span className={styles.highlight}>Your</span>
              <br />
              <span className={styles.highlight}>Learning</span> Path
            </h1>
            <p>
              "Discover engaging e-learning courses that fit your schedule and help you improve your skills. Join a
              community of learners and reach your goals with expert guidance."
            </p>
            <Link to="/courses" className={styles.exploreBtn}>
              Explore Courses
            </Link>
          </div>
          <div className={styles.imageContent}>
            <img src="/placeholder.svg?height=400&width=500" alt="Learning illustration" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
