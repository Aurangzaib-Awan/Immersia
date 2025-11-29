// components/ProjectsMarketplace.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Users } from 'lucide-react';
import { projectAPI } from '../../services/api';

const ProjectsMarketplace = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: '',
    duration: '',
    searchQuery: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from backend
  // Fetch projects from backend
useEffect(() => {
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects();
      
      // Extract projects array from response (same as ProjectManagement)
      const projectsArray = response.projects || response.data || response || [];
      
      console.log('Projects data:', projectsArray); // Debug log
      
      setProjects(projectsArray);
      setFilteredProjects(projectsArray);
    } catch (err) {
      setError('Failed to load projects. Please try again later.');
      console.error('Error fetching projects:', err);
      // Set to empty arrays on error
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProjects();
}, []);

  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    let filtered = projects;
    
    if (newFilters.searchQuery) {
      filtered = filtered.filter(project => 
        project.title?.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) || // Changed from shortDescription
        project.technologies?.some(tech => // Changed from technologiesUsed
          tech.toLowerCase().includes(newFilters.searchQuery.toLowerCase())
        )
      );
    }
    
    if (newFilters.difficulty) {
      filtered = filtered.filter(project => project.difficulty === newFilters.difficulty); // Changed from difficultyLevel
    }
    
    if (newFilters.duration) {
      filtered = filtered.filter(project => {
        const durationWeeks = parseInt(project.duration) || 0; // Changed from estimatedDuration
        return durationWeeks <= parseInt(newFilters.duration);
      });
    }
    
    setFilteredProjects(filtered);
  }, [filters, projects]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading projects...</p>
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
            Project Marketplace
          </h1>
          <p className="text-gray-300 text-lg">
            Build real-world projects, collaborate with peers, and showcase your skills
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
                    placeholder="Search projects..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  />
                </div>
              </div>

              <select
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all duration-300"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-surface-800 border border-gray-700 rounded-xl p-6 hover:scale-105 transform transition-all duration-300 hover:shadow-2xl group cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Project Stats */}
              <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.curator}</span>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(project.id);
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                View Project Details
              </button>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {projects.length === 0 ? 'No projects available yet' : 'No projects found matching your criteria'}
            </div>
            {filters.searchQuery || filters.difficulty || filters.duration ? (
              <button
                onClick={() => {
                  setFilters({ difficulty: '', duration: '', searchQuery: '' });
                  setFilteredProjects(projects);
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

export default ProjectsMarketplace;