// components/KanbanBoard.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const KanbanBoard = ({ 
  tasks, 
  newTasks, 
  columns, 
  onAddTask, 
  onInputChange, 
  onMoveTask 
}) => {
  return (
    <>
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
                onChange={(e) => onInputChange(column.id, 'title', e.target.value)}
              />
              <textarea
                placeholder="Description (optional)..."
                className="w-full bg-transparent border-none text-gray-300 text-sm placeholder-gray-400 resize-none focus:outline-none"
                rows="2"
                value={newTasks[column.id].description}
                onChange={(e) => onInputChange(column.id, 'description', e.target.value)}
              />
              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={() => onAddTask(column.id)}
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
                          onClick={() => onMoveTask(task.id, column.id, nextColumn.id)}
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
                onMoveTask(taskId, fromColumn, column.id);
              }
            }}
          >
            <div className="text-center text-gray-400 text-sm">
              Drop tasks here to move to {column.title}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default KanbanBoard;