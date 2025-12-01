// components/courses/CourseWorkspace.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BookOpen, PlayCircle, AlertCircle } from 'lucide-react';
import KanbanBoard from '../../components/KanbanBoard';

const CourseWorkspace = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  
  const nextTaskId = useRef(1);
  
  // Empty initial state for kanban board
  const [tasks, setTasks] = useState({
    toStudy: [],
    inProgress: [],
    review: [],
    completed: []
  });

  // Separate state for each column's input
  const [newTasks, setNewTasks] = useState({
    toStudy: { title: '', description: '' },
    inProgress: { title: '', description: '' },
    review: { title: '', description: '' },
    completed: { title: '', description: '' }
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        // Redirect to login with return URL
        navigate('/login', { 
          state: { 
            from: `/courses/${courseId}/workspace`,
            message: 'Please login to access the course workspace'
          }
        });
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        if (!parsedUser || !parsedUser.email) {
          // Invalid user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { 
            state: { 
              from: `/courses/${courseId}/workspace`,
              message: 'Session expired. Please login again'
            }
          });
          return;
        }
        
        setAuthChecked(true);
      } catch {
        // Invalid JSON
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { 
          state: { 
            from: `/courses/${courseId}/workspace`,
            message: 'Session expired. Please login again'
          }
        });
      }
    };
    
    checkAuthentication();
  }, [courseId, navigate]);

  const columns = [
    { id: 'toStudy', title: 'To Study', color: 'bg-gray-500' },
    { id: 'inProgress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-500' },
    { id: 'completed', title: 'Completed', color: 'bg-green-500' }
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

  const handleTakeQuiz = () => {
    navigate(`/courses/${courseId}/quiz`);
  };

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
              Learning Workspace
            </h1>
            <p className="text-gray-300">Plan and track your learning progress</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 text-gray-300">
              <BookOpen className="w-5 h-5" />
              <span>Self-Paced Learning</span>
            </div>
            <button 
              onClick={handleTakeQuiz}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Take Quiz
            </button>
          </div>
        </div>

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

export default CourseWorkspace;