"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import styles from "./Courses.module.css"

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)

  // Course categories - added "All" back for homepage display
  const categories = [
    "All",
    "SEE (Grade 10)",
    "Medical",
    "Engineering", 
    "लोकसेवा (Online)",
    "शिक्षक सेवा (Online)",
    "भौतिक कक्षा (Physical)",
    "Mahanagar Scholarship",
    "Bridge Course & CTEVT",
    "+2 (High School)",
    "LLB Entrance",
    "Management",
    "Language",
    "Technical License",
    "Digital Filmmaking"
  ]

  // Sample courses data - replace with your API call
  const sampleCourses = [
    {
      _id: "1",
      title: "SEE Physics Complete Course",
      description: "Complete Physics course for SEE students with practical examples and exam preparation",
      category: "SEE (Grade 10)",
      price: 2500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Dr. Ram Sharma", image: "/api/placeholder/40/40" },
      rating: 4.8,
      duration: 45,
      students: 1250,
      level: "Intermediate"
    },
    {
      _id: "2",
      title: "MBBS Entrance Preparation",
      description: "Comprehensive medical entrance exam preparation with mock tests and expert guidance",
      category: "Medical",
      price: 8500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Dr. Sita Adhikari", image: "/api/placeholder/40/40" },
      rating: 4.9,
      duration: 120,
      students: 890,
      level: "Advanced"
    },
    {
      _id: "3",
      title: "Engineering Entrance Math",
      description: "Advanced mathematics for engineering entrance exams with problem-solving techniques",
      category: "Engineering",
      price: 3500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Prof. Hari Bahadur", image: "/api/placeholder/40/40" },
      rating: 4.7,
      duration: 60,
      students: 650,
      level: "Advanced"
    },
    {
      _id: "4",
      title: "लोकसेवा तयारी पूर्ण कोर्स",
      description: "Complete Lok Sewa preparation course with Nepali, English, and General Knowledge",
      category: "लोकसेवा (Online)",
      price: 4500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "गुरु प्रसाद पौडेल", image: "/api/placeholder/40/40" },
      rating: 4.6,
      duration: 80,
      students: 2100,
      level: "Intermediate"
    },
    {
      _id: "5",
      title: "शिक्षक सेवा आयोगको तयारी",
      description: "Complete teacher service commission preparation with pedagogy and subject knowledge",
      category: "शिक्षक सेवा (Online)",
      price: 3800,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "सुनिता श्रेष्ठ", image: "/api/placeholder/40/40" },
      rating: 4.5,
      duration: 65,
      students: 780,
      level: "Intermediate"
    },
    {
      _id: "6",
      title: "Physics Lab Practical Class",
      description: "Hands-on physics laboratory sessions with real experiments and observations",
      category: "भौतिक कक्षा (Physical)",
      price: 5500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Dr. Ravi Joshi", image: "/api/placeholder/40/40" },
      rating: 4.8,
      duration: 40,
      students: 320,
      level: "Intermediate"
    },
    {
      _id: "7",
      title: "Mahanagar Scholarship Prep",
      description: "Comprehensive preparation for Mahanagar municipality scholarship examinations",
      category: "Mahanagar Scholarship",
      price: 2800,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Krishna Thapa", image: "/api/placeholder/40/40" },
      rating: 4.4,
      duration: 35,
      students: 450,
      level: "Beginner"
    },
    {
      _id: "8",
      title: "CTEVT Diploma Course",
      description: "Bridge course for CTEVT diploma programs with technical fundamentals",
      category: "Bridge Course & CTEVT",
      price: 4200,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Eng. Mohan Karki", image: "/api/placeholder/40/40" },
      rating: 4.6,
      duration: 55,
      students: 580,
      level: "Intermediate"
    },
    {
      _id: "9",
      title: "+2 Science Complete Package",
      description: "Complete +2 science course covering Physics, Chemistry, Biology, and Mathematics",
      category: "+2 (High School)",
      price: 6500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Prof. Geeta Paudel", image: "/api/placeholder/40/40" },
      rating: 4.9,
      duration: 180,
      students: 1850,
      level: "Advanced"
    },
    {
      _id: "10",
      title: "LLB Entrance Preparation",
      description: "Complete law entrance examination preparation with legal aptitude and reasoning",
      category: "LLB Entrance",
      price: 5800,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Adv. Prakash Neupane", image: "/api/placeholder/40/40" },
      rating: 4.7,
      duration: 90,
      students: 420,
      level: "Advanced"
    },
    {
      _id: "11",
      title: "MBA Entrance & Management",
      description: "MBA entrance preparation with management fundamentals and case studies",
      category: "Management",
      price: 7200,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Dr. Binod Chaudhary", image: "/api/placeholder/40/40" },
      rating: 4.8,
      duration: 100,
      students: 680,
      level: "Advanced"
    },
    {
      _id: "12",
      title: "English Language Mastery",
      description: "Complete English language course with grammar, vocabulary, and communication skills",
      category: "Language",
      price: 3200,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Sarah Johnson", image: "/api/placeholder/40/40" },
      rating: 4.6,
      duration: 70,
      students: 920,
      level: "All Levels"
    },
    {
      _id: "13",
      title: "Driving License Preparation",
      description: "Complete driving license preparation with traffic rules and practical driving tips",
      category: "Technical License",
      price: 1800,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Raj Kumar Thapa", image: "/api/placeholder/40/40" },
      rating: 4.3,
      duration: 25,
      students: 1100,
      level: "Beginner"
    },
    {
      _id: "14",
      title: "Digital Filmmaking Complete",
      description: "Complete digital filmmaking course from pre-production to post-production",
      category: "Digital Filmmaking",
      price: 9500,
      thumbnail: "/api/placeholder/300/200",
      instructor: { name: "Rajesh Hamal", image: "/api/placeholder/40/40" },
      rating: 4.9,
      duration: 150,
      students: 280,
      level: "Advanced"
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchCourses = async () => {
      setLoading(true)
      try {
        // Replace this with your actual API call
        // const response = await axios.get("/api/courses")
        // setCourses(response.data.courses)
        
        // Using sample data for now
        setTimeout(() => {
          setCourses(sampleCourses)
          // Show all courses initially on homepage
          setFilteredCourses(sampleCourses)
          setSelectedCategory("All")
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (category === "All") {
      setFilteredCourses(courses)
    } else {
      const filtered = courses.filter(course => course.category === category)
      setFilteredCourses(filtered)
    }
  }

  return (
    <section className={styles.coursesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>Our Courses</h2>
          <p className={styles.sectionSubtitle}>
            Discover our comprehensive range of courses designed for your success
          </p>
        </div>

        <div className={styles.categoryFilters}>
          <div className={styles.categoryScrollContainer}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.coursesContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {filteredCourses.map((course) => (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.courseImage}>
                    <img 
                      src={course.thumbnail || "https://placehold.co/600x400"} 
                      alt={course.title}
                      loading="lazy"
                    />
                    <div className={styles.coursePrice}>₹{course.price}</div>
                    <div className={styles.courseLevel}>{course.level}</div>
                  </div>
                  
                  <div className={styles.courseContent}>
                    <div className={styles.courseCategory}>{course.category}</div>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDescription}>
                      {course.description.length > 100 
                        ? `${course.description.substring(0, 100)}...` 
                        : course.description
                      }
                    </p>
                    
                    <div className={styles.courseInstructor}>
                      <img 
                        src={course.instructor?.image || "/placeholder.svg?height=30&width=30"} 
                        alt="Instructor"
                        loading="lazy"
                      />
                      <span>{course.instructor?.name || "Expert Instructor"}</span>
                    </div>
                    
                    <div className={styles.courseStats}>
                      <span className={styles.rating}>⭐ {course.rating || 4.5}</span>
                      <span className={styles.duration}>{course.duration} hours</span>
                      <span className={styles.students}>{course.students || 0} students</span>
                    </div>
                    
                    <Link to={`/course/${course._id}`} className={styles.viewCourseBtn}>
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Courses