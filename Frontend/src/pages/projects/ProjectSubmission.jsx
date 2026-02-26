// components/ProjectSubmission.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Link, Github, CheckCircle, AlertCircle, X } from 'lucide-react';

const ProjectSubmission = () => {
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...selectedFiles]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.description.trim() ||
      !formData.githubUrl.trim() ||
      !formData.liveDemoUrl.trim() ||
      formData.files.length === 0 ||
      !formData.challenges.trim() ||
      !formData.learnings.trim()) {
      alert('Please fill all required fields including project files upload.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate(`/projects/${projectId}/workspace`);
  };

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(37,99,235)]">
            Submit Your Project
          </h1>
          <p className="text-[rgb(71,85,105)] text-lg">
            Share your completed work for review and feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  required
                  rows={6}
                  className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:bg-white focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300 resize-none"
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
                    required
                    className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:bg-white focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
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
                    required
                    className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:bg-white focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300"
                    placeholder="https://your-project-demo.com or video link"
                    value={formData.liveDemoUrl}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-3">
              <Upload className="w-6 h-6 text-[rgb(37,99,235)]" />
              Project Files *
            </h2>

            <div className="border-2 border-dashed border-[rgb(226,232,240)] rounded-lg p-8 text-center hover:border-[rgb(37,99,235)]/50 transition-all duration-300">
              <Upload className="w-12 h-12 text-[rgb(148,163,184)] mx-auto mb-4" />
              <div className="text-[rgb(71,85,105)] mb-4">
                <p className="font-medium">Upload your project files (Required)</p>
                <p className="text-sm text-[rgb(148,163,184)]">Supported formats: ZIP, RAR, PDF, documentation files</p>
              </div>
              <input
                type="file"
                multiple
                required
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 cursor-pointer inline-block"
              >
                Choose Files
              </label>
            </div>

            {formData.files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Uploaded Files</h3>
                <div className="space-y-3">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[rgb(248,250,252)] rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[rgb(37,99,235)]" />
                        <div>
                          <div className="text-[rgb(15,23,42)] font-medium">{file.name}</div>
                          <div className="text-[rgb(148,163,184)] text-sm">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-600 transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">Project Reflection</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">
                  Challenges Faced *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:bg-white focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300 resize-none"
                  placeholder="What challenges did you encounter during this project? How did you overcome them?"
                  value={formData.challenges}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[rgb(71,85,105)] text-sm font-medium mb-2">
                  Key Learnings *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:bg-white focus:border-[rgb(37,99,235)] focus:ring-2 focus:ring-[rgb(37,99,235)]/20 transition-all duration-300 resize-none"
                  placeholder="What did you learn from this project? What skills did you develop?"
                  value={formData.learnings}
                  onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                />
              </div>
            </div>
          </div>

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
              <li>• Review will be completed within 3-5 business days</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-4 px-12 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-8 max-w-md w-full mx-auto transform scale-100 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">
                  Project Submitted!
                </h3>
                <p className="text-[rgb(71,85,105)] mb-6">
                  Your project has been submitted for review. We will inform you about the next steps once the review is complete.
                </p>
                <button
                  onClick={handleModalClose}
                  className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 w-full"
                >
                  Back to Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSubmission;