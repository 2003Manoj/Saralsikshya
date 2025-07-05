import styles from "./About.module.css"

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      position: "Founder & CEO",
      image: "/placeholder-user.jpg",
      description: "20+ years of experience in education technology and curriculum development.",
    },
    {
      id: 2,
      name: "Prof. Meera Sharma",
      position: "Head of Academics",
      image: "/placeholder-user.jpg",
      description: "Former university professor with expertise in online learning methodologies.",
    },
    {
      id: 3,
      name: "Amit Patel",
      position: "Technology Director",
      image: "/placeholder-user.jpg",
      description: "Software engineer passionate about creating innovative educational solutions.",
    },
    {
      id: 4,
      name: "Sunita Gupta",
      position: "Content Manager",
      image: "/placeholder-user.jpg",
      description: "Educational content specialist with focus on student engagement and learning outcomes.",
    },
  ]

  const achievements = [
    {
      number: "50,000+",
      label: "Students Enrolled",
      icon: "👨‍🎓",
    },
    {
      number: "500+",
      label: "Expert Teachers",
      icon: "👩‍🏫",
    },
    {
      number: "1000+",
      label: "Courses Available",
      icon: "📚",
    },
    {
      number: "95%",
      label: "Success Rate",
      icon: "🏆",
    },
  ]

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>About Saral Sikshya</h1>
          <p>
            Empowering students with quality education through innovative online learning solutions. We believe that
            education should be accessible, affordable, and effective for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <div className={styles.missionText}>
            <h2>Our Mission</h2>
            <p>
              At Saral Sikshya, our mission is to democratize quality education by making it accessible to students from
              all backgrounds. We strive to create an engaging, interactive, and personalized learning experience that
              helps students achieve their academic goals and unlock their full potential.
            </p>
            <div className={styles.values}>
              <div className={styles.value}>
                <h3>🎯 Excellence</h3>
                <p>We maintain the highest standards in our content and teaching methodologies.</p>
              </div>
              <div className={styles.value}>
                <h3>🤝 Accessibility</h3>
                <p>Quality education should be available to everyone, regardless of their location or background.</p>
              </div>
              <div className={styles.value}>
                <h3>💡 Innovation</h3>
                <p>We continuously evolve our platform using the latest educational technologies.</p>
              </div>
            </div>
          </div>
          <div className={styles.missionImage}>
            <img src="/placeholder.jpg" alt="Our Mission" />
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className={styles.achievements}>
        <h2>Our Achievements</h2>
        <div className={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <div key={index} className={styles.achievementCard}>
              <div className={styles.achievementIcon}>{achievement.icon}</div>
              <div className={styles.achievementNumber}>{achievement.number}</div>
              <div className={styles.achievementLabel}>{achievement.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.team}>
        <h2>Meet Our Team</h2>
        <p className={styles.teamDescription}>
          Our dedicated team of educators, technologists, and content creators work tirelessly to provide you with the
          best learning experience.
        </p>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.teamCard}>
              <div className={styles.memberImage}>
                <img src={member.image || "/placeholder.svg"} alt={member.name} />
              </div>
              <div className={styles.memberInfo}>
                <h3>{member.name}</h3>
                <p className={styles.memberPosition}>{member.position}</p>
                <p className={styles.memberDescription}>{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.story}>
        <div className={styles.storyContent}>
          <h2>Our Story</h2>
          <div className={styles.storyText}>
            <p>
              Saral Sikshya was founded in 2020 with a simple yet powerful vision: to make quality education accessible
              to every student, regardless of their geographical location or economic background. What started as a
              small initiative to help students during the pandemic has now grown into a comprehensive online learning
              platform.
            </p>
            <p>
              Our journey began when our founder, Dr. Rajesh Kumar, noticed the challenges students faced in accessing
              quality educational resources. With his extensive experience in education and a passionate team of
              educators and technologists, Saral Sikshya was born.
            </p>
            <p>
              Today, we serve thousands of students across the country, offering courses from Class 6 to Class 12,
              competitive exam preparation, and skill development programs. Our success is measured not just in numbers,
              but in the success stories of our students who have achieved their dreams with our support.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className={styles.contactCta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>Join thousands of students who have transformed their academic performance with Saral Sikshya.</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryBtn}>Get Started Today</button>
            <button className={styles.secondaryBtn}>Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
