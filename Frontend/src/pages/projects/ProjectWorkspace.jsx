// components/ProjectWorkspace.jsx
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import KanbanBoard from '../../components/KanbanBoard.jsx';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const nextTaskId = useRef(1);
  
  // Empty initial state for kanban board
  const [tasks, setTasks] = useState({
    backlog: [],
    inProgress: [],
    review: [],
    done: []
  });

  // Separate state for each column's input
  const [newTasks, setNewTasks] = useState({
    backlog: { title: '', description: '' },
    inProgress: { title: '', description: '' },
    review: { title: '', description: '' },
    done: { title: '', description: '' }
  });

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
    { id: 'inProgress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  const addTask = (columnId) => {
    const currentTask = newTasks[columnId];
    if (!currentTask.title.trim()) return;
    
    const task = {
      id: nextTaskId.current++,
      title: currentTask.title,
      description: currentTask.description
    };

    setTasks(prev => ({
      ...prev,
      [columnId]: [...prev[columnId], task]
    }));

    // Reset only the current column's input
    setNewTasks(prev => ({
      ...prev,
      [columnId]: { title: '', description: '' }
    }));
  };

  const handleInputChange = (columnId, field, value) => {
    setNewTasks(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        [field]: value
      }
    }));
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

  const handleSubmitProject = () => {
    navigate(`/projects/${projectId}/submit`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            {/* Title with flowing gradient text */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
              Project Workspace
            </h1>
            <p className="text-gray-300">Plan and track your project progress</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-5 h-5" />
              <span>Individual Project</span>
            </div>
            <button 
              onClick={handleSubmitProject}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Submit Project
            </button>
          </div>
        </div>

        {/* Kanban Board Component */}
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