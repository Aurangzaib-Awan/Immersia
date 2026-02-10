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

  // Helper function to calculate total lessons from modules
  const calculateTotalLessons = (course) => {
    if (!course.modules) return 0;
    return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  };

  // Helper function to get total duration (simplified - you can enhance this)
  const getTotalDuration = (course) => {
    if (!course.modules) return 'N/A';
    
    const totalMinutes = course.modules.reduce((total, module) => {
      const moduleTime = module.estimatedTime || { value: '0', unit: 'minutes' };
      let minutes = parseInt(moduleTime.value) || 0;
      
      // Convert to minutes for simple calculation
      if (moduleTime.unit === 'hours') minutes *= 60;
      if (moduleTime.unit === 'days') minutes *= 1440;
      if (moduleTime.unit === 'weeks') minutes *= 10080;
      
      return total + minutes;
    }, 0);

    // Convert back to hours for display if more than 60 minutes
    if (totalMinutes >= 60) {
      return `${Math.round(totalMinutes / 60)} hours`;
    }
    return `${totalMinutes} minutes`;
  };

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
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.curator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter visible courses for animation
  const animatedFilteredCourses = filteredCourses.filter(course =>
    visibleCourses.some(visibleCourse => visibleCourse.id === course.id)
  );

  // Add new course
  const handleAddCourse = async (courseData, isEdit = false) => {
    try {
      if (isEdit) {
        await courseAPI.updateCourse(courseData.id, courseData);
        await loadCourses();
      } else {
        await courseAPI.createCourse(courseData);
        await loadCourses();
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.deleteCourse(courseId);
        await loadCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
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
          {/* Animated Title */}
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
            Content Management
          </h1>
          <p className="text-text-light text-sm sm:text-base mt-1">Manage your courses and learning materials</p>
        </div>
        <button 
          onClick={handleAddNewCourse}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base shadow-lg"
        >
          <span>+</span>
          <span>Add New Course</span>
        </button>
      </div>

      {/* Search Bar with Blue Gradient Border */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow mb-4 sm:mb-6">
        <div className="bg-surface-800 rounded-xl">
          <input
            type="text"
            placeholder="Search courses by title, description, curator, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-800 border-0 rounded-xl px-4 py-3 text-text-white placeholder-text-light focus:outline-none focus:ring-0 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-4 sm:gap-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <p className="text-text-light mt-2">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          // Empty state - no message, just empty space
          <div></div>
        ) : (
          filteredCourses.map((course, index) => {
            const totalLessons = calculateTotalLessons(course);
            const totalDuration = getTotalDuration(course);
            const totalModules = course.modules?.length || 0;

            return (
              <div 
                key={course.id}
                className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '0.6s',
                  animationFillMode: 'both',
                  animationName: animatedFilteredCourses.some(c => c.id === course.id) ? 'slideInUp' : 'none',
                  animationTimingFunction: 'ease-out'
                }}
              >
                <div className="bg-surface-800 rounded-xl p-4 sm:p-6 hover:bg-surface-750 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-text-white">{course.title}</h3>
                      </div>
                      
                      <p className="text-text-gray text-sm sm:text-base mb-3 sm:mb-4">{course.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-text-light text-xs sm:text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">📚</span>
                          <span>{totalLessons} Lessons</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">📦</span>
                          <span>{totalModules} Modules</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">👥</span>
                          <span>{course.students || 0} Students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">⏱️</span>
                          <span>{totalDuration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">📁</span>
                          <span>{course.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">👨‍🏫</span>
                          <span>{course.curator}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sky-400">📅</span>
                          <span>{formatDate(course.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-3 self-stretch sm:self-auto">
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="text-sky-400 hover:text-sky-300 transition-colors px-2 sm:px-3 py-1 sm:py-1 border border-sky-400 rounded-lg text-xs sm:text-sm hover:bg-sky-400 hover:bg-opacity-10"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCourse(course.id)}
                        className="text-red-400 hover:text-red-300 transition-colors px-2 sm:px-3 py-1 sm:py-1 border border-red-400 rounded-lg text-xs sm:text-sm hover:bg-red-400 hover:bg-opacity-10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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
    </div>
  );
};

export default ContentManagement;