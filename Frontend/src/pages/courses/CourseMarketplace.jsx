// components/courses/CoursesMarketplace.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Users, BookOpen, Star } from 'lucide-react';
import { courseAPI } from '../../services/api';

const CoursesMarketplace = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    duration: '',
    searchQuery: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate total course duration from modules in weeks
  const calculateTotalWeeks = (modules) => {
    if (!modules || !modules.length) return 0;

    const totalHours = modules.reduce((total, module) => {
      const moduleTime = parseInt(module.estimatedTime?.value) || 0;
      const unit = module.estimatedTime?.unit || 'minutes';

      // Convert to hours
      switch (unit) {
        case 'minutes': return total + (moduleTime / 60);
        case 'hours': return total + moduleTime;
        case 'days': return total + (moduleTime * 24);
        case 'weeks': return total + (moduleTime * 168);
        default: return total + (moduleTime / 60);
      }
    }, 0);

    // Convert hours to weeks (assuming 10 hours per week)
    return Math.ceil(totalHours / 10);
  };

  // Calculate total lessons
  const calculateTotalLessons = (modules) => {
    if (!modules) return 0;
    return modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  };

  // Format duration for display
  const formatDuration = (modules) => {
    const totalWeeks = calculateTotalWeeks(modules);
    return `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}`;
  };

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourses();
        const coursesArray = response.courses || response.data || response || [];


        setCourses(coursesArray);
        setFilteredCourses(coursesArray);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error('Error fetching courses:', err);
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    let filtered = courses;

    if (newFilters.searchQuery) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        course.curator?.toLowerCase().includes(newFilters.searchQuery.toLowerCase())
      );
    }

    if (newFilters.category) {
      filtered = filtered.filter(course => course.category === newFilters.category);
    }

    if (newFilters.duration) {
      filtered = filtered.filter(course => {
        const courseWeeks = calculateTotalWeeks(course.modules);
        return courseWeeks <= parseInt(newFilters.duration);
      });
    }

    setFilteredCourses(filtered);
  }, [filters, courses]);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
            Course Marketplace
          </h1>
          <p className="text-gray-300 text-lg">
            Master new skills with structured learning paths and expert guidance
          </p>
        </div>

        {/* Filter section with flowing gradient border */}
        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow mb-8">
          <div className="bg-surface-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  />
                </div>
              </div>

              <select
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
              </select>

              <select
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
              >
                <option value="">Any Duration</option>
                <option value="2">Up to 2 weeks</option>
                <option value="4">Up to 4 weeks</option>
                <option value="8">Up to 8 weeks</option>
                <option value="12">Up to 12 weeks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const totalLessons = calculateTotalLessons(course.modules);
            const durationDisplay = formatDuration(course.modules);

            return (
              <div
                key={course.id}
                className="bg-surface-800 border border-gray-700 rounded-xl p-6 hover:scale-105 transform transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full">
                    {course.category}
                  </span>

                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors duration-300">
                  {course.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{durationDisplay}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.curator}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course.id);
                  }}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Course Details
                </button>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {courses.length === 0 ? 'No courses available yet' : 'No courses found matching your criteria'}
            </div>
            {filters.searchQuery || filters.category || filters.duration ? (
              <button
                onClick={() => {
                  setFilters({ category: '', duration: '', searchQuery: '' });
                  setFilteredCourses(courses);
                }}
                className="mt-4 text-sky-400 hover:text-sky-300 transition-colors duration-300"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesMarketplace;