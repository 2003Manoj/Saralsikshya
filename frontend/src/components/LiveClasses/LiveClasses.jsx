import styles from "./LiveClasses.module.css"

const LiveClasses = () => {
  return (
    <section className={styles.liveClasses}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h2>Live Interactive Classes</h2>
            <p>
              Join our live interactive sessions where you can directly interact with expert instructors, ask questions
              in real-time, and learn alongside fellow students from around the world.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🎥</div>
                <div>
                  <h4>HD Video Quality</h4>
                  <p>Crystal clear video streaming for the best learning experience</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>💬</div>
                <div>
                  <h4>Real-time Chat</h4>
                  <p>Interactive chat system to ask questions and engage with instructors</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📱</div>
                <div>
                  <h4>Multi-device Support</h4>
                  <p>Access classes from any device - desktop, tablet, or mobile</p>
                </div>
              </div>
            </div>
            <button className={styles.joinBtn}>Join Next Live Class</button>
          </div>
          <div className={styles.imageContent}>
            <img src="/placeholder.svg?height=400&width=500" alt="Live Classes" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default LiveClasses
