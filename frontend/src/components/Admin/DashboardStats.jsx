import React, { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, Eye, Award, Calendar, Activity, ArrowUp, ArrowDown, MoreHorizontal, Star, Clock, CheckCircle, AlertCircle, UserPlus, BookPlus, Target, BarChart3 } from 'lucide-react';
import styles from './DashboardStats.module.css';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    userGrowth: 0,
    courseGrowth: 0,
    revenueGrowth: 0,
    enrollmentGrowth: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API Headers
  const getHeaders = () => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError(err.message || 'Error fetching dashboard stats');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/activities?limit=5`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRecentActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Recent activities error:', err);
    }
  };

  // Fetch top courses
  const fetchTopCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/top-courses?limit=4`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setTopCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Top courses error:', err);
    }
  };

  // Fetch monthly data
  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/monthly-data`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setMonthlyData(data.data || []);
      }
    } catch (err) {
      console.error('Monthly data error:', err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivities(),
        fetchTopCourses(),
        fetchMonthlyData()
      ]);
    };

    fetchAllData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, growth, icon: Icon, color, suffix = '' }) => (
    <div className={styles.statCard}>
      <div className={styles.statCardContent}>
        <div className={styles.statCardHeader}>
          <div className={styles.statCardTitle}>{title}</div>
          <div className={`${styles.statCardIcon} ${styles[color]}`}>
            <Icon className={styles.icon} />
          </div>
        </div>
        <div className={styles.statCardValue}>
          {typeof value === 'number' && value > 999 ? 
            (value / 1000).toFixed(1) + 'k' : 
            value.toLocaleString()
          }{suffix}
        </div>
        <div className={styles.statCardGrowth}>
          <div className={`${styles.growthIndicator} ${growth >= 0 ? styles.positive : styles.negative}`}>
            {growth >= 0 ? <ArrowUp className={styles.growthIcon} /> : <ArrowDown className={styles.growthIcon} />}
            <span className={styles.growthValue}>{Math.abs(growth)}%</span>
          </div>
          <span className={styles.growthLabel}>from last month</span>
        </div>
      </div>
    </div>
  );

  const getActivityIcon = (activity) => {
    const iconMap = {
      UserPlus,
      BookPlus,
      CheckCircle,
      DollarSign,
      BookOpen
    };
    const IconComponent = iconMap[activity.icon] || Activity;
    return <IconComponent className={styles.activityIcon} />;
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardStats} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>
          <p className={styles.dashboardSubtitle}>
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={fetchDashboardStats}>
            <Activity className={styles.buttonIcon} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          growth={stats.userGrowth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          growth={stats.courseGrowth}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Active Enrollments"
          value={stats.activeEnrollments}
          growth={stats.enrollmentGrowth}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainContent}>
        {/* Charts Section */}
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Monthly Overview</h3>
              <button className={styles.chartMenuButton}>
                <MoreHorizontal className={styles.menuIcon} />
              </button>
            </div>
            <div className={styles.chartContent}>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.usersColor}`}></div>
                  <span>Users</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.coursesColor}`}></div>
                  <span>Courses</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.revenueColor}`}></div>
                  <span>Revenue</span>
                </div>
              </div>
              <div className={styles.chartContainer}>
                {monthlyData.map((data, index) => (
                  <div key={index} className={styles.chartBar}>
                    <div className={styles.barGroup}>
                      <div 
                        className={`${styles.bar} ${styles.usersBar}`}
                        style={{ height: `${(data.users / 1000) * 100}%` }}
                      ></div>
                      <div 
                        className={`${styles.bar} ${styles.coursesBar}`}
                        style={{ height: `${(data.courses / 30) * 100}%` }}
                      ></div>
                      <div 
                        className={`${styles.bar} ${styles.revenueBar}`}
                        style={{ height: `${(data.revenue / 25000) * 100}%` }}
                      ></div>
                    </div>
                    <div className={styles.barLabel}>{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className={styles.topCourses}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Top Performing Courses</h3>
            <button className={styles.viewAllButton}>View All</button>
          </div>
          <div className={styles.coursesList}>
            {topCourses.map((course) => (
              <div key={course.id} className={styles.courseItem}>
                <div className={styles.courseInfo}>
                  <h4 className={styles.courseTitle}>{course.title}</h4>
                  <p className={styles.courseInstructor}>by {course.instructor}</p>
                  <div className={styles.courseStats}>
                    <div className={styles.courseStat}>
                      <Users className={styles.statIcon} />
                      <span>{course.enrollments}</span>
                    </div>
                    <div className={styles.courseStat}>
                      <Star className={styles.statIcon} />
                      <span>{course.rating}</span>
                    </div>
                    <div className={styles.courseStat}>
                      <DollarSign className={styles.statIcon} />
                      <span>{formatCurrency(course.revenue)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.courseProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className={styles.recentActivities}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Activities</h3>
            <button className={styles.viewAllButton}>View All</button>
          </div>
          <div className={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={`${styles.activityIconContainer} ${styles[activity.color]}`}>
                  {getActivityIcon(activity)}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <span className={styles.activityUser}>{activity.user}</span>
                    <span className={styles.activityAction}>{activity.action}</span>
                  </div>
                  <div className={styles.activityTime}>
                    <Clock className={styles.timeIcon} />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Quick Actions</h3>
          </div>
          <div className={styles.actionsList}>
            <button className={styles.actionButton}>
              <UserPlus className={styles.actionIcon} />
              <span>Add User</span>
            </button>
            <button className={styles.actionButton}>
              <BookPlus className={styles.actionIcon} />
              <span>Create Course</span>
            </button>
            <button className={styles.actionButton}>
              <BarChart3 className={styles.actionIcon} />
              <span>View Reports</span>
            </button>
            <button className={styles.actionButton}>
              <Target className={styles.actionIcon} />
              <span>Set Goals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
