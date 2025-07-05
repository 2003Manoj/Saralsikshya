"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import UserManagement from "../../components/Admin/UserManagement"
import CourseManagement from "../../components/Admin/CourseManagement"
import DashboardStats from "../../components/Admin/DashboardStats"
import styles from "./AdminDashboard.module.css"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
      return
    }
    fetchDashboardStats()
  }, [user, navigate])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("/api/admin/dashboard")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "admin") {
    return <div>Access Denied</div>
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeTab === "dashboard" ? styles.active : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "courses" ? styles.active : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Course Management
          </button>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1>
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "users" && "User Management"}
            {activeTab === "courses" && "Course Management"}
          </h1>
        </div>

        <div className={styles.contentBody}>
          {activeTab === "dashboard" && <DashboardStats stats={stats} />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "courses" && <CourseManagement />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
