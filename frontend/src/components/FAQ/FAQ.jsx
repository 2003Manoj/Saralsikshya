"use client"

import { useState } from "react"
import styles from "./FAQ.module.css"

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqs = [
    {
      id: 1,
      question: "How do I enroll in a course?",
      answer:
        "You can enroll in any course by clicking the 'Enroll Now' button on the course page. You'll need to create an account and complete the payment process. Once enrolled, you'll have immediate access to all course materials.",
    },
    {
      id: 2,
      question: "Are the courses self-paced or scheduled?",
      answer:
        "Most of our courses are self-paced, allowing you to learn at your own speed. However, we also offer live classes and scheduled sessions for certain courses. Check the course details to see the format.",
    },
    {
      id: 3,
      question: "Do I get a certificate after completing a course?",
      answer:
        "Yes! Upon successful completion of a course, you'll receive a certificate of completion that you can download and share on your professional profiles like LinkedIn.",
    },
    {
      id: 4,
      question: "What if I'm not satisfied with a course?",
      answer:
        "We offer a 30-day money-back guarantee for all our courses. If you're not satisfied with the course content or quality, you can request a full refund within 30 days of enrollment.",
    },
    {
      id: 5,
      question: "Can I access courses on mobile devices?",
      answer:
        "Our platform is fully responsive and works seamlessly on all devices including smartphones, tablets, and desktops. You can learn anywhere, anytime.",
    },
    {
      id: 6,
      question: "Do you offer student discounts?",
      answer:
        "Yes, we offer special discounts for students, bulk purchases, and during promotional periods. Sign up for our newsletter to stay updated on the latest offers and discounts.",
    },
    {
      id: 7,
      question: "How long do I have access to a course?",
      answer:
        "Once you enroll in a course, you have lifetime access to all course materials, including any future updates. You can revisit the content anytime you want.",
    },
    {
      id: 8,
      question: "Are there any prerequisites for the courses?",
      answer:
        "Prerequisites vary by course. Some beginner courses have no prerequisites, while advanced courses may require prior knowledge. Check the course description for specific requirements.",
    },
  ]

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section className={styles.faq}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our courses and platform</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <div key={faq.id} className={`${styles.faqItem} ${openFAQ === faq.id ? styles.open : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFAQ(faq.id)}>
                <span>{faq.question}</span>
                <span className={styles.faqIcon}>{openFAQ === faq.id ? "−" : "+"}</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
