// components/ProjectsMarketplace.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Users } from 'lucide-react';

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "E-commerce Analytics Dashboard",
    shortDescription: "Build a comprehensive dashboard to track e-commerce metrics and customer behavior",
    category: "Data Analytics",
    curatorName: "Data Science Team",
    difficultyLevel: "Intermediate",
    estimatedDuration: "4 weeks",
    technologiesUsed: ["Python", "Pandas", "Plotly", "SQL"],
    prerequisites: ["Basic Python knowledge", "SQL fundamentals", "Data analysis concepts"],
    detailedProjectDescription: "Build a comprehensive e-commerce analytics dashboard that tracks key business metrics, customer behavior, and sales performance."
  },
  {
    id: 2,
    title: "Real-time Stock Prediction Model",
    shortDescription: "Create ML model to predict stock prices using historical data",
    category: "Machine Learning",
    curatorName: "AI Research Team",
    difficultyLevel: "Advanced",
    estimatedDuration: "6 weeks",
    technologiesUsed: ["Python", "TensorFlow", "LSTM", "Yahoo Finance API"],
    prerequisites: ["Python programming", "Machine Learning basics", "Statistics"],
    detailedProjectDescription: "Create a machine learning model to predict stock prices using historical data and LSTM networks."
  },
  {
    id: 3,
    title: "Customer Segmentation Analysis",
    shortDescription: "Segment customers using clustering algorithms for targeted marketing",
    category: "Data Science",
    curatorName: "Marketing Analytics",
    difficultyLevel: "Beginner",
    estimatedDuration: "3 weeks",
    technologiesUsed: ["Python", "Scikit-learn", "K-means", "Matplotlib"],
    prerequisites: ["Basic Python", "Data analysis concepts"],
    detailedProjectDescription: "Segment customers using clustering algorithms for targeted marketing campaigns."
  }
];

const ProjectsMarketplace = () => {
  const navigate = useNavigate();
  
  const [filteredProjects, setFilteredProjects] = useState(MOCK_PROJECTS);
  const [filters, setFilters] = useState({
    difficulty: '',
    duration: '',
    searchQuery: ''
  });

  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    let filtered = MOCK_PROJECTS;
    
    if (newFilters.searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        project.shortDescription.toLowerCase().includes(newFilters.searchQuery.toLowerCase()) ||
        project.technologiesUsed.some(tech => 
          tech.toLowerCase().includes(newFilters.searchQuery.toLowerCase())
        )
      );
    }
    
    if (newFilters.difficulty) {
      filtered = filtered.filter(project => project.difficultyLevel === newFilters.difficulty);
    }
    
    if (newFilters.duration) {
      filtered = filtered.filter(project => {
        const durationWeeks = parseInt(project.estimatedDuration);
        return durationWeeks <= parseInt(newFilters.duration);
      });
    }
    
    setFilteredProjects(filtered);
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with flowing gradient text */}
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
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(project.difficultyLevel)}`}>
                  {project.difficultyLevel}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {project.shortDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologiesUsed.map((tech, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.curatorName}</span>
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
            <div className="text-gray-400 text-lg">No projects found</div>
            <button
              onClick={() => {
                setFilters({ difficulty: '', duration: '', searchQuery: '' });
                setFilteredProjects(MOCK_PROJECTS);
              }}
              className="mt-4 text-sky-400 hover:text-sky-300 transition-colors duration-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsMarketplace;