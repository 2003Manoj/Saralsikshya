import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Shield,
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';
import styles from './UserManagement.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentUser, setCurrentUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    isActive: true
  });

  // API Base URL - Update this with your actual backend URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Get token from localStorage (assuming you store it there after login)
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API Headers with proper error handling
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

  // Fetch all users from backend - Updated to match your backend structure
  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (page > 1) queryParams.append('page', page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const url = `${API_BASE_URL}/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('Fetching users from:', url); // Debug log

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check your backend URL.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Debug log
      
      // Handle different response structures
      if (data.success !== undefined) {
        // If response has success field
        if (data.success) {
          const usersData = data.users || data.data || [];
          setUsers(usersData);
          setPagination(prev => ({
            ...prev,
            currentPage: data.currentPage || page,
            totalPages: data.totalPages || 1,
            total: data.total || usersData.length
          }));
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } else if (Array.isArray(data)) {
        // If response is directly an array
        setUsers(data);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: 1,
          total: data.length
        }));
      } else if (data.data && Array.isArray(data.data)) {
        // If response has data field with array
        setUsers(data.data);
        setPagination(prev => ({
          ...prev,
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 1,
          total: data.total || data.data.length
        }));
      } else {
        console.error('Unexpected response format:', data);
        setError('Unexpected response format from server');
      }
    } catch (err) {
      setError(err.message || 'Error fetching users');
      console.error('Fetch users error:', err);
      
      // Set empty state on error
      setUsers([]);
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        total: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Create new user - Updated endpoint
  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Create user response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success || data.user || data.data) {
        setSuccess('User created successfully');
        await fetchUsers(pagination.currentPage, searchTerm);
        closeModal();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err.message || 'Error creating user');
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user - Updated endpoint
  const updateUser = async (userId, userData) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Update user response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success || data.user || data.data) {
        setSuccess('User updated successfully');
        await fetchUsers(pagination.currentPage, searchTerm);
        closeModal();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err.message || 'Error updating user');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user - Updated endpoint
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();
      console.log('Delete user response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success || response.status === 204) {
        setSuccess('User deleted successfully');
        await fetchUsers(pagination.currentPage, searchTerm);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'Error deleting user');
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status - Updated endpoint
  const toggleUserStatusAPI = async (userId, isActive) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive })
      });

      const data = await response.json();
      console.log('Toggle status response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success || data.user || data.data) {
        setSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        await fetchUsers(pagination.currentPage, searchTerm);
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (err) {
      setError(err.message || 'Error updating user status');
      console.error('Toggle user status error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load with better error handling
  useEffect(() => {
    const initializeUsers = async () => {
      try {
        await fetchUsers();
      } catch (err) {
        console.error('Failed to initialize users:', err);
      }
    };
    
    initializeUsers();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    let filtered = users;
    
    // Frontend filtering for role (since backend may not filter by role)
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(filtered);
  }, [users, filterRole]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        fetchUsers(1, searchTerm);
      } else {
        fetchUsers(1, '');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || (modalMode === 'create' && !formData.password)) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Password validation for create mode
    if (modalMode === 'create' && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (modalMode === 'create') {
      createUser(formData);
    } else if (modalMode === 'edit') {
      const updateData = { ...formData };
      // Remove password if it's empty during update
      if (!updateData.password) {
        delete updateData.password;
      }
      updateUser(currentUser._id, updateData);
    }
  };

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setCurrentUser(user);
    setError('');
    setSuccess('');
    
    if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        isActive: true
      });
    } else if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setShowPassword(false);
    setError('');
    setSuccess('');
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const toggleUserStatus = (userId, currentStatus) => {
    toggleUserStatusAPI(userId, !currentStatus);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return styles.progressGreen;
    if (progress >= 60) return styles.progressBlue;
    if (progress >= 40) return styles.progressYellow;
    return styles.progressRed;
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  // Show error/success messages
  const showMessage = (message, type = 'info') => {
    const messageClass = type === 'error' ? styles.errorMessage : styles.successMessage;
    return (
      <div className={messageClass}>
        {type === 'error' ? <AlertCircle className={styles.messageIcon} /> : <Check className={styles.messageIcon} />}
        {message}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Users className={styles.icon} />
            </div>
            <h1 className={styles.headerTitle}>User Management</h1>
          </div>
          <button
            onClick={() => openModal('create')}
            className={styles.addButton}
            disabled={loading}
          >
            <Plus className={styles.buttonIcon} />
            Add User
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && showMessage(error, 'error')}
      {success && showMessage(success, 'success')}

      {/* Debug Information - Remove in production */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong><br />
        API URL: {API_BASE_URL}<br />
        Token: {getToken() ? 'Present' : 'Missing'}<br />
        Users Count: {users.length}<br />
        Filtered Users: {filteredUsers.length}<br />
        Loading: {loading ? 'Yes' : 'No'}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Search and Filter */}
        <div className={styles.searchSection}>
          <div className={styles.searchContent}>
            <div className={styles.searchFilters}>
              <div className={styles.searchInputContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  disabled={loading}
                />
              </div>
              <div className={styles.filterContainer}>
                <Filter className={styles.filterIcon} />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className={styles.filterSelect}
                  disabled={loading}
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className={styles.loadingContainer}>
            <Loader className={styles.loadingIcon} />
            <span>Loading...</span>
          </div>
        )}

        {/* Users Grid */}
        <div className={styles.usersGrid}>
          {filteredUsers.map(user => (
            <div key={user._id} className={styles.userCard}>
              <div className={styles.userCardContent}>
                {/* User Header */}
                <div className={styles.userHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>{user.name}</h3>
                      <div className={styles.userBadges}>
                        <span className={`${styles.badge} ${user.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                          {user.role === 'admin' ? (
                            <>
                              <Shield className={styles.badgeIcon} />
                              Admin
                            </>
                          ) : (
                            'User'
                          )}
                        </span>
                        <span className={`${styles.badge} ${user.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Contact Info */}
                <div className={styles.userContactInfo}>
                  <div className={styles.contactItem}>
                    <Mail className={styles.contactIcon} />
                    <span className={styles.contactText}>{user.email}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <Phone className={styles.contactIcon} />
                    <span className={styles.contactText}>{user.phone}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <Calendar className={styles.contactIcon} />
                    <span className={styles.contactText}>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Enrolled Courses */}
                {user.enrolledCourses && user.enrolledCourses.length > 0 && (
                  <div className={styles.coursesSection}>
                    <div className={styles.coursesHeader}>
                      <BookOpen className={styles.coursesIcon} />
                      <span className={styles.coursesTitle}>Enrolled Courses</span>
                    </div>
                    <div className={styles.coursesList}>
                      {user.enrolledCourses.slice(0, 2).map((course, index) => (
                        <div key={index} className={styles.courseItem}>
                          <div className={styles.courseHeader}>
                            <span className={styles.courseName}>
                              {course.course?.title || 'Course Name'}
                            </span>
                            <span className={styles.courseProgress}>{course.progress}%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={`${styles.progressFill} ${getProgressColor(course.progress)}`}
                              style={{width: `${course.progress}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                      {user.enrolledCourses.length > 2 && (
                        <div className={styles.moreCourses}>
                          +{user.enrolledCourses.length - 2} more courses
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className={styles.userActions}>
                  <button
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                    className={`${styles.statusButton} ${user.isActive ? styles.deactivateButton : styles.activateButton}`}
                    disabled={loading}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => openModal('view', user)}
                      className={styles.actionButton}
                      disabled={loading}
                    >
                      <Eye className={styles.actionIcon} />
                    </button>
                    <button
                      onClick={() => openModal('edit', user)}
                      className={styles.actionButton}
                      disabled={loading}
                    >
                      <Edit className={styles.actionIcon} />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className={styles.actionButton}
                      disabled={loading}
                    >
                      <Trash2 className={styles.actionIcon} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.paginationInfo}>
              Page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.total} total users)
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loading}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Users className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No users found</h3>
            <p className={styles.emptyText}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'No users available.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {modalMode === 'create' ? 'Add New User' : 
                   modalMode === 'edit' ? 'Edit User' : 'User Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className={styles.closeButton}
                  disabled={loading}
                >
                  <X className={styles.closeIcon} />
                </button>
              </div>

              {modalMode === 'view' ? (
                <div className={styles.userDetailView}>
                  <div className={styles.userDetailHeader}>
                    <div className={styles.userDetailAvatar}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className={styles.userDetailName}>{currentUser.name}</h3>
                    <div className={styles.userDetailBadges}>
                      <span className={`${styles.badge} ${currentUser.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                        {currentUser.role === 'admin' ? (
                          <>
                            <Shield className={styles.badgeIcon} />
                            Admin
                          </>
                        ) : (
                          'User'
                        )}
                      </span>
                      <span className={`${styles.badge} ${currentUser.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
                        {currentUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.userDetailInfo}>
                    <div className={styles.contactItem}>
                      <Mail className={styles.contactIcon} />
                      <span>{currentUser.email}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <Phone className={styles.contactIcon} />
                      <span>{currentUser.phone}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <Calendar className={styles.contactIcon} />
                      <span>Joined {formatDate(currentUser.createdAt)}</span>
                    </div>
                  </div>

                  {currentUser.enrolledCourses && currentUser.enrolledCourses.length > 0 && (
                    <div className={styles.userDetailCourses}>
                      <h4 className={styles.coursesDetailTitle}>Enrolled Courses</h4>
                      <div className={styles.coursesDetailList}>
                        {currentUser.enrolledCourses.map((course, index) => (
                          <div key={index} className={styles.courseDetailItem}>
                            <div className={styles.courseDetailHeader}>
                              <span className={styles.courseDetailName}>
                                {course.course?.title || 'Course Name'}
                              </span>
                              <span className={styles.courseDetailProgress}>{course.progress}%</span>
                            </div>
                            <div className={styles.progressBar}>
                              <div 
                                className={`${styles.progressFill} ${getProgressColor(course.progress)}`}
                                style={{width: `${course.progress}%`}}
                              ></div>
                            </div>
                            <div className={styles.courseDetailDate}>
                              Enrolled: {formatDate(course.enrolledAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.formContainer}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                      className={styles.formInput}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className={styles.formInput}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Password {modalMode === 'create' ? '*' : '(leave blank to keep current)'}
                    </label>
                    <div className={styles.passwordContainer}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={modalMode === 'create'}
                        minLength={6}
                        className={styles.formInput}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.passwordToggle}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className={styles.passwordIcon} /> : <Eye className={styles.passwordIcon} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      disabled={loading}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className={styles.formCheckbox}
                      disabled={loading}
                    />
                    <label className={styles.checkboxLabel}>
                      Active user
                    </label>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={closeModal}
                      className={styles.cancelButton}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader className={styles.buttonIcon} />
                          Processing...
                        </>
                      ) : (
                        modalMode === 'create' ? 'Create User' : 'Update User'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;