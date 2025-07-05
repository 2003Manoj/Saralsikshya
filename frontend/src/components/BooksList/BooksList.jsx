// BooksList.jsx
import { Link } from "react-router-dom"
import styles from "./BooksList.module.css"

const BooksList = ({ books }) => {
  const sampleBooks = [
    {
      _id: "1",
      title: "Complete Web Development Guide",
      author: "John Smith",
      price: 599,
      image: "/placeholder.png",
      category: "Programming",
      rating: 4.8,
    },
    {
      _id: "2",
      title: "Digital Marketing Handbook",
      author: "Sarah Johnson",
      price: 449,
      image: "/placeholder.png",
      category: "Marketing",
      rating: 4.6,
    },
    {
      _id: "3",
      title: "Data Science Essentials",
      author: "Mike Davis",
      price: 699,
      image: "/placeholder.png",
      category: "Data Science",
      rating: 4.9,
    },
    {
      _id: "4",
      title: "UI/UX Design Principles",
      author: "Emily Chen",
      price: 549,
      image: "/placeholder.png",
      category: "Design",
      rating: 4.7,
    },
  ]

  const displayBooks = books && books.length > 0 ? books : sampleBooks

  return (
    <section className={styles.booksList}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Featured Books</h2>
          <p>Expand your knowledge with our curated collection of books</p>
        </div>

        <div className={styles.booksGrid}>
          {displayBooks.slice(0, 4).map((book, index) => (
            <div key={book._id || book.id || `book-${index}`} className={styles.bookCard}>
              <div className={styles.bookImage}>
                <img
                  src={book.image || "/placeholder.png"}
                  alt={book.title || "Book cover"}
                  loading="lazy"
                />
                <div className={styles.bookOverlay}>
                  {/* You can add functionality here */}
                  <button
                    className={styles.previewBtn}
                    onClick={() => alert(`Preview feature coming soon for "${book.title}"!`)}
                  >
                    Preview
                  </button>
                </div>
              </div>
              <div className={styles.bookInfo}>
                <div className={styles.bookCategory}>{book.category || "General"}</div>
                <h3>{book.title || "Untitled Book"}</h3>
                <p className={styles.author}>by {book.author || "Unknown Author"}</p>
                <div className={styles.bookRating}>
                  <span className={styles.stars}>⭐ {book.rating?.toFixed(1) || "4.5"}</span>
                </div>
                <div className={styles.bookFooter}>
                  <div className={styles.price}>₹{book.price ?? "N/A"}</div>
                  <button
                    className={styles.buyBtn}
                    onClick={() => alert(`Buying "${book.title}" is coming soon!`)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewAllContainer}>
          <Link to="/books" className={styles.viewAllBtn}>
            View All Books
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BooksList