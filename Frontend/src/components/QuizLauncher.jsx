import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quiz from "../pages/courses/Quiz";
import { projectAPI } from "../services/api";
import { Brain, AlertCircle, ArrowLeft } from "lucide-react";

export default function QuizLauncher({ userId }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState(null);
  const [resolvedProjectId, setResolvedProjectId] = useState(null);
  const [showAlreadyPassedDialog, setShowAlreadyPassedDialog] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        // ✅ First resolve the correct user_project id
        // The URL might have the curated project id — we need the user_project id
        let userProjectId = projectId;

        try {
          // Try fetching as a user project directly
          const userProj = await projectAPI.getUserProject(projectId);
          if (userProj && userProj._id) {
            userProjectId = userProj._id;
            console.log("✅ Resolved user project id:", userProjectId);
          }
        } catch (e) {
          // If that fails, search user's projects to find matching one
          console.warn("Direct lookup failed, searching user projects...");
          try {
            const allProjects = await projectAPI.getUserProjects(userId);
            const projects = allProjects.projects || [];
            // Find by matching either _id or a linked curated project id
            const match = projects.find(
              p => p._id === projectId || 
                   p.project_id === projectId ||
                   p.user_project_id === projectId
            );
            if (match) {
              userProjectId = match._id || match.project_id;
              console.log("✅ Found user project via search:", userProjectId);
            }
          } catch (e2) {
            console.warn("User project search also failed:", e2);
          }
        }

        setResolvedProjectId(userProjectId);

        // ✅ Now generate quiz with the correct user project id
        const data = await projectAPI.generateQuiz(userProjectId, userId);
        setQuizId(data.quiz_id);
        setQuestions(data.questions);
        console.log("✅ Quiz generated for project:", userProjectId);
      } catch (err) {
        console.error(err);
        const errorMsg = err?.message || String(err);
        
        // Check if quiz already passed
        if (errorMsg.includes("already passed")) {
          setShowAlreadyPassedDialog(true);
        } else {
          alert("Failed to generate quiz: " + errorMsg);
        }
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [projectId, userId]);

  if (loading) return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-fade-in">
      {/* Spinner Container */}
      <div className="relative mb-8 text-center">
        {/* Rotating Border Circle (Spinner) */}
        <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin mx-auto shadow-xl" />
        
        {/* Pulsing Brain Icon - Centered Absolutely */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
        Generating Your Quiz
      </h2>

      {/* Subtitle with Pulse Animation */}
      <p className="text-slate-500 mt-4 font-medium italic animate-pulse">
        AI is preparing custom questions...
      </p>
    </div>
  );
  
  // Show modal if already passed quiz
  if (showAlreadyPassedDialog) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowAlreadyPassedDialog(false);
            navigate(-1);
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
            <h2 className="text-2xl font-bold text-white">Quiz Completed Successfully! 🎉</h2>
          </div>

          {/* Content */}
          <div className="px-6 py-8 text-center">
            <p className="text-slate-600 text-base leading-relaxed mb-2">
              Excellent! You have successfully passed this quiz.
            </p>
            <p className="text-slate-500 text-sm">
              You cannot retake quizzes once they have been completed. Move on to new challenges!
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-6 bg-blue-50 border-t border-[rgb(226,232,240)] flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-3 bg-white hover:bg-slate-50 text-[rgb(37,99,235)] font-semibold rounded-lg transition-colors duration-200 border border-[rgb(226,232,240)] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => {
                setShowAlreadyPassedDialog(false);
                navigate("/");
              }}
              className="flex-1 px-4 py-3 bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold rounded-lg transition-all duration-200"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!questions) return <div className="p-4 text-red-600">Unable to load quiz.</div>;

  return (
    <Quiz
      questions={questions}
      quizId={quizId}
      userId={userId}
      projectId={resolvedProjectId}
    />
  );
}