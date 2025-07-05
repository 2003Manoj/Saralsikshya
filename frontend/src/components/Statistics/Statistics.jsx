"use client"

import { useState, useEffect } from "react"
import styles from "./Statistics.module.css"

const Statistics = () => {
  const [stats, setStats] = useState({
    classes: 0,
    gurus: 0,
    courses: 0,
    students: 0,
  })

  const finalStats = {
    classes: 49,
    gurus: 1124,
    courses: 235,
    students: 564228,
  }

  useEffect(() => {
    const animateStats = () => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0

      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setStats({
          classes: Math.floor(finalStats.classes * progress),
          gurus: Math.floor(finalStats.gurus * progress),
          courses: Math.floor(finalStats.courses * progress),
          students: Math.floor(finalStats.students * progress),
        })

        if (currentStep >= steps) {
          clearInterval(timer)
          setStats(finalStats)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateStats()
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    const element = document.getElementById("statistics-section")
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K"
    }
    return num.toString()
  }

  return (
    <section id="statistics-section" className={styles.statistics}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Our Impact in Numbers</h2>
          <p>Join thousands of learners who have transformed their careers with us</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.classes}+</div>
            <div className={styles.statLabel}>Total Classes</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{formatNumber(stats.gurus)}+</div>
            <div className={styles.statLabel}>Total Gurus</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.courses}+</div>
            <div className={styles.statLabel}>Total Courses</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{formatNumber(stats.students)}+</div>
            <div className={styles.statLabel}>Total Students</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Statistics
