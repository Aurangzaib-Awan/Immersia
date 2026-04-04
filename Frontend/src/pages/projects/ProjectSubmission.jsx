// pages/projects/ProjectSubmission.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Link, Github, CheckCircle, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { projectAPI } from '../../services/api.js';

const ProjectSubmission = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    githubUrl: '',
    liveDemoUrl: '',
    files: [],
    challenges: '',
    learnings: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [curatedProjectId, setCuratedProjectId] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...selected] }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  // ── Find matching curated project on mount for redirect ─────────────────────
  React.useEffect(() => {
    const findCuratedProject = async () => {
      try {
        // Fetch user project to get title
        const userProjData = await projectAPI.getUserProject(projectId);
        if (!userProjData) return;

        // Fetch curated projects and find matching one
        const projectsRes = await projectAPI.getProjects();
        const projectsList = projectsRes.projects || projectsRes.data || projectsRes || [];
        const matchedCurated = projectsList.find(p => p.title === userProjData.title);
        
        if (matchedCurated) {
          const curatedId = matchedCurated.id || matchedCurated._id;
          setCuratedProjectId(curatedId);
          console.log('✅ Found curated project for details redirect:', curatedId);
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
      !formData.githubUrl.trim() ||
      !formData.liveDemoUrl.trim() ||
      !formData.challenges.trim() ||
      !formData.learnings.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // Resolve user_id from prop or session cache
    const userId = user?.id || user?._id || (() => {
      try { return JSON.parse(sessionStorage.getItem('user') || '{}')?.id; } catch { return null; }
    })();

    if (!userId) {
      setError('You must be logged in to submit a project.');
      return;
    }

    setIsSubmitting(true);

    try {
      await projectAPI.submitUserProject(userId, projectId, {
        description: formData.description,
        github_url: formData.githubUrl,
        live_demo_url: formData.liveDemoUrl,
        challenges: formData.challenges,
        learnings: formData.learnings,
      });

      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to curated project details if found, otherwise fallback to workspace
    if (curatedProjectId) {
      navigate(`/projects/${curatedProjectId}`);
    } else {
      navigate(`/projects/${projectId}/workspace`);
    }
  };

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

          {/* File Upload (optional — files aren't sent to backend yet, just UI) */}
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-3">
              <Upload className="w-6 h-6 text-[rgb(37,99,235)]" />
              Project Files <span className="text-sm font-normal text-[rgb(148,163,184)]">(optional)</span>
            </h2>
            <div className="border-2 border-dashed border-[rgb(226,232,240)] rounded-lg p-8 text-center hover:border-[rgb(37,99,235)]/50 transition-all duration-300">
              <Upload className="w-12 h-12 text-[rgb(148,163,184)] mx-auto mb-4" />
              <p className="text-[rgb(71,85,105)] font-medium mb-1">Upload project files</p>
              <p className="text-sm text-[rgb(148,163,184)] mb-4">ZIP, RAR, PDF, documentation</p>
              <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 cursor-pointer inline-block"
              >
                Choose Files
              </label>
            </div>

            {formData.files.length > 0 && (
              <div className="mt-6 space-y-3">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-[rgb(248,250,252)] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[rgb(37,99,235)]" />
                      <div>
                        <div className="text-[rgb(15,23,42)] font-medium">{file.name}</div>
                        <div className="text-[rgb(148,163,184)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-600">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
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

          {/* Error */}
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

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Project Submitted!</h3>
              <p className="text-[rgb(71,85,105)] mb-6">
                Your project has been submitted for mentor review. You'll be notified once reviewed.
                A certificate will be issued automatically when your project is approved and your quiz is passed.
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