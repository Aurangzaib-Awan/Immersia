// pages/projects/ProjectSubmission.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Link, Github, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { projectAPI } from '../../services/api.js';

const ProjectSubmission = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description:  '',
    githubUrl:    '',
    liveDemoUrl:  '',
    challenges:   '',
    learnings:    ''
  });
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadyApprovedModal, setShowAlreadyApprovedModal] = useState(false);
  const [error, setError]                   = useState('');
  const [curatedProjectId, setCuratedProjectId] = useState(null);

  // Find matching curated project for redirect after submit
  React.useEffect(() => {
    const findCuratedProject = async () => {
      try {
        const userProjData  = await projectAPI.getUserProject(projectId);
        if (!userProjData) return;
        const projectsRes   = await projectAPI.getProjects();
        const projectsList  = projectsRes.projects || projectsRes.data || projectsRes || [];
        const matchedCurated = projectsList.find(p => p.title === userProjData.title);
        if (matchedCurated) {
          setCuratedProjectId(matchedCurated.id || matchedCurated._id);
        }
      } catch (err) {
        console.warn('Could not find matching curated project:', err);
      }
    };
    findCuratedProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.description.trim() ||
      !formData.githubUrl.trim()   ||
      !formData.liveDemoUrl.trim() ||
      !formData.challenges.trim()  ||
      !formData.learnings.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    const userId = user?.id || user?._id || (() => {
      try { return JSON.parse(sessionStorage.getItem('user') || '{}')?.id; } catch { return null; }
    })();

    if (!userId) { setError('You must be logged in to submit a project.'); return; }

    setIsSubmitting(true);
    try {
      await projectAPI.submitUserProject(userId, projectId, {
        description:   formData.description,
        github_url:    formData.githubUrl,
        live_demo_url: formData.liveDemoUrl,
        challenges:    formData.challenges,
        learnings:     formData.learnings,
      });
      setShowSuccessModal(true);
    } catch (err) {
      // ✅ Show a friendly modal if already submitted (pending or approved)
      if (err.message?.includes('already submitted')) {
        setShowAlreadyApprovedModal(true);
      } else {
        setError(err.message || 'Submission failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    if (curatedProjectId) navigate(`/projects/${curatedProjectId}`);
    else navigate(`/projects/${projectId}/workspace`);
  };

  // Show modal if already submitted (pending or approved)
  if (showAlreadyApprovedModal) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowAlreadyApprovedModal(false);
            navigate(`/projects/${projectId}/workspace`);
          }}
        />
        
        {/* Modal */}
        <div className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-[rgb(37,99,235)] to-[rgb(29,78,216)] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Project Already Submitted</h2>
          </div>

          {/* Content */}
          <div className="px-6 py-8 text-center">
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              This project already has a submission that is either <span className="font-semibold">pending review</span> or has been <span className="font-semibold">approved</span> by your mentor.
            </p>
            <div className="bg-blue-50 border border-[rgb(226,232,240)] rounded-lg p-4 mb-4">
              <p className="text-sm text-[rgb(37,99,235)]">
                <span className="font-semibold">ℹ️ Info:</span> You can only resubmit projects that have been <span className="font-semibold">rejected</span> by your mentor.
              </p>
            </div>
            <p className="text-slate-500 text-sm">
              If you need to make changes after rejection, you'll be able to resubmit then.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-6 bg-blue-50 border-t border-[rgb(226,232,240)] flex gap-3">
            <button
              onClick={() => {
                setShowAlreadyApprovedModal(false);
                navigate(`/projects/${projectId}/workspace`);
              }}
              className="flex-1 px-4 py-3 bg-white hover:bg-slate-50 text-[rgb(37,99,235)] font-semibold rounded-lg transition-colors duration-200 border border-[rgb(226,232,240)]"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setShowAlreadyApprovedModal(false);
                navigate('/projects');
              }}
              className="flex-1 px-4 py-3 bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold rounded-lg transition-all duration-200"
            >
              Browse Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/projects/${projectId}/workspace`)}
          className="flex items-center gap-2 text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Workspace
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(37,99,235)]">Submit Your Project</h1>
          <p className="text-[rgb(71,85,105)] text-lg">Share your completed work for review and feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Project Overview */}
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-[rgb(37,99,235)]" />
              Project Overview
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">
                  Project Description *
                </label>
                <textarea
                  rows={6}
                  className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300 resize-none"
                  placeholder="Describe your project, what it does, and how it works..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">
                    <Github className="w-4 h-4 inline mr-2" />
                    GitHub Repository URL *
                  </label>
                  <input
                    type="url"
                    className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
                    placeholder="https://github.com/username/repo"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">
                    <Link className="w-4 h-4 inline mr-2" />
                    Live Demo / Video URL *
                  </label>
                  <input
                    type="url"
                    className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
                    placeholder="https://your-demo.com or video link"
                    value={formData.liveDemoUrl}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">Project Reflection</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">Challenges Faced *</label>
                <textarea
                  rows={4}
                  className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300 resize-none"
                  placeholder="What challenges did you encounter? How did you overcome them?"
                  value={formData.challenges}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">Key Learnings *</label>
                <textarea
                  rows={4}
                  className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300 resize-none"
                  placeholder="What did you learn? What skills did you develop?"
                  value={formData.learnings}
                  onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-[rgb(37,99,235)]/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[rgb(37,99,235)] mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Submission Guidelines
            </h3>
            <ul className="text-[rgb(71,85,105)] text-sm space-y-2">
              <li>• All fields marked with * are required</li>
              <li>• Include proper documentation and comments in your code</li>
              <li>• Test your project thoroughly before submission</li>
              <li>• Provide clear instructions for running your project</li>
              <li>• Review will be completed within 3–5 business days</li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-4 px-12 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Project for Review
                </>
              )}
            </button>
          </div>
        </form>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Project Submitted!</h3>
              <p className="text-[rgb(71,85,105)] mb-6">
                Your project has been submitted for mentor review. A certificate will be issued automatically
                when your project is approved and your quiz is passed.
              </p>
              <button
                onClick={handleModalClose}
                className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 w-full"
              >
                Back to Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSubmission;