// components/courses/CourseWorkspace.jsx
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BookOpen, PlayCircle } from 'lucide-react';
import KanbanBoard from '../../components/KanbanBoard';

const CourseWorkspace = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(37,99,235)] mb-2">
              Learning Workspace
            </h1>
            <p className="text-[rgb(71,85,105)]">Plan and track your learning progress</p>
          </div>

          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 text-[rgb(71,85,105)]">
              <BookOpen className="w-5 h-5" />
              <span>Self-Paced Learning</span>
            </div>
            <button
              onClick={handleTakeQuiz}
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
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