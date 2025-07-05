import styles from "./HighlightBlock.module.css"

const HighlightBlock = () => {
  const features = [
    {
      icon: "🎯",
      title: "Live Class",
      description: "Interactive live sessions with expert instructors",
    },
    {
      icon: "📝",
      title: "Daily Practice",
      description: "Regular practice sessions to reinforce learning",
    },
    {
      icon: "📚",
      title: "Notes",
      description: "Comprehensive study materials and notes",
    },
    {
      icon: "🎓",
      title: "Guided Learning",
      description: "Step-by-step guidance throughout your journey",
    },
    {
      icon: "🤖",
      title: "Artificial Intelligence",
      description: "AI-powered personalized learning experience",
    },
  ]

  return (
    <section className={styles.highlightBlock}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <img src="/placeholder.svg?height=400&width=500" alt="Smart Learning" />
          </div>
          <div className={styles.textSection}>
            <h2>A Smart Choice for Learning</h2>
            <p>
              Experience the future of education with our comprehensive learning platform that combines traditional
              teaching methods with cutting-edge technology to deliver an unparalleled learning experience.
            </p>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <div className={styles.featureContent}>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HighlightBlock
