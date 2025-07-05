import { Link } from "react-router-dom"
import styles from "./Footer.module.css"

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="Saral Sikshya" />
              <span>Saral Sikshya</span>
            </div>
            <p className={styles.description}>
              Empowering learners worldwide with quality education and expert guidance. Join our community of learners
              and transform your career with our comprehensive courses.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook">
                📘
              </a>
              <a href="#" aria-label="Twitter">
                🐦
              </a>
              <a href="#" aria-label="Instagram">
                📷
              </a>
              <a href="#" aria-label="LinkedIn">
                💼
              </a>
              <a href="#" aria-label="YouTube">
                📺
              </a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/courses">Our Courses</Link>
              </li>
              <li>
                <Link to="/books">Books</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <a href="#faq">FAQs</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Categories</h3>
            <ul>
              <li>
                <a href="#">Programming</a>
              </li>
              <li>
                <a href="#">Design</a>
              </li>
              <li>
                <a href="#">Business</a>
              </li>
              <li>
                <a href="#">Marketing</a>
              </li>
              <li>
                <a href="#">Data Science</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Support</h3>
            <ul>
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Community</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Contact Info</h3>
            <div className={styles.contactInfo}>
              <p>📍 123 Education Street, Learning City, LC 12345</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>✉️ info@saralsikshya.com</p>
            </div>
            <div className={styles.newsletter}>
              <h4>Subscribe to Newsletter</h4>
              <div className={styles.newsletterForm}>
                <input type="email" placeholder="Enter your email" />
                <button>Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.legal}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Cookie Policy</a>
          </div>
          <div className={styles.copyright}>
            <p>&copy; 2024 Saral Sikshya. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
