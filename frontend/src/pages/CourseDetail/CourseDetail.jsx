"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import styles from "./CourseDetail.module.css"

const CourseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [relatedCourses, setRelatedCourses] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchCourseDetails()
  }, [id])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/courses/${id}`)
      setCourse(response.data.course)
      setRelatedCourses(response.data.relatedCourses)
    } catch (error) {
      console.error("Error fetching course details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      alert("Please login to enroll in this course")
      return
    }

    setEnrolling(true)
    try {
      // Simulate enrollment process
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("Successfully enrolled in the course!")
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("Failed to enroll. Please try again.")
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading course details...</div>
  }

  if (!course) {
    return <div className={styles.error}>Course not found</div>
  }

  return (
    <div className={styles.courseDetail}>
      <div className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.courseInfo}>
              <div className={styles.breadcrumb}>
                <Link to="/courses">Courses</Link> / <span>{course.category}</span> / <span>{course.title}</span>
              </div>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
              <div className={styles.courseStats}>
                <span>
                  ⭐ {course.rating || 4.5} ({course.reviews?.length || 0} reviews)
                </span>
                <span>👥 {course.students || 0} students</span>
                <span>⏱️ {course.duration} hours</span>
                <span>📊 {course.level}</span>
              </div>
              <div className={styles.instructor}>
                <img src={course.instructor?.image || "/placeholder.svg?height=50&width=50"} alt="Instructor" />
                <div>
                  <h4>{course.instructor?.name || "Expert Instructor"}</h4>
                  <p>{course.instructor?.bio || "Experienced professional"}</p>
                </div>
              </div>
            </div>
            <div className={styles.courseCard}>
              <img src={course.thumbnail || "/placeholder.svg?height=300&width=400"} alt={course.title} />
              <div className={styles.pricing}>
                <div className={styles.price}>₹{course.price}</div>
                {course.originalPrice > course.price && (
                  <div className={styles.originalPrice}>₹{course.originalPrice}</div>
                )}
              </div>
              <button className={styles.enrollBtn} onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
              <div className={styles.includes}>
                <h4>This course includes:</h4>
                <ul>
                  <li>📹 {course.videos?.length || 0} video lectures</li>
                  <li>📝 {course.notes?.length || 0} downloadable resources</li>
                  <li>🏆 Certificate of completion</li>
                  <li>♾️ Lifetime access</li>
                  <li>📱 Access on mobile and desktop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.courseContent}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tab} ${activeTab === "curriculum" ? styles.active : ""}`}
              onClick={() => setActiveTab("curriculum")}
            >
              Curriculum
            </button>
            <button
              className={`${styles.tab} ${activeTab === "reviews" ? styles.active : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
            <button
              className={`${styles.tab} ${activeTab === "freevideos" ? styles.active : ""}`}
              onClick={() => setActiveTab("freevideos")}
            >
              Free Videos
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "overview" && (
              <div className={styles.overview}>
                <div className={styles.section}>
                  <h3>What you'll learn</h3>
                  <ul>
                    {course.whatYouWillLearn?.map((item, index) => <li key={index}>✅ {item}</li>) || (
                      <>
                        <li>✅ Master the fundamentals of the subject</li>
                        <li>✅ Build practical projects</li>
                        <li>✅ Gain industry-relevant skills</li>
                        <li>✅ Prepare for real-world applications</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className={styles.section}>
                  <h3>Requirements</h3>
                  <ul>
                    {course.requirements?.map((item, index) => <li key={index}>• {item}</li>) || (
                      <>
                        <li>• Basic computer knowledge</li>
                        <li>• Willingness to learn</li>
                        <li>• No prior experience required</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className={styles.section}>
                  <h3>Course Description</h3>
                  <p>{course.description}</p>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className={styles.curriculum}>
                <h3>Course Curriculum</h3>
                <div className={styles.curriculumList}>
                  {course.curriculum?.map((item, index) => (
                    <div key={index} className={styles.curriculumItem}>
                      <div className={styles.lessonNumber}>{index + 1}</div>
                      <div className={styles.lessonInfo}>
                        <h4>{item.title}</h4>
                        <span>{item.duration} min</span>
                      </div>
                      {item.isPreview && <span className={styles.previewBadge}>Preview</span>}
                    </div>
                  )) || (
                    <>
                      <div className={styles.curriculumItem}>
                        <div className={styles.lessonNumber}>1</div>
                        <div className={styles.lessonInfo}>
                          <h4>Introduction to the Course</h4>
                          <span>15 min</span>
                        </div>
                        <span className={styles.previewBadge}>Preview</span>
                      </div>
                      <div className={styles.curriculumItem}>
                        <div className={styles.lessonNumber}>2</div>
                        <div className={styles.lessonInfo}>
                          <h4>Getting Started</h4>
                          <span>30 min</span>
                        </div>
                      </div>
                      <div className={styles.curriculumItem}>
                        <div className={styles.lessonNumber}>3</div>
                        <div className={styles.lessonInfo}>
                          <h4>Core Concepts</h4>
                          <span>45 min</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className={styles.reviews}>
                <h3>Student Reviews</h3>
                <div className={styles.reviewsList}>
                  {course.reviews?.map((review, index) => (
                    <div key={index} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          <img src="/placeholder.svg?height=40&width=40" alt="Reviewer" />
                          <div>
                            <h4>{review.user?.name || "Anonymous"}</h4>
                            <div className={styles.reviewRating}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? styles.starFilled : styles.star}>
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  )) || <p>No reviews yet. Be the first to review this course!</p>}
                </div>
              </div>
            )}

            {activeTab === "freevideos" && (
              <div className={styles.freeVideos}>
                <h3>Free Preview Videos</h3>
                <div className={styles.videosList}>
                  {course.videos
                    ?.filter((video) => video.isFree)
                    .map((video, index) => (
                      <div key={index} className={styles.videoItem}>
                        <div className={styles.videoThumbnail}>
                          <img src="/placeholder.svg?height=120&width=200" alt={video.title} />
                          <div className={styles.playButton}>▶️</div>
                        </div>
                        <div className={styles.videoInfo}>
                          <h4>{video.title}</h4>
                          <span>{video.duration} min</span>
                        </div>
                      </div>
                    )) || (
                    <>
                      <div className={styles.videoItem}>
                        <div className={styles.videoThumbnail}>
                          <img src="/placeholder.svg?height=120&width=200" alt="Introduction" />
                          <div className={styles.playButton}>▶️</div>
                        </div>
                        <div className={styles.videoInfo}>
                          <h4>Course Introduction</h4>
                          <span>5 min</span>
                        </div>
                      </div>
                      <div className={styles.videoItem}>
                        <div className={styles.videoThumbnail}>
                          <img src="/placeholder.svg?height=120&width=200" alt="Preview" />
                          <div className={styles.playButton}>▶️</div>
                        </div>
                        <div className={styles.videoInfo}>
                          <h4>What You'll Learn</h4>
                          <span>8 min</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedCourses.length > 0 && (
          <div className={styles.relatedCourses}>
            <h3>Related Courses</h3>
            <div className={styles.relatedGrid}>
              {relatedCourses.map((relatedCourse) => (
                <Link key={relatedCourse._id} to={`/course/${relatedCourse._id}`} className={styles.relatedCard}>
                  <img
                    src={relatedCourse.thumbnail || "/placeholder.svg?height=150&width=250"}
                    alt={relatedCourse.title}
                  />
                  <div className={styles.relatedInfo}>
                    <h4>{relatedCourse.title}</h4>
                    <p>₹{relatedCourse.price}</p>
                    <span>⭐ {relatedCourse.rating || 4.5}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail
