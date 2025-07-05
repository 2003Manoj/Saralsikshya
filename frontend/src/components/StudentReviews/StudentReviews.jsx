"use client"

import { useState } from "react"
import styles from "./StudentReviews.module.css"

const StudentReviews = () => {
  const [currentReview, setCurrentReview] = useState(0)

  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      course: "Web Development Bootcamp",
      rating: 5,
      comment:
        "Amazing course! The instructors are very knowledgeable and the content is well-structured. I learned so much and now I'm confident in my web development skills.",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      course: "Digital Marketing Mastery",
      rating: 5,
      comment:
        "This course completely changed my career. The practical approach and real-world examples made learning so much easier. Highly recommended!",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 3,
      name: "Anita Patel",
      course: "Data Science Fundamentals",
      rating: 4,
      comment:
        "Great course with excellent content. The instructors are very supportive and always ready to help. The projects were challenging but rewarding.",
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 4,
      name: "Vikram Singh",
      course: "Mobile App Development",
      rating: 5,
      comment:
        "Outstanding learning experience! The course is comprehensive and covers everything you need to know. I built my first app within weeks of completing the course.",
      image: "/placeholder.svg?height=60&width=60",
    },
  ]

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  return (
    <section className={styles.studentReviews}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>What Our Students Say</h2>
          <p>Real feedback from our amazing learning community</p>
        </div>

        <div className={styles.reviewsContainer}>
          <button className={styles.navBtn} onClick={prevReview}>
            ←
          </button>

          <div className={styles.reviewCard}>
            <div className={styles.reviewContent}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < reviews[currentReview].rating ? styles.starFilled : styles.star}>
                    ⭐
                  </span>
                ))}
              </div>
              <p>"{reviews[currentReview].comment}"</p>
              <div className={styles.reviewer}>
                <img src={reviews[currentReview].image || "/placeholder.svg"} alt={reviews[currentReview].name} />
                <div>
                  <h4>{reviews[currentReview].name}</h4>
                  <span>{reviews[currentReview].course}</span>
                </div>
              </div>
            </div>
          </div>

          <button className={styles.navBtn} onClick={nextReview}>
            →
          </button>
        </div>

        <div className={styles.indicators}>
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentReview ? styles.active : ""}`}
              onClick={() => setCurrentReview(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default StudentReviews
