"use client"

import { useState, useEffect } from "react"
import styles from "./Books.module.css"

const Books = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Sample books data (replace with API call)
  const sampleBooks = [
    {
      id: 1,
      title: "Complete Guide to Class 10 Mathematics",
      author: "Dr. Rajesh Kumar",
      category: "Mathematics",
      price: 450,
      originalPrice: 600,
      image: "/placeholder.jpg",
      rating: 4.5,
      reviews: 128,
      description:
        "Comprehensive guide covering all topics in Class 10 Mathematics with solved examples and practice questions.",
    },
    {
      id: 2,
      title: "Science Simplified - Class 10",
      author: "Prof. Meera Sharma",
      category: "Science",
      price: 520,
      originalPrice: 700,
      image: "/placeholder.jpg",
      rating: 4.7,
      reviews: 95,
      description: "Easy-to-understand explanations of Physics, Chemistry, and Biology concepts for Class 10 students.",
    },
    {
      id: 3,
      title: "English Grammar & Composition",
      author: "Sarah Johnson",
      category: "English",
      price: 380,
      originalPrice: 500,
      image: "/placeholder.jpg",
      rating: 4.3,
      reviews: 76,
      description: "Master English grammar rules and improve your writing skills with this comprehensive guide.",
    },
    {
      id: 4,
      title: "Social Studies Made Easy",
      author: "Dr. Amit Patel",
      category: "Social Studies",
      price: 420,
      originalPrice: 550,
      image: "/placeholder.jpg",
      rating: 4.4,
      reviews: 112,
      description: "Complete coverage of History, Geography, and Civics for Class 10 with maps and illustrations.",
    },
    {
      id: 5,
      title: "Advanced Mathematics for Class 12",
      author: "Prof. Sunita Gupta",
      category: "Mathematics",
      price: 650,
      originalPrice: 850,
      image: "/placeholder.jpg",
      rating: 4.6,
      reviews: 89,
      description: "Advanced mathematical concepts explained with detailed solutions and practice problems.",
    },
    {
      id: 6,
      title: "Physics Fundamentals",
      author: "Dr. Vikram Singh",
      category: "Science",
      price: 580,
      originalPrice: 750,
      image: "/placeholder.jpg",
      rating: 4.5,
      reviews: 134,
      description: "Fundamental physics concepts with real-world applications and numerical problems.",
    },
  ]

  const categories = ["all", "Mathematics", "Science", "English", "Social Studies"]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBooks(sampleBooks)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (bookId) => {
    // Add to cart functionality
    console.log("Added book to cart:", bookId)
    alert("Book added to cart!")
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Educational Books</h1>
        <p>Discover our collection of educational books to enhance your learning journey</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilter}>
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.booksGrid}>
        {filteredBooks.map((book) => (
          <div key={book.id} className={styles.bookCard}>
            <div className={styles.bookImage}>
              <img src={book.image || "/placeholder.svg"} alt={book.title} />
              <div className={styles.discount}>
                {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% OFF
              </div>
            </div>

            <div className={styles.bookInfo}>
              <h3 className={styles.bookTitle}>{book.title}</h3>
              <p className={styles.bookAuthor}>by {book.author}</p>
              <p className={styles.bookDescription}>{book.description}</p>

              <div className={styles.bookRating}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(book.rating) ? styles.starFilled : styles.starEmpty}>
                      ★
                    </span>
                  ))}
                </div>
                <span className={styles.ratingText}>
                  {book.rating} ({book.reviews} reviews)
                </span>
              </div>

              <div className={styles.bookPrice}>
                <span className={styles.currentPrice}>₹{book.price}</span>
                <span className={styles.originalPrice}>₹{book.originalPrice}</span>
              </div>

              <div className={styles.bookActions}>
                <button className={styles.addToCartBtn} onClick={() => handleAddToCart(book.id)}>
                  Add to Cart
                </button>
                <button className={styles.viewDetailsBtn}>View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className={styles.noResults}>
          <h3>No books found</h3>
          <p>Try adjusting your search criteria or browse all categories.</p>
        </div>
      )}
    </div>
  )
}

export default Books
