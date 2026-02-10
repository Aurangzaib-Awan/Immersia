import React, { useState, useEffect, useMemo } from 'react';
import ProjectForm from './ProjectForm';
import { projectAPI } from '../../services/api';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleProjects, setVisibleProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Load projects from backend
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects();
      
      // Handle different response formats
      const projectsArray = response.projects || response.data || response || [];
      
      setProjects(projectsArray);
      
      // Reset and re-animate
      setVisibleProjects([]);
      projectsArray.forEach((project, index) => {
        setTimeout(() => {
          setVisibleProjects(prev => [...prev, project]);
        }, index * 150);
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Add user-facing error message
      // setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects with useMemo for better performance
  const filteredProjects = useMemo(() => 
    projects.filter(project =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies?.some(tech => 
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      project.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [projects, searchTerm]
  );

  // Reset visibleProjects when search changes
  useEffect(() => {
    setVisibleProjects([]);
    filteredProjects.forEach((project, index) => {
      setTimeout(() => {
        setVisibleProjects(prev => [...prev, project]);
      }, index * 100);
    });
  }, [filteredProjects]);

  // Filter visible projects for animation
  const animatedFilteredProjects = filteredProjects.filter(project =>
    visibleProjects.some(visibleProject => visibleProject.id === project.id)
  );

  // Add new project
  const handleAddProject = async (projectData, isEdit = false) => {
    try {
      if (isEdit) {
        await projectAPI.updateProject(projectData.id, projectData);
        await loadProjects();
      } else {
        await projectAPI.createProject(projectData);
        await loadProjects();
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.deleteProject(projectId);
        await loadProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  // Edit project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Add new project
  const handleAddNewProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
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
            Project Management
          </h1>
          <p className="text-text-light text-sm sm:text-base mt-1">Manage hands-on projects for users</p>
        </div>
        <button 
          onClick={handleAddNewProject}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base shadow-lg"
        >
          <span>+</span>
          <span>Add New Project</span>
        </button>
      </div>

      {/* Search Bar with Blue Gradient Border */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow mb-4 sm:mb-6">
        <div className="bg-surface-800 rounded-xl">
          <input
            type="text"
            placeholder="Search projects by title, description, technologies, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-800 border-0 rounded-xl px-4 py-3 text-text-white placeholder-text-light focus:outline-none focus:ring-0 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:gap-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <p className="text-text-light mt-2">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          // Empty state - no message, just empty space
          <div></div>
        ) : (
          filteredProjects.map((project, index) => (
            <div 
              key={project.id}
              className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: '0.6s',
                animationFillMode: 'both',
                animationName: animatedFilteredProjects.some(p => p.id === project.id) ? 'slideInUp' : 'none',
                animationTimingFunction: 'ease-out'
              }}
            >
              <div className="bg-surface-800 rounded-xl p-4 sm:p-6 hover:bg-surface-750 transition-all duration-300">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                  {/* Project Info */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-text-white">{project.title}</h3>
                      <p className="text-sky-400 text-sm mt-1 capitalize">{project.difficulty}</p>
                    </div>
                    
                    <p className="text-text-gray text-sm sm:text-base mb-3 sm:mb-4">{project.description}</p>
                    
                    {/* Project Details */}
                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="text-text-light text-xs sm:text-sm">
                        <span className="font-medium text-sky-300">Technologies: </span>
                        <span>{project.technologies?.join(', ') || 'Not specified'}</span>
                      </div>
                      <div className="text-text-light text-xs sm:text-sm">
                        <span className="font-medium text-sky-300">Prerequisites: </span>
                        <span>{project.prerequisites?.join(', ') || 'None'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-text-light text-xs sm:text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-sky-400">⏱️</span>
                        <span>{project.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sky-400">📁</span>
                        <span>{project.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sky-400">👨‍🏫</span>
                        <span>{project.curator}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sky-400">📅</span>
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 sm:space-x-3 self-stretch sm:self-auto">
                    <button 
                      onClick={() => handleEditProject(project)}
                      className="text-sky-400 hover:text-sky-300 transition-colors px-2 sm:px-3 py-1 sm:py-1 border border-sky-400 rounded-lg text-xs sm:text-sm hover:bg-sky-400 hover:bg-opacity-10"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 transition-colors px-2 sm:px-3 py-1 sm:py-1 border border-red-400 rounded-lg text-xs sm:text-sm hover:bg-red-400 hover:bg-opacity-10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          onClose={handleCloseForm}
          onSaveProject={handleAddProject}
          editProject={editingProject}
        />
      )}
    </div>
  );
};

export default ProjectManagement;