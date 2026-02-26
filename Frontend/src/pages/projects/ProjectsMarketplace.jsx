// components/ProjectsMarketplace.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Clock, Users } from 'lucide-react';
import { projectAPI } from '../../services/api';

const ProjectsMarketplace = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
      case 'Beginner': return 'text-green-700 bg-green-50';
      case 'Intermediate': return 'text-yellow-700 bg-yellow-50';
      case 'Advanced': return 'text-red-700 bg-red-50';
      default: return 'text-[rgb(148,163,184)] bg-[rgb(241,245,249)]';
    }
  };

  const handleProjectClick = (projectId) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/projects/${projectId}` } } });
      return;
    }
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[rgb(37,99,235)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[rgb(71,85,105)] text-lg">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[rgb(37,99,235)] mb-4">
            Project Marketplace
          </h1>
          <p className="text-[rgb(71,85,105)] text-lg">
            Build real-world projects, collaborate with peers, and showcase your skills
          </p>
        </div>

        {/* Filter section */}
        <div className="border border-[rgb(226,232,240)] rounded-xl mb-8">
          <div className="bg-white rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(148,163,184)] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg pl-10 pr-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:bg-white focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  />
                </div>
              </div>

              <select
                className="bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                className="bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
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
              className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 hover:border-[rgb(37,99,235)]/30 transition-all duration-300 group cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-[rgb(37,99,235)] bg-blue-50 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[rgb(15,23,42)] mb-3 group-hover:text-[rgb(37,99,235)] transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-[rgb(71,85,105)] text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="text-xs text-[rgb(71,85,105)] bg-[rgb(241,245,249)] px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Project Stats */}
              <div className="flex justify-between items-center text-sm text-[rgb(148,163,184)] mb-4">
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
                className="w-full bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                View Project Details
              </button>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[rgb(148,163,184)] text-lg">
              {projects.length === 0 ? 'No projects available yet' : 'No projects found matching your criteria'}
            </div>
            {filters.searchQuery || filters.difficulty || filters.duration ? (
              <button
                onClick={() => {
                  setFilters({ difficulty: '', duration: '', searchQuery: '' });
                  setFilteredProjects(projects);
                }}
                className="mt-4 text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] transition-colors duration-300"
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