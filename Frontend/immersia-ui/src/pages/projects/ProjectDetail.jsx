// components/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight, BookOpen } from 'lucide-react';
import { projectAPI } from '../../services/api';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project details from backend
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // Get all projects and find the specific one
        const response = await projectAPI.getProjects();
        
        // Handle different response formats (same as ProjectsMarketplace)
        const projectsArray = response.projects || response.data || response || [];
        
        console.log('Projects array in ProjectDetail:', projectsArray); // Debug log
        
        const foundProject = projectsArray.find(p => p.id === projectId);
        
        if (!foundProject) {
          throw new Error('Project not found');
        }
        
        setProject(foundProject);
      } catch (err) {
        setError('Failed to load project details. Please try again later.');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleStartProject = () => {
    navigate(`/projects/${projectId}/workspace`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-400 text-lg mb-4">{error || 'Project not found'}</div>
            <Link 
              to="/projects"
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 inline-block"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white">
      <div className="bg-surface-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link to="/projects" className="hover:text-sky-400 transition-colors duration-300">
              Projects
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{project.category}</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <span className="text-sm font-medium text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full mb-4 inline-block">
                {project.category}
              </span>
              {/* Title with flowing gradient text */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
                {project.title}
              </h1>
              <p className="text-xl text-gray-300 mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Curated by: {project.curator}</span>
                </div>
              </div>
            </div>

            {/* Sidebar with flowing gradient border */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full lg:w-80">
              <div className="bg-surface-800 rounded-xl p-6 h-full">
                <div className="text-center mb-6">
                  <span className={`text-sm font-medium px-4 py-2 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                </div>
                
                <button 
                  onClick={handleStartProject}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Start Project
                </button>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <div className="font-medium text-gray-300 mb-2">Curated by:</div>
                    <div>{project.curator}</div>
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
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-sky-400" />
                Project Description
              </h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {project.project_description || project.description}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="text-sm text-sky-400 bg-sky-500/10 px-3 py-2 rounded-lg border border-sky-400/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Prerequisites</h3>
              <div className="space-y-2">
                {project.prerequisites?.map((prereq, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                    <span>{prereq}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;