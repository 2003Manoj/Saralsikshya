import React, { useState, useEffect } from 'react';
import styles from './CourseManagement.module.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API Headers
const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Course API functions
const courseAPI = {
  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/courses${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  createCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  updateCourse: async (id, courseData) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  deleteCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  toggleCourseStatus: async (id, isActive) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },
};

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Hierarchical category structure
  const categoryStructure = {
    'लोकसेवा': {
      'निजामति': ['शाखा अधिकृत', 'नासु', 'खरिदार', 'प्राविधिक', 'सहायक', 'विद्यालय', 'निरीक्षक'],
      'संस्थान': ['टेलिकम', 'विद्युत', 'खाद्यन्न'],
      'सुरक्षा सेवा': [],
      'प्रविधिक': [],
      'प्रदेश लोक सेवा': ['कोशी प्रदेश', 'मधेस प्रदेश', 'बागमती प्रदेश', 'गण्डकी प्रदेश', 'लुम्बिनी प्रदेश'],
      'बैंक': []
    },
    'Web Development': {
      'Frontend': ['React', 'Vue.js', 'Angular'],
      'Backend': ['Node.js', 'Python', 'Java'],
      'Full Stack': []
    },
    'Data Science': {
      'Machine Learning': ['Supervised', 'Unsupervised', 'Deep Learning'],
      'Analytics': ['Statistics', 'Visualization', 'Big Data']
    }
  };

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: { name: '', bio: '', image: '' },
    category: '',
    subCategory: '',
    subSubCategory: '',
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

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Get available subcategories based on selected category
  const getSubCategories = (category) => {
    return categoryStructure[category] ? Object.keys(categoryStructure[category]) : [];
  };

  // Get available sub-subcategories based on selected category and subcategory
  const getSubSubCategories = (category, subCategory) => {
    return categoryStructure[category] && categoryStructure[category][subCategory]
      ? categoryStructure[category][subCategory]
      : [];
  };

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
        ...(filterSubCategory && { subCategory: filterSubCategory }),
        ...(filterLevel && { level: filterLevel }),
      };

      const response = await courseAPI.getAllCourses(params);

      if (response.success) {
        setCourses(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        });
      } else {
        setError(response.message || 'Failed to fetch courses');
      }
    } catch (error) {
      setError(`Failed to fetch courses: ${error.message}`);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData) => {
    try {
      const response = await courseAPI.createCourse(courseData);
      if (response.success) {
        setSuccess('Course created successfully!');
        await fetchCourses();
        return response;
      } else {
        throw new Error(response.message || 'Failed to create course');
      }
    } catch (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
  };

  const updateCourse = async (id, courseData) => {
    try {
      const response = await courseAPI.updateCourse(id, courseData);
      if (response.success) {
        setSuccess('Course updated successfully!');
        await fetchCourses();
        return response;
      } else {
        throw new Error(response.message || 'Failed to update course');
      }
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
  };

  const deleteCourse = async (id) => {
    try {
      const response = await courseAPI.deleteCourse(id);
      if (response.success) {
        setSuccess('Course deleted successfully!');
        await fetchCourses();
      } else {
        throw new Error(response.message || 'Failed to delete course');
      }
    } catch (error) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      const response = await courseAPI.toggleCourseStatus(id, isActive);
      if (response.success) {
        setSuccess(`Course ${isActive ? 'activated' : 'deactivated'} successfully!`);
        await fetchCourses();
      } else {
        throw new Error(response.message || 'Failed to toggle course status');
      }
    } catch (error) {
      setError(`Failed to toggle course status: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCourses(1);
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterCategory, filterSubCategory, filterLevel]);

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
      // Reset subcategories when category changes
      if (name === 'category') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          subCategory: '',
          subSubCategory: ''
        }));
      } else if (name === 'subCategory') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          subSubCategory: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Course title is required');
    }
    if (!formData.description.trim()) {
      throw new Error('Course description is required');
    }
    if (!formData.instructor.name.trim()) {
      throw new Error('Instructor name is required');
    }
    if (!formData.category) {
      throw new Error('Category is required');
    }
    if (!formData.subCategory) {
      throw new Error('Subcategory is required');
    }
    if (!formData.level) {
      throw new Error('Level is required');
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      throw new Error('Valid price is required');
    }
    if (!formData.duration.trim()) {
      throw new Error('Duration is required');
    }
    if (!formData.lessons || parseInt(formData.lessons) <= 0) {
      throw new Error('Valid number of lessons is required');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

      const courseData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
        lessons: parseInt(formData.lessons),
        enrolledStudents: parseInt(formData.enrolledStudents) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        requirements: formData.requirements.split('\n').map(req => req.trim()).filter(req => req),
        whatYouWillLearn: formData.whatYouWillLearn.split('\n').map(learn => learn.trim()).filter(learn => learn)
      };

      if (editingCourse) {
        await updateCourse(editingCourse._id, courseData);
      } else {
        await createCourse(courseData);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: { name: '', bio: '', image: '' },
      category: '',
      subCategory: '',
      subSubCategory: '',
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
      tags: course.tags ? course.tags.join(', ') : '',
      requirements: course.requirements ? course.requirements.join('\n') : '',
      whatYouWillLearn: course.whatYouWillLearn ? course.whatYouWillLearn.join('\n') : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setLoading(true);
      try {
        await deleteCourse(id);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    setLoading(true);
    await toggleStatus(id, !currentStatus);
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    fetchCourses(newPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterSubCategory('');
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
          + Add New Course
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className={styles.success}>
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setFilterSubCategory('');
          }}
          className={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {Object.keys(categoryStructure).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        {filterCategory && (
          <select
            value={filterSubCategory}
            onChange={(e) => setFilterSubCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Subcategories</option>
            {getSubCategories(filterCategory).map(subCategory => (
              <option key={subCategory} value={subCategory}>{subCategory}</option>
            ))}
          </select>
        )}

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
            
            <div className={styles.form}>
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
                    {Object.keys(categoryStructure).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.category && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Subcategory *</label>
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Subcategory</option>
                      {getSubCategories(formData.category).map(subCategory => (
                        <option key={subCategory} value={subCategory}>{subCategory}</option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.subCategory && getSubSubCategories(formData.category, formData.subCategory).length > 0 && (
                    <div className={styles.formGroup}>
                      <label>Specialization</label>
                      <select
                        name="subSubCategory"
                        value={formData.subSubCategory}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Specialization</option>
                        {getSubSubCategories(formData.category, formData.subCategory).map(subSubCategory => (
                          <option key={subSubCategory} value={subSubCategory}>{subSubCategory}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

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
                  <label>Price (₹) *</label>
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
                  <label>Original Price (₹)</label>
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
                    placeholder="e.g., 3 months"
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
                  placeholder="e.g., लोकसेवा, परीक्षा, तयारी"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Requirements (one per line)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Basic computer skills&#10;Nepali language proficiency"
                />
              </div>

              <div className={styles.formGroup}>
                <label>What You Will Learn (one per line)</label>
                <textarea
                  name="whatYouWillLearn"
                  value={formData.whatYouWillLearn}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Exam pattern understanding&#10;Subject mastery"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
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
                <button 
                  type="button" 
                  className={styles.submitBtn} 
                  disabled={loading} 
                  onClick={handleSubmit}
                >
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
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className={styles.coursesGrid}>
        {courses.map(course => (
          <div key={course._id} className={styles.courseCard}>
            <div className={styles.courseHeader}>
              <h3 className={styles.courseTitle}>{course.title}</h3>
              <div className={styles.courseActions}>
                <button 
                  className={`${styles.statusBtn} ${course.isActive ? styles.active : styles.inactive}`}
                  onClick={() => handleStatusToggle(course._id, course.isActive)}
                  disabled={loading}
                >
                  {course.isActive ? '✓ Active' : '✗ Inactive'}
                </button>
                <button 
                  className={styles.editBtn}
                  onClick={() => handleEdit(course)}
                  disabled={loading}
                >
                  ✏️ Edit
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(course._id)}
                  disabled={loading}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            
            <div className={styles.courseInfo}>
              <span className={styles.category}>{course.category}</span>
              {course.subCategory && <span className={styles.subCategory}>{course.subCategory}</span>}
              {course.subSubCategory && <span className={styles.subSubCategory}>{course.subSubCategory}</span>}
              <span className={styles.level}>{course.level}</span>
            </div>
            
            <p className={styles.courseDescription}>{course.description}</p>
            
            <div className={styles.courseDetails}>
              <div className={styles.instructor}>
                <strong>👨‍🏫 Instructor:</strong> {course.instructor.name}
              </div>
              <div className={styles.stats}>
                <span className={styles.price}>₹{course.price}</span>
                <span className={styles.lessons}>📚 {course.lessons} lessons</span>
                <span className={styles.duration}>⏱️ {course.duration}</span>
              </div>
              <div className={styles.enrollment}>
                <span className={styles.rating}>⭐ {course.rating.toFixed(1)} ({course.numReviews} reviews)</span>
                <span className={styles.students}>👥 {course.enrolledStudents} students</span>
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
            className={styles.paginationBtn}
          >
            ← Previous
          </button>
          
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {pagination.pages} 
            ({pagination.total} total courses)
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages || loading}
            className={styles.paginationBtn}
          >
            Next →
          </button>
        </div>
      )}

      {courses.length === 0 && !loading && (
        <div className={styles.empty}>
          <h3>📚 No courses found</h3>
          <p>Try adjusting your search or filter criteria, or add a new course to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
