import React, { useState, useEffect } from 'react';
import styles from "./CourseManagement.module.css";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL
 || 'http://localhost:5000/api';

// API utility function
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Course API functions
const courseAPI = {
  // Get all courses for admin (includes inactive courses)
  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/admin/courses${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url);
  },

  // Get course by ID (public route)
  getCourseById: async (id) => {
    return apiRequest(`/courses/${id}`);
  },

  // Create new course
  createCourse: async (courseData) => {
    return apiRequest('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  // Update course
  updateCourse: async (id, courseData) => {
    return apiRequest(`/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  // Delete course
  deleteCourse: async (id) => {
    return apiRequest(`/admin/courses/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle course status
  toggleCourseStatus: async (id, isActive) => {
    return apiRequest(`/admin/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  // Get course statistics
  getCourseStats: async () => {
    return apiRequest('/admin/courses/stats');
  },
};

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const categories = [
    "Web Development", "Mobile Development", "Data Science", "Machine Learning",
    "DevOps", "Cybersecurity", "UI/UX Design", "Digital Marketing",
    "Business", "Programming", "Database", "Cloud Computing"
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: {
      name: '',
      bio: '',
      image: ''
    },
    category: '',
    level: '',
    price: '',
    originalPrice: '',
    duration: '',
    lessons: '',
    image: '',
    rating: 0,
    numReviews: 0,
    isActive: true,
    tags: '',
    requirements: '',
    whatYouWillLearn: '',
    enrolledStudents: 0
  });

  // Fetch courses with filters
  const fetchCourses = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterLevel && { level: filterLevel }),
      };

      const response = await courseAPI.getAllCourses(params);
      
      setCourses(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create course
  const createCourse = async (courseData) => {
    try {
      const response = await courseAPI.createCourse(courseData);
      await fetchCourses(); // Refresh the list
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Update course
  const updateCourse = async (id, courseData) => {
    try {
      const response = await courseAPI.updateCourse(id, courseData);
      await fetchCourses(); // Refresh the list
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Delete course
  const deleteCourse = async (id) => {
    try {
      await courseAPI.deleteCourse(id);
      await fetchCourses(); // Refresh the list
    } catch (error) {
      throw error;
    }
  };

  // Toggle course status
  const toggleStatus = async (id, isActive) => {
    try {
      await courseAPI.toggleCourseStatus(id, isActive);
      await fetchCourses(); // Refresh the list
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '' || filterCategory !== '' || filterLevel !== '') {
        fetchCourses(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterCategory, filterLevel]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const courseData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
      lessons: parseInt(formData.lessons),
      enrolledStudents: parseInt(formData.enrolledStudents) || 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      requirements: formData.requirements.split('\n').filter(req => req.trim()),
      whatYouWillLearn: formData.whatYouWillLearn.split('\n').filter(learn => learn.trim())
    };

    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, courseData);
      } else {
        await createCourse(courseData);
      }
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      setError(error.message);
      if (error.errors) {
        setError(error.errors.join(', '));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: {
        name: '',
        bio: '',
        image: ''
      },
      category: '',
      level: '',
      price: '',
      originalPrice: '',
      duration: '',
      lessons: '',
      image: '',
      rating: 0,
      numReviews: 0,
      isActive: true,
      tags: '',
      requirements: '',
      whatYouWillLearn: '',
      enrolledStudents: 0
    });
    setEditingCourse(null);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      ...course,
      tags: course.tags.join(', '),
      requirements: course.requirements.join('\n'),
      whatYouWillLearn: course.whatYouWillLearn.join('\n')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    await toggleStatus(id, !currentStatus);
  };

  const handlePageChange = (newPage) => {
    fetchCourses(newPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLevel('');
    fetchCourses(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Course Management</h1>
        <button 
          className={styles.addBtn}
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          Add New Course
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <span>Error: {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Levels</option>
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        <button onClick={clearFilters} className={styles.clearBtn}>
          Clear Filters
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading...</span>
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                  rows={4}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Instructor Name *</label>
                  <input
                    type="text"
                    name="instructor.name"
                    value={formData.instructor.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Instructor Bio</label>
                <textarea
                  name="instructor.bio"
                  value={formData.instructor.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 8 weeks"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Number of Lessons *</label>
                  <input
                    type="number"
                    name="lessons"
                    value={formData.lessons}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Requirements (one per line)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Basic computer skills&#10;No programming experience required"
                />
              </div>

              <div className={styles.formGroup}>
                <label>What You Will Learn (one per line)</label>
                <textarea
                  name="whatYouWillLearn"
                  value={formData.whatYouWillLearn}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Build responsive websites&#10;Master JavaScript fundamentals"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active Course
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className={styles.coursesGrid}>
        {courses.map(course => (
          <div key={course._id} className={styles.courseCard}>
            <div className={styles.courseHeader}>
              <h3 className={styles.courseTitle}>{course.title}</h3>
              <div className={styles.courseActions}>
                <button 
                  className={styles.statusBtn}
                  onClick={() => handleStatusToggle(course._id, course.isActive)}
                  disabled={loading}
                >
                  {course.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className={styles.editBtn}
                  onClick={() => handleEdit(course)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(course._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className={styles.courseInfo}>
              <span className={styles.category}>{course.category}</span>
              <span className={styles.level}>{course.level}</span>
              <span className={`${styles.status} ${course.isActive ? styles.active : styles.inactive}`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className={styles.courseDescription}>{course.description}</p>
            
            <div className={styles.courseDetails}>
              <div className={styles.instructor}>
                <strong>Instructor:</strong> {course.instructor.name}
              </div>
              <div className={styles.stats}>
                <span>₹{course.price}</span>
                <span>{course.lessons} lessons</span>
                <span>{course.duration}</span>
              </div>
              <div className={styles.enrollment}>
                <span>⭐ {course.rating.toFixed(1)} ({course.numReviews} reviews)</span>
                <span>👥 {course.enrolledStudents} students</span>
              </div>
            </div>
            
            {course.tags && course.tags.length > 0 && (
              <div className={styles.tags}>
                {course.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.page} of {pagination.pages} 
            ({pagination.total} total courses)
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages || loading}
          >
            Next
          </button>
        </div>
      )}

      {courses.length === 0 && !loading && (
        <div className={styles.empty}>
          <h3>No courses found</h3>
          <p>Try adjusting your search or filter criteria, or add a new course.</p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;