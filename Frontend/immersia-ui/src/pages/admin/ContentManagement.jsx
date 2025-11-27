import React, { useState, useEffect } from 'react';
import CourseForm from './CourseForm';
import { courseAPI } from '../../services/api';

const ContentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCourses, setVisibleCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Load courses from backend
  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourses();
      setCourses(response.courses);
      
      // Animate courses in one by one
      response.courses.forEach((course, index) => {
        setTimeout(() => {
          setVisibleCourses(prev => [...prev, course]);
        }, index * 150);
      });
    } catch (error) {
      console.error('Failed to load courses:', error);
      alert('Failed to load courses. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Filter courses
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter visible courses for animation
  const animatedFilteredCourses = filteredCourses.filter(course =>
    visibleCourses.some(visibleCourse => visibleCourse.id === course.id)
  );

  // Add new course
  const handleAddCourse = async (courseData, isEdit = false) => {
    try {
      if (isEdit) {
        // Update existing course
        await courseAPI.updateCourse(courseData.id, courseData);
        await loadCourses(); // Reload courses from backend
      } else {
        // Add new course
        await courseAPI.createCourse(courseData);
        await loadCourses(); // Reload courses from backend
      }
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.deleteCourse(courseId);
        await loadCourses(); // Reload courses from backend
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  // Edit course
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  // Add new course
  const handleAddNewCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-white">Content Management</h1>
          <p className="text-text-light text-sm sm:text-base mt-1">Manage your courses and learning materials</p>
        </div>
        <button 
          onClick={handleAddNewCourse}
          className="bg-primary-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 text-sm sm:text-base"
        >
          <span>+</span>
          <span>Add New Course</span>
        </button>
      </div>

      {/* Search Only */}
      <div className="bg-surface-800 rounded-xl border border-background-700 p-4 mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search courses by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-background-700 border border-background-600 rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid gap-4 sm:gap-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="text-text-light mt-2">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-surface-800 rounded-xl border border-background-700 p-6 sm:p-8 text-center">
            <p className="text-text-light text-lg">No courses found</p>
            <p className="text-text-muted mt-2 text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredCourses.map((course, index) => (
            <div 
              key={course.id}
              className={`bg-surface-800 rounded-xl shadow-sm border border-background-700 p-4 sm:p-6 hover:border-background-600 transition-all duration-500 transform hover:scale-[1.01] ${
                animatedFilteredCourses.some(c => c.id === course.id)
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
              style={{
                animation: animatedFilteredCourses.some(c => c.id === course.id) 
                  ? `slideInUp 0.6s ease-out ${index * 0.1}s both`
                  : 'none'
              }}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                {/* Course Info */}
                <div className="flex-1">
                  <div className="mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-white">{course.title}</h3>
                  </div>
                  
                  <p className="text-text-gray text-sm sm:text-base mb-3 sm:mb-4">{course.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-text-light text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <span>📚</span>
                      <span>{course.lessons} Lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{course.students || 0} Students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⏱️</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📁</span>
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👨‍🏫</span>
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{formatDate(course.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3 self-stretch sm:self-auto">
                  <button 
                    onClick={() => handleEditCourse(course)}
                    className="text-primary-400 hover:text-primary-300 transition-colors px-2 sm:px-3 py-1 sm:py-1 border border-primary-400 rounded text-xs sm:text-sm hover:bg-primary-400 hover:bg-opacity-10"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteCourse(course.id)}
                    className="text-red-400 hover:text-red-300 transition-colors px-2 sm:px-3 py-1 sm:py-1 border border-red-400 rounded text-xs sm:text-sm hover:bg-red-400 hover:bg-opacity-10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
        <CourseForm
          onClose={handleCloseForm}
          onSaveCourse={handleAddCourse}
          editCourse={editingCourse}
        />
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ContentManagement;