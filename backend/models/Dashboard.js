// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'admin'], 
    default: 'student' 
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructor: { 
    type: String, 
    required: true,
    trim: true
  },
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  enrollmentCount: { 
    type: Number, 
    default: 0 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ rating: -1, enrollmentCount: -1 });

module.exports = mongoose.model('Course', courseSchema);

// models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  enrolledAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: {
    type: Date
  },
  progress: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });

enrollmentSchema.pre('save', function(next) {
  if (this.progress >= 100 && !this.completedAt) {
    this.completedAt = new Date();
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);

// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { 
    type: String, 
    default: 'USD',
    uppercase: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto']
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'square'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  providerTransactionId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ courseId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'user_registration', 
      'course_enrollment', 
      'course_completion', 
      'payment', 
      'course_creation',
      'course_update',
      'user_login',
      'user_logout',
      'password_change',
      'profile_update',
      'course_rating',
      'certificate_issued'
    ],
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  description: { 
    type: String, 
    required: true 
  },
  entityType: {
    type: String,
    enum: ['user', 'course', 'enrollment', 'payment']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

// models/index.js
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Payment = require('./Payment');
const Activity = require('./Activity');

module.exports = {
  User,
  Course,
  Enrollment,
  Payment,
  Activity
};