import React, { useState } from 'react';

const CourseForm = ({ onClose, onSaveCourse, editCourse = null }) => {
  // Top 10 categories array
  const TOP_CATEGORIES = [
    'Programming',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'DevOps',
    'Cyber Security',
    'Artificial Intelligence',
    'Blockchain'
  ];

  // Lesson types
  const lessonTypes = [
    'video',
    'reading',
    'exercise',
    'quiz',
    'project'
  ];

  // Duration units
  const durationUnits = [
    'minutes',
    'hours',
    'days',
    'weeks'
  ];

  // Initialize form data
  const [formData, setFormData] = useState(() => {
    if (editCourse) {
      return {
        title: editCourse.title || '',
        description: editCourse.description || '',
        category: editCourse.category || '',
        curator: editCourse.curator || '', // Changed from instructor to curator
        modules: editCourse.modules || [
          {
            title: '',
            description: '',
            estimatedTime: { value: '', unit: 'hours' }, // Updated to object
            order: 1,
            lessons: [
              {
                title: '',
                type: 'video',
                description: '',
                resources: [{ url: '', title: '' }],
                learningObjectives: [''],
                duration: { value: '', unit: 'minutes' } // Updated to object
              }
            ]
          }
        ]
      };
    }
    return {
      title: '',
      description: '',
      category: '',
      curator: '', // Changed from instructor to curator
      modules: [
        {
          title: '',
          description: '',
          estimatedTime: { value: '', unit: 'hours' }, // Updated to object
          order: 1,
          lessons: [
            {
              title: '',
              type: 'video',
              description: '',
              resources: [{ url: '', title: '' }],
              learningObjectives: [''],
              duration: { value: '', unit: 'minutes' } // Updated to object
            }
          ]
        }
      ]
    };
  });

  const [errors, setErrors] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Handle category input - prevent non-predefined entries
  const handleCategoryInput = (e) => {
    const value = e.target.value;
    // Only allow values that match predefined categories
    const matchingCategory = TOP_CATEGORIES.find(cat => 
      cat.toLowerCase() === value.toLowerCase()
    );
    
    if (matchingCategory || value === '') {
      setFormData(prev => ({
        ...prev,
        category: matchingCategory || value
      }));
    }
  };

  // Filter categories for dropdown
  const filteredCategories = TOP_CATEGORIES.filter(category =>
    category.toLowerCase().includes(formData.category.toLowerCase())
  );

  // Input validation handlers
  const validateNumberInput = (value) => {
    return value.replace(/[^0-9]/g, ''); // Only allow numbers
  };

  const validateTextInput = (value) => {
    return value.replace(/[^a-zA-Z0-9\s\-_,.]/g, ''); // Allow alphanumeric and basic punctuation
  };

  const validateURLInput = (value) => {
    return value; // You can add URL validation here if needed
  };

  // Handle basic form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    
    // Apply input filtering based on field type
    if (name === 'title' || name === 'description' || name === 'category' || name === 'curator') {
      filteredValue = validateTextInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle category selection from dropdown
  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setShowCategoryDropdown(false);
  };

  // MODULE HANDLERS
  const handleModuleChange = (moduleIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex][field] = value;
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Handle module estimated time changes
  const handleModuleTimeChange = (moduleIndex, field, value) => {
    const updatedModules = [...formData.modules];
    if (field === 'value') {
      updatedModules[moduleIndex].estimatedTime.value = validateNumberInput(value);
    } else {
      updatedModules[moduleIndex].estimatedTime.unit = value;
    }
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const addModule = () => {
    const newModule = {
      title: '',
      description: '',
      estimatedTime: { value: '', unit: 'hours' },
      order: formData.modules.length + 1,
      lessons: [
        {
          title: '',
          type: 'video',
          description: '',
          resources: [{ url: '', title: '' }],
          learningObjectives: [''],
          duration: { value: '', unit: 'minutes' }
        }
      ]
    };
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const removeModule = (moduleIndex) => {
    if (formData.modules.length > 1) {
      const updatedModules = formData.modules.filter((_, index) => index !== moduleIndex);
      // Reorder modules
      const reorderedModules = updatedModules.map((module, index) => ({
        ...module,
        order: index + 1
      }));
      setFormData(prev => ({
        ...prev,
        modules: reorderedModules
      }));
    }
  };

  // LESSON HANDLERS
  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    const updatedModules = [...formData.modules];
    
    // Apply input filtering for text fields
    if (field === 'title' || field === 'description') {
      updatedModules[moduleIndex].lessons[lessonIndex][field] = validateTextInput(value);
    } else {
      updatedModules[moduleIndex].lessons[lessonIndex][field] = value;
    }
    
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Handle lesson duration changes
  const handleLessonDurationChange = (moduleIndex, lessonIndex, field, value) => {
    const updatedModules = [...formData.modules];
    if (field === 'value') {
      updatedModules[moduleIndex].lessons[lessonIndex].duration.value = validateNumberInput(value);
    } else {
      updatedModules[moduleIndex].lessons[lessonIndex].duration.unit = value;
    }
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const addLesson = (moduleIndex) => {
    const updatedModules = [...formData.modules];
    const newLesson = {
      title: '',
      type: 'video',
      description: '',
      resources: [{ url: '', title: '' }],
      learningObjectives: [''],
      duration: { value: '', unit: 'minutes' }
    };
    updatedModules[moduleIndex].lessons.push(newLesson);
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...formData.modules];
    if (updatedModules[moduleIndex].lessons.length > 1) {
      updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter(
        (_, index) => index !== lessonIndex
      );
      setFormData(prev => ({
        ...prev,
        modules: updatedModules
      }));
    }
  };

  // RESOURCE HANDLERS
  const handleResourceChange = (moduleIndex, lessonIndex, resourceIndex, field, value) => {
    const updatedModules = [...formData.modules];
    
    // Apply input filtering
    if (field === 'title') {
      updatedModules[moduleIndex].lessons[lessonIndex].resources[resourceIndex][field] = validateTextInput(value);
    } else {
      updatedModules[moduleIndex].lessons[lessonIndex].resources[resourceIndex][field] = validateURLInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const addResource = (moduleIndex, lessonIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex].resources.push({ url: '', title: '' });
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const removeResource = (moduleIndex, lessonIndex, resourceIndex) => {
    const updatedModules = [...formData.modules];
    if (updatedModules[moduleIndex].lessons[lessonIndex].resources.length > 1) {
      updatedModules[moduleIndex].lessons[lessonIndex].resources = 
        updatedModules[moduleIndex].lessons[lessonIndex].resources.filter(
          (_, index) => index !== resourceIndex
        );
      setFormData(prev => ({
        ...prev,
        modules: updatedModules
      }));
    }
  };

  // LEARNING OBJECTIVES HANDLERS
  const handleLearningObjectiveChange = (moduleIndex, lessonIndex, objectiveIndex, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex].learningObjectives[objectiveIndex] = validateTextInput(value);
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const addLearningObjective = (moduleIndex, lessonIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].lessons[lessonIndex].learningObjectives.push('');
    setFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  const removeLearningObjective = (moduleIndex, lessonIndex, objectiveIndex) => {
    const updatedModules = [...formData.modules];
    if (updatedModules[moduleIndex].lessons[lessonIndex].learningObjectives.length > 1) {
      updatedModules[moduleIndex].lessons[lessonIndex].learningObjectives = 
        updatedModules[moduleIndex].lessons[lessonIndex].learningObjectives.filter(
          (_, index) => index !== objectiveIndex
        );
      setFormData(prev => ({
        ...prev,
        modules: updatedModules
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic course validation
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.curator.trim()) newErrors.curator = 'Curator name is required';

    // Module validation
    formData.modules.forEach((module, moduleIndex) => {
      if (!module.title.trim()) {
        newErrors[`module-${moduleIndex}-title`] = 'Module title is required';
      }
      if (!module.description.trim()) {
        newErrors[`module-${moduleIndex}-description`] = 'Module description is required';
      }
      // Module estimated time validation
      if (!module.estimatedTime.value.trim()) {
        newErrors[`module-${moduleIndex}-estimatedTime`] = 'Module estimated time is required';
      }

      // Lesson validation
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title.trim()) {
          newErrors[`module-${moduleIndex}-lesson-${lessonIndex}-title`] = 'Lesson title is required';
        }
        if (!lesson.description.trim()) {
          newErrors[`module-${moduleIndex}-lesson-${lessonIndex}-description`] = 'Lesson description is required';
        }
        // Lesson duration validation
        if (!lesson.duration.value.trim()) {
          newErrors[`module-${moduleIndex}-lesson-${lessonIndex}-duration`] = 'Lesson duration is required';
        }

        // Resource validation - at least one resource with URL
        const validResources = lesson.resources.filter(resource => resource.url.trim() !== '');
        if (validResources.length === 0) {
          newErrors[`module-${moduleIndex}-lesson-${lessonIndex}-resources`] = 'At least one resource with URL is required';
        }

        // Learning objectives validation
        const validObjectives = lesson.learningObjectives.filter(obj => obj.trim() !== '');
        if (validObjectives.length === 0) {
          newErrors[`module-${moduleIndex}-lesson-${lessonIndex}-objectives`] = 'At least one learning objective is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Filter out empty learning objectives and ensure resources have URLs
    const processedModules = formData.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => ({
        ...lesson,
        learningObjectives: lesson.learningObjectives.filter(obj => obj.trim() !== ''),
        resources: lesson.resources.filter(resource => resource.url.trim() !== '')
      }))
    }));

    // Prepare course data
    const courseData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      curator: formData.curator, // Changed from instructor to curator
      modules: processedModules
    };

    // If editing, include the ID
    if (editCourse) {
      courseData.id = editCourse.id;
    }

    onSaveCourse(courseData, !!editCourse);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Main Modal with Gradient Border */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full max-w-4xl max-h-[95vh] shadow-2xl">
        <div className="bg-surface-800 rounded-xl p-6 max-h-[95vh] overflow-y-auto shadow-lg">
          <div className="flex justify-between items-center mb-6">
            {/* Animated Title */}
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
              {editCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Course Information */}
            <div className="bg-surface-800 rounded-xl p-6 border-2 border-black">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Course Information</h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <label className="block text-white text-sm font-medium mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 border ${
                      errors.title ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                    placeholder="Enter course title"
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <label className="block text-white text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full bg-gray-700 border ${
                      errors.description ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                    placeholder="Enter course description"
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category with Dropdown */}
                  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                    <label className="block text-white text-sm font-medium mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryInput}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                        className={`w-full bg-gray-700 border ${
                          errors.category ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                        placeholder="Select or search category"
                      />
                      
                      {/* Category Dropdown */}
                      {showCategoryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto shadow-xl">
                          {filteredCategories.map((category, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white transition-colors border-b border-gray-700 last:border-b-0"
                              onMouseDown={() => handleCategorySelect(category)}
                            >
                              {category}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                    </div>
                  </div>

                  {/* Curator */}
                  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                    <label className="block text-white text-sm font-medium mb-2">
                      Curator Name *
                    </label>
                    <input
                      type="text"
                      name="curator"
                      value={formData.curator}
                      onChange={handleChange}
                      className={`w-full bg-gray-700 border ${
                        errors.curator ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                      placeholder="Enter curator name"
                    />
                    {errors.curator && <p className="text-red-400 text-sm mt-1">{errors.curator}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modules Section */}
            <div className="bg-surface-800 rounded-xl p-6 border-2 border-black">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Course Modules</h3>
                <button
                  type="button"
                  onClick={addModule}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  + Add Module
                </button>
              </div>

              {formData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-semibold text-white">Module {moduleIndex + 1}</h4>
                    {formData.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(moduleIndex)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors border border-red-400 rounded-lg hover:bg-red-400 hover:bg-opacity-10"
                      >
                        Remove Module
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Module Title */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Module Title *
                      </label>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                        className={`w-full bg-gray-700 border ${
                          errors[`module-${moduleIndex}-title`] ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                        placeholder="Enter module title"
                      />
                      {errors[`module-${moduleIndex}-title`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`module-${moduleIndex}-title`]}</p>
                      )}
                    </div>

                    {/* Module Description */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Module Description *
                      </label>
                      <textarea
                        value={module.description}
                        onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
                        rows="2"
                        className={`w-full bg-gray-700 border ${
                          errors[`module-${moduleIndex}-description`] ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                        placeholder="Enter module description"
                      />
                      {errors[`module-${moduleIndex}-description`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`module-${moduleIndex}-description`]}</p>
                      )}
                    </div>

                    {/* Module Estimated Time */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Estimated Time *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={module.estimatedTime.value}
                          onChange={(e) => handleModuleTimeChange(moduleIndex, 'value', e.target.value)}
                          className={`w-1/3 bg-gray-700 border ${
                            errors[`module-${moduleIndex}-estimatedTime`] ? 'border-red-500' : 'border-gray-600'
                          } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                          placeholder="e.g., 2"
                        />
                        <select
                          value={module.estimatedTime.unit}
                          onChange={(e) => handleModuleTimeChange(moduleIndex, 'unit', e.target.value)}
                          className="w-2/3 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        >
                          {durationUnits.map((unit, index) => (
                            <option key={index} value={unit}>
                              {unit.charAt(0).toUpperCase() + unit.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors[`module-${moduleIndex}-estimatedTime`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`module-${moduleIndex}-estimatedTime`]}</p>
                      )}
                    </div>

                    {/* Lessons Section */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-semibold text-white">Lessons</h5>
                        <button
                          type="button"
                          onClick={() => addLesson(moduleIndex)}
                          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg text-sm"
                        >
                          + Add Lesson
                        </button>
                      </div>

                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="bg-gray-700 rounded-lg p-4 mb-4 shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <h6 className="text-sm font-semibold text-white">Lesson {lessonIndex + 1}</h6>
                            {module.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                className="px-3 py-1 text-red-400 hover:text-red-300 transition-colors border border-red-400 rounded-lg hover:bg-red-400 hover:bg-opacity-10 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            {/* Lesson Title */}
                            <div>
                              <label className="block text-white text-sm font-medium mb-2">
                                Lesson Title *
                              </label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                                className={`w-full bg-gray-600 border ${
                                  errors[`module-${moduleIndex}-lesson-${lessonIndex}-title`] ? 'border-red-500' : 'border-gray-500'
                                } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                                placeholder="Enter lesson title"
                              />
                              {errors[`module-${moduleIndex}-lesson-${lessonIndex}-title`] && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors[`module-${moduleIndex}-lesson-${lessonIndex}-title`]}
                                </p>
                              )}
                            </div>

                            {/* Lesson Type */}
                            <div>
                              <label className="block text-white text-sm font-medium mb-2">
                                Lesson Type
                              </label>
                              <select
                                value={lesson.type}
                                onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'type', e.target.value)}
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              >
                                {lessonTypes.map((type, index) => (
                                  <option key={index} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Lesson Description */}
                            <div>
                              <label className="block text-white text-sm font-medium mb-2">
                                Lesson Description *
                              </label>
                              <textarea
                                value={lesson.description}
                                onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'description', e.target.value)}
                                rows="2"
                                className={`w-full bg-gray-600 border ${
                                  errors[`module-${moduleIndex}-lesson-${lessonIndex}-description`] ? 'border-red-500' : 'border-gray-500'
                                } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                                placeholder="Enter lesson description"
                              />
                              {errors[`module-${moduleIndex}-lesson-${lessonIndex}-description`] && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors[`module-${moduleIndex}-lesson-${lessonIndex}-description`]}
                                </p>
                              )}
                            </div>

                            {/* Lesson Duration */}
                            <div>
                              <label className="block text-white text-sm font-medium mb-2">
                                Duration *
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={lesson.duration.value}
                                  onChange={(e) => handleLessonDurationChange(moduleIndex, lessonIndex, 'value', e.target.value)}
                                  className={`w-1/3 bg-gray-600 border ${
                                    errors[`module-${moduleIndex}-lesson-${lessonIndex}-duration`] ? 'border-red-500' : 'border-gray-500'
                                  } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                                  placeholder="e.g., 15"
                                />
                                <select
                                  value={lesson.duration.unit}
                                  onChange={(e) => handleLessonDurationChange(moduleIndex, lessonIndex, 'unit', e.target.value)}
                                  className="w-2/3 bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                >
                                  {durationUnits.map((unit, index) => (
                                    <option key={index} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {errors[`module-${moduleIndex}-lesson-${lessonIndex}-duration`] && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors[`module-${moduleIndex}-lesson-${lessonIndex}-duration`]}
                                </p>
                              )}
                            </div>

                            {/* Learning Objectives */}
                            <div>
                              <label className="block text-white text-sm font-medium mb-2">
                                Learning Objectives *
                              </label>
                              <div className="space-y-2">
                                {lesson.learningObjectives.map((objective, objectiveIndex) => (
                                  <div key={objectiveIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={objective}
                                      onChange={(e) => handleLearningObjectiveChange(moduleIndex, lessonIndex, objectiveIndex, e.target.value)}
                                      className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                      placeholder="Enter learning objective"
                                    />
                                    {lesson.learningObjectives.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeLearningObjective(moduleIndex, lessonIndex, objectiveIndex)}
                                        className="px-3 py-3 text-red-400 hover:text-red-300 transition-colors border border-red-400 rounded-lg hover:bg-red-400 hover:bg-opacity-10"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addLearningObjective(moduleIndex, lessonIndex)}
                                  className="px-3 py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-sky-400 hover:text-sky-400 transition-colors text-sm"
                                >
                                  + Add Objective
                                </button>
                              </div>
                              {errors[`module-${moduleIndex}-lesson-${lessonIndex}-objectives`] && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors[`module-${moduleIndex}-lesson-${lessonIndex}-objectives`]}
                                </p>
                              )}
                            </div>

                            {/* Resources */}
                            <div>
                              <label className="block text-white text-sm font-medium mb-2">
                                Learning Resources *
                              </label>
                              <div className="space-y-3">
                                {lesson.resources.map((resource, resourceIndex) => (
                                  <div key={resourceIndex} className="space-y-2">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={resource.title}
                                        onChange={(e) => handleResourceChange(moduleIndex, lessonIndex, resourceIndex, 'title', e.target.value)}
                                        className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        placeholder="Resource title (e.g., 'React Official Documentation')"
                                      />
                                      {lesson.resources.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeResource(moduleIndex, lessonIndex, resourceIndex)}
                                          className="px-3 py-3 text-red-400 hover:text-red-300 transition-colors border border-red-400 rounded-lg hover:bg-red-400 hover:bg-opacity-10"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                    <input
                                      type="url"
                                      value={resource.url}
                                      onChange={(e) => handleResourceChange(moduleIndex, lessonIndex, resourceIndex, 'url', e.target.value)}
                                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                      placeholder="https://example.com/resource"
                                    />
                                  </div>
                                ))}
                                
                                <button
                                  type="button"
                                  onClick={() => addResource(moduleIndex, lessonIndex)}
                                  className="px-3 py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-sky-400 hover:text-sky-400 transition-colors text-sm"
                                >
                                  + Add Another Resource
                                </button>
                              </div>
                              {errors[`module-${moduleIndex}-lesson-${lessonIndex}-resources`] && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors[`module-${moduleIndex}-lesson-${lessonIndex}-resources`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                {editCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;