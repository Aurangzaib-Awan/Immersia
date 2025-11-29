// components/ProjectWorkspace.jsx
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="bg-surface-800 border border-gray-700 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="text-gray-400 text-sm bg-gray-700 px-2 py-1 rounded">
                    {tasks[column.id].length}
                  </span>
                </div>
              </div>

              {/* Add Task Form - Each column has its own isolated input */}
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Task title..."
                  className="w-full bg-transparent border-none text-white placeholder-gray-400 mb-2 focus:outline-none"
                  value={newTasks[column.id].title}
                  onChange={(e) => handleInputChange(column.id, 'title', e.target.value)}
                />
                <textarea
                  placeholder="Description (optional)..."
                  className="w-full bg-transparent border-none text-gray-300 text-sm placeholder-gray-400 resize-none focus:outline-none"
                  rows="2"
                  value={newTasks[column.id].description}
                  onChange={(e) => handleInputChange(column.id, 'description', e.target.value)}
                />
                <div className="flex justify-end items-center mt-2">
                  <button
                    onClick={() => addTask(column.id)}
                    className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors duration-300 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {tasks[column.id].map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:border-sky-400/50 transition-all duration-300 cursor-pointer group"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('taskId', task.id);
                      e.dataTransfer.setData('fromColumn', column.id);
                    }}
                  >
                    <div className="mb-2">
                      <h4 className="font-medium text-white group-hover:text-sky-400 transition-colors duration-300">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-gray-300 text-sm mt-2">{task.description}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600">
                      <div className="flex gap-2">
                        {columns.filter(col => col.id !== column.id).map(nextColumn => (
                          <button
                            key={nextColumn.id}
                            onClick={() => moveTask(task.id, column.id, nextColumn.id)}
                            className={`text-xs px-2 py-1 rounded ${nextColumn.color} text-white hover:opacity-80 transition-opacity duration-300`}
                          >
                            Move to {nextColumn.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tasks[column.id].length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-sm">No tasks yet. Add your first task!</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Drop Zones for Drag and Drop - HIDDEN ON MOBILE AND TABLET */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {columns.map(column => (
            <div
              key={column.id}
              className="min-h-32 border-2 border-dashed border-gray-600 rounded-xl p-4 transition-all duration-300 hover:border-sky-400/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = parseInt(e.dataTransfer.getData('taskId'));
                const fromColumn = e.dataTransfer.getData('fromColumn');
                if (fromColumn !== column.id) {
                  moveTask(taskId, fromColumn, column.id);
                }
              }}
            >
              <div className="text-center text-gray-400 text-sm">
                Drop tasks here to move to {column.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;