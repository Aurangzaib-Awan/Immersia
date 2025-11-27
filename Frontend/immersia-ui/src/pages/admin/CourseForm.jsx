import React, { useState } from 'react';

const CourseForm = ({ onClose, onSaveCourse, editCourse = null }) => {
  // Initialize form data directly based on editCourse
  const [formData, setFormData] = useState(() => {
    if (editCourse) {
      return {
        title: editCourse.title,
        description: editCourse.description,
        category: editCourse.category,
        lessons: editCourse.lessons.toString(),
        duration: editCourse.duration,
        instructor: editCourse.instructor
      };
    }
    return {
      title: '',
      description: '',
      category: '',
      lessons: '',
      duration: '',
      instructor: ''
    };
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.lessons || formData.lessons < 1) newErrors.lessons = 'Lessons must be at least 1';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.instructor.trim()) newErrors.instructor = 'Instructor name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare course data
    const courseData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      lessons: parseInt(formData.lessons),
      duration: formData.duration,
      instructor: formData.instructor
    };

    // If editing, include the ID
    if (editCourse) {
      courseData.id = editCourse.id;
    }

    onSaveCourse(courseData, !!editCourse); // Pass whether it's an edit
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background-800 rounded-xl border border-background-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-white">
            {editCourse ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-text-white text-sm font-medium mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full bg-background-700 border ${
                errors.title ? 'border-red-500' : 'border-background-600'
              } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter course title"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-text-white text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full bg-background-700 border ${
                errors.description ? 'border-red-500' : 'border-background-600'
              } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter course description"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-text-white text-sm font-medium mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full bg-background-700 border ${
                  errors.category ? 'border-red-500' : 'border-background-600'
                } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="e.g., Programming, Data Science"
              />
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-text-white text-sm font-medium mb-2">
                Instructor Name *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className={`w-full bg-background-700 border ${
                  errors.instructor ? 'border-red-500' : 'border-background-600'
                } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="Enter instructor name"
              />
              {errors.instructor && <p className="text-red-400 text-sm mt-1">{errors.instructor}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lessons */}
            <div>
              <label className="block text-text-white text-sm font-medium mb-2">
                Number of Lessons *
              </label>
              <input
                type="number"
                name="lessons"
                value={formData.lessons}
                onChange={handleChange}
                min="1"
                className={`w-full bg-background-700 border ${
                  errors.lessons ? 'border-red-500' : 'border-background-600'
                } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="e.g., 12"
              />
              {errors.lessons && <p className="text-red-400 text-sm mt-1">{errors.lessons}</p>}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-text-white text-sm font-medium mb-2">
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full bg-background-700 border ${
                  errors.duration ? 'border-red-500' : 'border-background-600'
                } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="e.g., 8 weeks"
              />
              {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-background-600 text-text-white rounded-lg hover:bg-background-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {editCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;