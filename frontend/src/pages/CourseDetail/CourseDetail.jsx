"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import styles from "./CourseDetail.module.css"

const CourseDetail = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [similarCourses, setSimilarCourses] = useState([])

  // Sample course data - replace with API call
  const sampleCourse = {
    _id: "1",
    title: "नायब सुब्बा प्रथम दोस्रो र तेस्रो पत्र Physical lekha -2082",
    description: "लोकसेवा आयोग अन्तर्गत नायब सुब्बा प्रथम दोस्रो र तेस्रो पत्र- 2082 लागि तयारी गरिरहेका सबैका लागि तयार गरिएको कोर्स ।",
    category: "लोकसेवा (Online)",
    price: 19000,
    originalPrice: 25000,
    thumbnail: "/api/placeholder/600/400",
    instructors: 7,
    subjects: 5,
    features: [
      "दैनिक लाइभ कक्षा",
      "बिना इन्टरनेट Free रेकर्डेड भिडियो तथा नोटहरु",
      "हरेक शनिबार Mock Test",
      "गुरुसंग अन्तर्क्रिया गर्न पाइने"
    ],
    curriculum: [
      {
        subject: "सामान्य ज्ञान",
        topics: ["नेपालको इतिहास", "भूगोल", "संविधान", "राजनीति"]
      },
      {
        subject: "अंग्रेजी",
        topics: ["Grammar", "Vocabulary", "Comprehension", "Writing"]
      },
      {
        subject: "नेपाली",
        topics: ["व्याकरण", "निबन्ध", "पत्र लेखन", "गद्यांश"]
      },
      {
        subject: "गणित",
        topics: ["अंकगणित", "बीजगणित", "ज्यामिति", "तथ्यांक"]
      },
      {
        subject: "तर्कशक्ति",
        topics: ["संख्या श्रृंखला", "अक्षर श्रृंखला", "कोडिंग", "रीजनिंग"]
      }
    ],
    routine: [
      { day: "आइतबार", time: "बिहान ६:००", subject: "सामान्य ज्ञान" },
      { day: "सोमबार", time: "बिहान ६:००", subject: "अंग्रेजी" },
      { day: "मंगलबार", time: "बिहान ६:००", subject: "नेपाली" },
      { day: "बुधबार", time: "बिहान ६:००", subject: "गणित" },
      { day: "बिहिबार", time: "बिहान ६:००", subject: "तर्कशक्ति" },
      { day: "शुक्रबार", time: "बिहान ६:००", subject: "समीक्षा कक्षा" },
      { day: "शनिबार", time: "बिहान ८:००", subject: "Mock Test" }
    ],
    freeVideos: [
      { title: "नेपालको संविधान - परिचय", duration: "45 मिनेट", views: 1250 },
      { title: "English Grammar Basics", duration: "30 मिनेट", views: 890 },
      { title: "गणित - प्रतिशत", duration: "40 मिनेट", views: 1100 },
      { title: "तर्कशक्ति - संख्या श्रृंखला", duration: "35 मिनेट", views: 750 }
    ]
  }

  // Sample similar courses
  const sampleSimilarCourses = [
    {
      _id: "2",
      title: "Mofa Physical 2082",
      description: "लोकसेवा आयोग अन्तर्गत नायब सुब्बा प्रथम दोस्रो र तेस्रो पत्र- 2082 लागि तयारी गरिरहेका सबैका लागि तयार गरिएको कोर्स ।",
      price: 18000,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      _id: "3",
      title: "Revenue (राजश्व) Nasu Physical 2082",
      description: "लोकसेवा आयोग अन्तर्गत नायब सुब्बा प्रथम दोस्रो र तेस्रो पत्र- 2082 लागि तयारी गरिरहेका सबैका लागि तयार गरिएको कोर्स ।",
      price: 16000,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      _id: "4",
      title: "Nasu Physical lekha -2082",
      description: "लोकसेवा आयोग अन्तर्गत नायब सुब्बा प्रथम दोस्रो र तेस्रो पत्र- 2082 लागि तयारी गरिरहेका सबैका लागि तयार गरिएको कोर्स ।",
      price: 17000,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      _id: "5",
      title: "बागमती प्रदेश भाैतिक (सहायक पाँचौ तह)",
      description: "बागमती प्रदेश सहायक पाँचौ तहको लागि तयारी गरिरहनुभएका साथीहरुको लागि तयार गरिएको कोर्स ।",
      price: 15000,
      thumbnail: "/api/placeholder/300/200"
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchCourse = async () => {
      setLoading(true)
      try {
        // Replace with actual API call
        // const response = await axios.get(`/api/courses/${courseId}`)
        // setCourse(response.data.course)
        
        setTimeout(() => {
          setCourse(sampleCourse)
          setSimilarCourses(sampleSimilarCourses)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching course:", error)
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleEnroll = () => {
    // Handle enrollment logic
    console.log("Enrolling in course:", course._id)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading course details...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className={styles.error}>
        <h2>Course not found</h2>
        <Link to="/courses" className={styles.backLink}>Back to Courses</Link>
      </div>
    )
  }

  return (
    <div className={styles.courseDetailPage}>
      <div className={styles.container}>
        {/* Course Header */}
        <div className={styles.courseHeader}>
          <div className={styles.courseInfo}>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            
            {/* Tab Navigation */}
            <div className={styles.tabNavigation}>
              <button 
                className={`${styles.tabBtn} ${activeTab === "overview" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === "curriculum" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("curriculum")}
              >
                Curriculum
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === "routine" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("routine")}
              >
                Routine
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === "freeVideos" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("freeVideos")}
              >
                Free Videos
              </button>
            </div>

            <p className={styles.courseDescription}>{course.description}</p>

            {/* Course Features */}
            <div className={styles.courseFeatures}>
              {course.features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  <span className={styles.featureIcon}>✓</span>
                  <span className={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>

            <div className={styles.courseStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Includes</span>
                <span className={styles.statValue}>{course.subjects} Subjects</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{course.instructors}</span>
                <span className={styles.statLabel}>Gurus</span>
              </div>
            </div>
          </div>

          {/* Course Enrollment Card */}
          <div className={styles.enrollmentCard}>
            <div className={styles.priceSection}>
              <span className={styles.label}>Package Price:</span>
              <div className={styles.price}>
                <span className={styles.currency}>Rs.</span>
                <span className={styles.amount}>{course.price.toLocaleString()}</span>
              </div>
              {course.originalPrice && (
                <span className={styles.originalPrice}>Rs. {course.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <button className={styles.enrollBtn} onClick={handleEnroll}>
              Enroll Now
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === "overview" && (
            <div className={styles.overviewContent}>
              <h3>Course Overview</h3>
              <p>{course.description}</p>
              <div className={styles.highlights}>
                <h4>Course Highlights:</h4>
                <ul>
                  {course.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className={styles.curriculumContent}>
              <h3>Course Curriculum</h3>
              <div className={styles.subjectsList}>
                {course.curriculum.map((subject, index) => (
                  <div key={index} className={styles.subjectCard}>
                    <h4>{subject.subject}</h4>
                    <ul>
                      {subject.topics.map((topic, topicIndex) => (
                        <li key={topicIndex}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "routine" && (
            <div className={styles.routineContent}>
              <h3>Class Routine</h3>
              <div className={styles.routineTable}>
                {course.routine.map((schedule, index) => (
                  <div key={index} className={styles.routineRow}>
                    <div className={styles.day}>{schedule.day}</div>
                    <div className={styles.time}>{schedule.time}</div>
                    <div className={styles.subject}>{schedule.subject}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "freeVideos" && (
            <div className={styles.freeVideosContent}>
              <h3>Free Sample Videos</h3>
              <div className={styles.videosList}>
                {course.freeVideos.map((video, index) => (
                  <div key={index} className={styles.videoCard}>
                    <div className={styles.videoInfo}>
                      <h4>{video.title}</h4>
                      <div className={styles.videoMeta}>
                        <span>Duration: {video.duration}</span>
                        <span>Views: {video.views}</span>
                      </div>
                    </div>
                    <button className={styles.playBtn}>Play</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar Courses Section */}
        <div className={styles.similarCoursesSection}>
          <h2>Similar Courses</h2>
          <p>Looking for courses that are similar to your favorite subjects or interests? Look no further!</p>
          
          <div className={styles.similarCoursesGrid}>
            {similarCourses.map((similarCourse) => (
              <div key={similarCourse._id} className={styles.similarCourseCard}>
                <div className={styles.courseImage}>
                  <img 
                    src={similarCourse.thumbnail || "/placeholder.svg?height=200&width=300"} 
                    alt={similarCourse.title}
                    loading="lazy"
                  />
                </div>
                <div className={styles.courseContent}>
                  <h3>{similarCourse.title}</h3>
                  <p>{similarCourse.description}</p>
                  <div className={styles.coursePrice}>
                    Rs. {similarCourse.price.toLocaleString()}
                  </div>
                  <Link to={`/course/${similarCourse._id}`} className={styles.viewCourseBtn}>
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail