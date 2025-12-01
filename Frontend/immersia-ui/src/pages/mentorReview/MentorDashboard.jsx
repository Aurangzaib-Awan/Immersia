// pages/mentor/MentorDashboard.jsx
import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, Download, Eye, MessageSquare, Filter, Calendar, Award, Code, FileVideo, FileText, AlertCircle } from 'lucide-react';

const MentorDashboard = ({ user }) => {
 // const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, reviewed
  const [feedback, setFeedback] = useState('');

  // Mock data for projects (replace with API call)
  const mockProjects = [
    {
      id: 1,
      studentName: "John Doe",
      studentEmail: "john@example.com",
      projectTitle: "E-commerce Platform",
      submissionDate: "2024-01-15",
      status: "pending", // pending, approved, rejected
      description: "A full-featured e-commerce platform with user authentication, product catalog, shopping cart, and payment integration. Built with React, Node.js, and MongoDB.",
      githubUrl: "https://github.com/johndoe/ecommerce-platform",
      videoUrl: "https://youtu.be/example123",
      projectFiles: ["project.zip", "documentation.pdf", "presentation.pptx"],
      challenges: ["Payment gateway integration", "Real-time inventory management", "User authentication system"],
      keyLearnings: ["Full-stack development", "Database design", "API security"],
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe"],
      rating: null,
      mentorFeedback: ""
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentEmail: "jane@example.com",
      projectTitle: "AI Image Classifier",
      submissionDate: "2024-01-10",
      status: "pending",
      description: "Machine learning model for image classification using TensorFlow and Python. Includes web interface for image upload and prediction display.",
      githubUrl: "https://github.com/janesmith/ai-image-classifier",
      videoUrl: "https://youtu.be/example456",
      projectFiles: ["model.h5", "notebook.ipynb", "requirements.txt"],
      challenges: ["Model accuracy optimization", "Training data collection", "Real-time inference"],
      keyLearnings: ["Machine learning pipelines", "TensorFlow/Keras", "Model deployment"],
      technologies: ["Python", "TensorFlow", "Flask", "OpenCV", "NumPy"],
      rating: null,
      mentorFeedback: ""
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentEmail: "mike@example.com",
      projectTitle: "Fitness Tracker App",
      submissionDate: "2024-01-05",
      status: "reviewed",
      description: "Mobile application for tracking workouts, nutrition, and fitness progress. Includes social features and progress visualization.",
      githubUrl: "https://github.com/mikejohnson/fitness-tracker",
      videoUrl: "https://youtu.be/example789",
      projectFiles: ["app.apk", "source-code.zip", "design-files.fig"],
      challenges: ["Real-time synchronization", "Offline functionality", "Data visualization"],
      keyLearnings: ["React Native development", "Mobile app deployment", "Database optimization"],
      technologies: ["React Native", "Firebase", "Redux", "Chart.js"],
      rating: 4.5,
      mentorFeedback: "Excellent work! The UI is clean and the functionality is solid. Consider adding more workout types in the next version."
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = (projectId) => {
    setProjects(prev => prev.map(proj => 
      proj.id === projectId 
        ? { ...proj, status: 'approved', rating: 5, mentorFeedback: feedback || "Great work! Project approved." }
        : proj
    ));
    setSelectedProject(null);
    setFeedback('');
    alert('Project approved successfully!');
  };

  const handleReject = (projectId) => {
    setProjects(prev => prev.map(proj => 
      proj.id === projectId 
        ? { ...proj, status: 'rejected', mentorFeedback: feedback || "Needs improvement. Please review the feedback." }
        : proj
    ));
    setSelectedProject(null);
    setFeedback('');
    alert('Project rejected with feedback.');
  };

  const handleDownload = (fileName) => {
    alert(`Downloading ${fileName}...`);
    // Implement actual download logic here
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && project.status === 'pending') ||
      (filter === 'reviewed' && project.status !== 'pending');
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = projects.filter(p => p.status === 'pending').length;
  const reviewedCount = projects.filter(p => p.status !== 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-surface-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
                Mentor Dashboard
              </h1>
              <p className="text-gray-300">
                Welcome back, {user?.name || 'Mentor'}! Review submitted projects and provide feedback.
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 min-w-40">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Pending Review</span>
                </div>
                <div className="text-2xl font-bold text-white">{pendingCount}</div>
                <div className="text-xs text-gray-400">Projects waiting</div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 min-w-40">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Reviewed</span>
                </div>
                <div className="text-2xl font-bold text-white">{reviewedCount}</div>
                <div className="text-xs text-gray-400">Projects completed</div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <div className="bg-surface-800 rounded-xl p-2">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search projects by student name or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-4 py-3"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {['all', 'pending', 'reviewed'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    filter === filterOption
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project List */}
          <div className="lg:col-span-2 space-y-6">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-surface-800 rounded-xl border border-gray-700">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No projects found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
                >
                  <div className="bg-surface-800 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{project.projectTitle}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            project.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20'
                              : project.status === 'approved'
                              ? 'bg-green-500/20 text-green-400 border border-green-400/20'
                              : 'bg-red-500/20 text-red-400 border border-red-400/20'
                          }`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Submitted: {project.submissionDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Student: {project.studentName}
                          </span>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="text-xs text-sky-400 bg-sky-500/10 px-2 py-1 rounded-full border border-sky-400/20"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                        {project.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(project.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar - Project Details */}
          <div className="space-y-6">
            {selectedProject ? (
              <div className="bg-surface-800 border border-gray-700 rounded-xl p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Project Review</h3>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Project Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{selectedProject.projectTitle}</h4>
                    <p className="text-gray-300 text-sm mb-4">{selectedProject.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Student:</span>
                        <span className="text-white">{selectedProject.studentName}</span>
                        <span className="text-gray-400">({selectedProject.studentEmail})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Submitted:</span>
                        <span className="text-white">{selectedProject.submissionDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-sky-400" />
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 hover:underline text-sm"
                      >
                        View GitHub Repository
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileVideo className="w-5 h-5 text-sky-400" />
                      <a
                        href={selectedProject.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 hover:underline text-sm"
                      >
                        Watch Project Video
                      </a>
                    </div>
                  </div>

                  {/* Download Files */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Project Files
                    </h5>
                    <div className="space-y-1">
                      {selectedProject.projectFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => handleDownload(file)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          <span className="truncate">{file}</span>
                          <Download className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      Challenges Faced
                    </h5>
                    <ul className="space-y-1">
                      {selectedProject.challenges.map((challenge, index) => (
                        <li key={index} className="text-sm text-gray-300 pl-2">
                          • {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Learnings */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-400" />
                      Key Learnings
                    </h5>
                    <ul className="space-y-1">
                      {selectedProject.keyLearnings.map((learning, index) => (
                        <li key={index} className="text-sm text-gray-300 pl-2">
                          • {learning}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Feedback Form */}
                  {selectedProject.status === 'pending' && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Your Feedback
                      </h5>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive feedback for the student..."
                        className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      />
                      
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleApprove(selectedProject.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(selectedProject.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Request Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Feedback */}
                  {selectedProject.status !== 'pending' && selectedProject.mentorFeedback && (
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <h5 className="text-sm font-semibold text-gray-300 mb-2">Your Previous Feedback</h5>
                      <p className="text-sm text-gray-300">{selectedProject.mentorFeedback}</p>
                      {selectedProject.rating && (
                        <div className="mt-2 text-yellow-400 text-sm">
                          Rating: {selectedProject.rating}/5
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-surface-800 border border-gray-700 rounded-xl p-6 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Select a Project</h4>
                <p className="text-gray-400 text-sm">
                  Click on a project from the list to review it and provide feedback.
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Review Guidelines</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Check if the project meets all requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Review code quality and documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Test functionality and user experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Provide constructive and specific feedback</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;