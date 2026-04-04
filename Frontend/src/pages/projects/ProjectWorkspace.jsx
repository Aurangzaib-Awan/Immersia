// pages/projects/ProjectWorkspace.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Award, ExternalLink, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import KanbanBoard from '../../components/KanbanBoard.jsx';
import { projectAPI } from '../../services/api.js';

const ProjectWorkspace = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const nextTaskId = useRef(1);

  // ── Kanban state ──────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState({
    backlog: [], inProgress: [], review: [], done: []
  });
  const [newTasks, setNewTasks] = useState({
    backlog: { title: '', description: '' },
    inProgress: { title: '', description: '' },
    review: { title: '', description: '' },
    done: { title: '', description: '' }
  });

  // ── Certificate state (kept — used by fetchStatus on mount) ──────────────
  const [certificate, setCertificate] = useState(null);
  const [certLoading, setCertLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [curatedProjectId, setCuratedProjectId] = useState(null);

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
    { id: 'inProgress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  // ── Resolve user_id ───────────────────────────────────────────────────────
  const userId = user?.id || user?._id || (() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}')?.id; } catch { return null; }
  })();

  // ── Fetch certificate + submission status on mount ────────────────────────
  useEffect(() => {
    if (!userId) { setCertLoading(false); return; }

    const startProject = async () => {
      try {
        await projectAPI.startUserProject(projectId);
        console.log('Project marked as started');
      } catch (err) {
        console.error('Failed to mark project as started:', err);
      }
    };

    const fetchStatus = async () => {
      try {
        await startProject();

        // Check for existing certificate
        const certData = await projectAPI.getCertificates(userId);
        const certs = certData.certificates || [];
        const match = certs.find(c => c.project_id === projectId);
        if (match) { setCertificate(match); setCertLoading(false); return; }

        // Fetch project details
        try {
          const projData = await projectAPI.getUserProject(projectId);
          setProjectData(projData);
          console.log('Project data fetched:', projData);

          // Find matching curated project for back navigation
          try {
            const projectsRes = await projectAPI.getProjects();
            const projectsList = projectsRes.projects || projectsRes.data || projectsRes || [];
            const matchedCurated = projectsList.find(p => p.title === projData.title);
            if (matchedCurated) {
              const curatedId = matchedCurated.id || matchedCurated._id;
              setCuratedProjectId(curatedId);
              console.log('Matched curated project for back navigation:', curatedId);
            }
          } catch (err) {
            console.warn('Could not find matching curated project for back navigation:', err);
          }
        } catch (err) {
          console.error('Failed to fetch project data:', err);
        }

        // Check submission status
        const subRes = await fetch(`http://localhost:8000/api/submissions`, { credentials: 'include' });
        const subData = await subRes.json();
        const subs = subData.submissions || [];
        const mySub = subs.find(s => s.user_id === userId && s.project_id === projectId);
        if (mySub) setSubmissionStatus(mySub.status);

      } catch (err) {
        console.error('Workspace status fetch failed:', err);
      } finally {
        setCertLoading(false);
      }
    };

    fetchStatus();
  }, [userId, projectId]);

  // ── Kanban helpers ────────────────────────────────────────────────────────
  const addTask = (columnId) => {
    const currentTask = newTasks[columnId];
    if (!currentTask.title.trim()) return;
    const task = { id: nextTaskId.current++, title: currentTask.title, description: currentTask.description };
    setTasks(prev => ({ ...prev, [columnId]: [...prev[columnId], task] }));
    setNewTasks(prev => ({ ...prev, [columnId]: { title: '', description: '' } }));
  };

  const handleInputChange = (columnId, field, value) => {
    setNewTasks(prev => ({ ...prev, [columnId]: { ...prev[columnId], [field]: value } }));
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    const task = tasks[fromColumn].find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== taskId),
      [toColumn]: [...prev[toColumn], task]
    }));
  };

  const handleSubmitProject = () => navigate(`/projects/${projectId}/submit`);

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(`/projects/${curatedProjectId || projectId}`)}
          className="flex items-center gap-2 text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Project Details
        </button>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(37,99,235)] mb-2">Project Workspace</h1>
            <p className="text-[rgb(71,85,105)]">Plan and track your project progress</p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 text-[rgb(71,85,105)]">
              <Users className="w-5 h-5" />
              <span>Individual Project</span>
            </div>
            <button
              onClick={handleSubmitProject}
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Submit Project
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard
          tasks={tasks}
          newTasks={newTasks}
          columns={columns}
          onAddTask={addTask}
          onInputChange={handleInputChange}
          onMoveTask={moveTask}
        />
      </div>
    </div>
  );
};

export default ProjectWorkspace;