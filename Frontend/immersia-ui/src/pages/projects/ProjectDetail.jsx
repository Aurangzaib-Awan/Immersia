// components/ProjectDetail.jsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight, BookOpen } from 'lucide-react';

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "E-commerce Analytics Dashboard",
    shortDescription: "Build a comprehensive dashboard to track e-commerce metrics and customer behavior",
    category: "Data Analytics",
    curatorName: "Data Science Team",
    difficultyLevel: "Intermediate",
    estimatedDuration: "4 weeks",
    technologiesUsed: ["Python", "Pandas", "Plotly", "SQL", "Flask", "PostgreSQL"],
    prerequisites: ["Basic Python knowledge", "SQL fundamentals", "Data analysis concepts"],
    detailedProjectDescription: `In this project, you'll build a comprehensive e-commerce analytics dashboard that tracks key business metrics, customer behavior, and sales performance. You'll work with real-world e-commerce data to create interactive visualizations that help business stakeholders make data-driven decisions. The project covers data cleaning, database design, backend API development, and frontend dashboard creation. You'll learn how to handle large datasets, create meaningful visualizations, and deploy your application.`
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

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Find project by ID - dynamic data
  const project = MOCK_PROJECTS.find(p => p.id === parseInt(projectId));

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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Project not found</div>
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
              <p className="text-xl text-gray-300 mb-6">{project.shortDescription}</p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{project.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Curated by: {project.curatorName}</span>
                </div>
              </div>
            </div>

            {/* Sidebar with flowing gradient border */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full lg:w-80">
              <div className="bg-surface-800 rounded-xl p-6 h-full">
                <div className="text-center mb-6">
                  <span className={`text-sm font-medium px-4 py-2 rounded-full ${getDifficultyColor(project.difficultyLevel)}`}>
                    {project.difficultyLevel}
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
                    <div>{project.curatorName}</div>
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
                {project.detailedProjectDescription}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-surface-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologiesUsed.map((tech, index) => (
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
                {project.prerequisites.map((prereq, index) => (
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