// components/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Users, ChevronRight, BookOpen } from 'lucide-react';
import { projectAPI } from '../../services/api';

const ProjectDetail = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-[rgb(15,23,42)] mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[rgb(15,23,42)] mt-7 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-[rgb(15,23,42)] mt-8 mb-5">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-[rgb(15,23,42)]">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-[rgb(71,85,105)]">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 text-[rgb(71,85,105)] mb-1">$1</li>')
      .replace(/(<li.*?<\/li>)/gims, '<ul class="list-disc mb-4">$1</ul>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/`(.*?)`/g, '<code class="bg-[rgb(241,245,249)] px-2 py-1 rounded text-sm font-mono text-[rgb(37,99,235)]">$1</code>')
      .replace(/^(?!<[hu])(.*)$/gim, '<p class="mb-4 text-[rgb(71,85,105)] leading-relaxed">$1</p>');
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectAPI.getProjects();
        const projectsArray = response.projects || response.data || response || [];
        console.log('Projects array in ProjectDetail:', projectsArray);
        const foundProject = projectsArray.find(p =>
          p.id.toString() === projectId || p.id === projectId
        );
        if (!foundProject) throw new Error('Project not found');
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
      case 'Beginner': return 'text-green-700 bg-green-50';
      case 'Intermediate': return 'text-yellow-700 bg-yellow-50';
      case 'Advanced': return 'text-red-700 bg-red-50';
      default: return 'text-[rgb(148,163,184)] bg-[rgb(241,245,249)]';
    }
  };

  const handleStartProject = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate(`/projects/${projectId}/workspace`);
  };

  const handleTakeQuiz = () => {
    if (!user) {

      navigate('/login', { state: { from: location } });
      return;
    }
    navigate(`/project-quiz/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[rgb(37,99,235)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[rgb(71,85,105)] text-lg">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error || 'Project not found'}</div>
            <Link
              to="/projects"
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white px-6 py-3 rounded-lg transition-colors duration-300 inline-block"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)]">
      <div className="bg-white border-b border-[rgb(226,232,240)]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <nav className="flex items-center space-x-2 text-sm text-[rgb(148,163,184)] mb-6">
            <Link to="/projects" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">
              Projects
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[rgb(71,85,105)]">{project.category}</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <span className="text-sm font-medium text-[rgb(37,99,235)] bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">
                {project.category}
              </span>
              <h1 className="text-4xl font-bold text-[rgb(37,99,235)] mb-4">
                {project.title}
              </h1>
              <p className="text-xl text-[rgb(71,85,105)] mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-[rgb(148,163,184)]">
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

            {/* Sidebar */}
            <div className="border border-[rgb(226,232,240)] rounded-xl w-full lg:w-80">
              <div className="bg-white rounded-xl p-6 h-full">
                <div className="text-center mb-6">
                  <span className={`text-sm font-medium px-4 py-2 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                </div>

                {/* Start Project — solid blue, inverts to white+blue-border on hover */}
                <button
                  onClick={handleStartProject}
                  className="
                    w-full font-semibold py-4 px-6 rounded-lg mb-4
                    border-2 border-[rgb(37,99,235)]
                    bg-[rgb(37,99,235)] text-white
                   
                    transition-all duration-200
                  "
                >
                  {user ? 'Start Project' : 'Login to Start Project'}
                </button>

                {/* Take Quiz — outline white+blue-text, inverts to solid blue on hover */}
                {user && (
                  <button
                    onClick={handleTakeQuiz}
                    className="
                      w-full font-semibold py-4 px-6 rounded-lg mb-4
                      border-2 border-[rgb(37,99,235)]
                      bg-white text-[rgb(37,99,235)]
                      transition-all duration-200
                    "
                  >
                    Take Quiz
                  </button>
                )}

                {!user && (
                  <div className="text-center text-sm text-[rgb(148,163,184)] mb-4">
                    <p>You need to be logged in to start this project</p>
                    <div className="flex gap-2 mt-3">
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/projects/${projectId}` } }}
                        className="flex-1 bg-[rgb(241,245,249)] hover:bg-[rgb(226,232,240)] text-[rgb(15,23,42)] py-2 px-4 rounded-lg transition-colors duration-300 text-center"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        state={{ from: { pathname: `/projects/${projectId}` } }}
                        className="flex-1 bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white py-2 px-4 rounded-lg transition-colors duration-300 text-center"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-[rgb(226,232,240)]">
                  <div className="text-sm text-[rgb(148,163,184)]">
                    <div className="font-medium text-[rgb(71,85,105)] mb-2">Curated by:</div>
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
            <section className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-[rgb(37,99,235)]" />
                Project Description
              </h2>
              <div
                className="markdown-content text-[rgb(71,85,105)] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(project.project_description || project.description)
                }}
              />
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="text-sm text-[rgb(37,99,235)] bg-blue-50 px-3 py-2 rounded-lg border border-[rgb(37,99,235)]/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Prerequisites</h3>
              <div className="space-y-2">
                {project.prerequisites?.map((prereq, index) => (
                  <div key={index} className="flex items-center gap-3 text-[rgb(71,85,105)]">
                    <div className="w-2 h-2 bg-[rgb(37,99,235)] rounded-full"></div>
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