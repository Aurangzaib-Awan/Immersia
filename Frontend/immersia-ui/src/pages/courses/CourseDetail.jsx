// components/courses/CourseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight, BookOpen, PlayCircle, FileText, Star } from 'lucide-react';
import { courseAPI } from '../../services/api';

const CourseDetail = ({ user }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate total course duration in weeks
  const calculateTotalWeeks = (modules) => {
    if (!modules || !modules.length) return 0;
    
    const totalHours = modules.reduce((total, module) => {
      const moduleTime = parseInt(module.estimatedTime?.value) || 0;
      const unit = module.estimatedTime?.unit || 'minutes';
      
      switch (unit) {
        case 'minutes': return total + (moduleTime / 60);
        case 'hours': return total + moduleTime;
        case 'days': return total + (moduleTime * 24);
        case 'weeks': return total + (moduleTime * 168);
        default: return total + (moduleTime / 60);
      }
    }, 0);

    return Math.ceil(totalHours / 10);
  };

  // Calculate total lessons
  const calculateTotalLessons = (modules) => {
    if (!modules) return 0;
    return modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  };

  // Format duration for display
  const formatDuration = (duration) => {
    if (!duration) return '0 min';
    return `${duration.value} ${duration.unit}`;
  };

  // Fetch course details from backend
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourses();
        const coursesArray = response.courses || response.data || response || [];
        
        const foundCourse = coursesArray.find(c => 
          c.id.toString() === courseId || c.id === courseId
        );
        
        if (!foundCourse) {
          throw new Error('Course not found');
        }
        
        setCourse(foundCourse);
      } catch (err) {
        setError('Failed to load course details. Please try again later.');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleStartLearning = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    // Navigate to workspace if authenticated
    navigate(`/courses/${courseId}/workspace`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-400 text-lg mb-4">{error || 'Course not found'}</div>
            <Link 
              to="/courses"
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 inline-block"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalWeeks = calculateTotalWeeks(course.modules);
  const totalLessons = calculateTotalLessons(course.modules);
  const durationDisplay = `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white">
      <div className="bg-surface-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link to="/courses" className="hover:text-sky-400 transition-colors duration-300">
              Courses
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{course.category}</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <span className="text-sm font-medium text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full mb-4 inline-block">
                {course.category}
              </span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{durationDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Curated by: {course.curator}</span>
                </div>
               
              </div>
            </div>

            {/* Sidebar with flowing gradient border */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full lg:w-80">
              <div className="bg-surface-800 rounded-xl p-6 h-full">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-white mb-2">Free</div>
                  <div className="text-gray-400 text-sm">Lifetime Access</div>
                </div>
                
                <button 
                  onClick={handleStartLearning}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 mb-4"
                >
                  {user ? "Start Learning" : "Login to Start Learning"}
                </button>

                {!user && (
                  <div className="text-center text-sm text-gray-400 mb-4">
                    <p>You need to be logged in to start this course</p>
                    <div className="flex gap-2 mt-3">
                      <Link 
                        to="/login" 
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors duration-300 text-center"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/signup" 
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded transition-colors duration-300 text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
                  <div className="text-sm text-gray-400">
                    <div className="font-medium text-gray-300 mb-2">Curated by:</div>
                    <div>{course.curator}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div className="font-medium text-gray-300 mb-2">Includes:</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-sky-400" />
                        <span>{totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" />
                        <span>{durationDisplay} of content</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-sky-400" />
                Course Curriculum
              </h2>
              <div className="space-y-6">
                {course.modules?.sort((a, b) => a.order - b.order).map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-600 rounded-xl p-6 hover:border-sky-400/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">{module.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Estimated time: {formatDuration(module.estimatedTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group">
                          <div className="flex-shrink-0 w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center group-hover:bg-sky-500/30 transition-all duration-300">
                            {lesson.type === 'video' ? (
                              <PlayCircle className="w-5 h-5 text-sky-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-sky-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1 group-hover:text-sky-400 transition-colors duration-300">
                              {lesson.title}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2">{lesson.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {lesson.learningObjectives?.map((objective, objIndex) => (
                                <span key={objIndex} className="text-xs text-sky-300 bg-sky-500/10 px-2 py-1 rounded border border-sky-400/20">
                                  {objective}
                                </span>
                              ))}
                            </div>
                            {lesson.resources && lesson.resources.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-400">Resources: </span>
                                {lesson.resources.map((resource, resIndex) => (
                                  <a
                                    key={resIndex}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-sky-400 hover:text-sky-300 ml-2 transition-colors duration-300"
                                  >
                                    {resource.title}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDuration(lesson.duration)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Course Overview</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Total Modules:</span>
                  <span className="text-white font-medium">{course.modules?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Lessons:</span>
                  <span className="text-white font-medium">{totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Duration:</span>
                  <span className="text-white font-medium">{durationDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-white font-medium">{course.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Curator:</span>
                  <span className="text-white font-medium">{course.curator}</span>
                </div>
              </div>
            </section>

            <section className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Learning Path</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span>Complete all modules</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span>Track progress with tasks</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span>Take assessment quizzes</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <span>Earn completion certificate</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;