"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Banner from "../../components/Banner/Banner"
import Testimonials from "../../components/Testimonials/Testimonials"
import ExploreCourses from "../../components/ExploreCourses/ExploreCourses"
import LiveClasses from "../../components/LiveClasses/LiveClasses"
import HighlightBlock from "../../components/HighlightBlock/HighlightBlock"
import StudentReviews from "../../components/StudentReviews/StudentReviews"
import BooksList from "../../components/BooksList/BooksList"
import FAQ from "../../components/FAQ/FAQ"
import Statistics from "../../components/Statistics/Statistics"
import styles from "./Home.module.css"

const Home = () => {
  // Toggle this to true to enable API fetching
  const [useApi] = useState(false)

  // State for courses and books
  const [courses, setCourses] = useState([])
  const [books, setBooks] = useState([])

  // Dummy fallback data for rendering without API
  const dummyCourses = [
    { id: 1, title: "Course 1", description: "Intro to Course 1" },
    { id: 2, title: "Course 2", description: "Intro to Course 2" },
    { id: 3, title: "Course 3", description: "Intro to Course 3" },
    { id: 4, title: "Course 4", description: "Intro to Course 4" },
  ]

  const dummyBooks = [
    { id: 1, title: "Book 1", author: "Author 1" },
    { id: 2, title: "Book 2", author: "Author 2" },
  ]

  useEffect(() => {
    if (useApi) {
      fetchCourses()
      fetchBooks()
    } else {
      // Use dummy data instead of fetching
      setCourses(dummyCourses)
      setBooks(dummyBooks)
    }
  }, [useApi])

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/courses")
      setCourses(response.data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await axios.get("/api/books")
      setBooks(response.data.books || [])
    } catch (error) {
      console.error("Error fetching books:", error)
    }
  }

  return (
    <div className={styles.home}>
      <Banner />
      <Testimonials courses={courses.slice(0, 3)} />
      <ExploreCourses courses={courses} />
      <LiveClasses />
      <HighlightBlock />
      <StudentReviews />
      <BooksList books={books} />
      <FAQ />
      <Statistics />
    </div>
  )
}

export default Home
