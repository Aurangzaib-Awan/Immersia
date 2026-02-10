import React, { useState } from 'react';

// Markdown preview component - MOVED OUTSIDE the main component
const MarkdownPreview = ({ content }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
      .replace(/(<li.*?<\/li>)/gims, '<ul class="list-disc ml-6 my-2">$1</ul>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  };

  return (
    <div 
      className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

const ProjectForm = ({ onClose, onSaveProject, editProject = null }) => {
  // Top categories array
  const topCategories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Cyber Security',
    'Artificial Intelligence',
    'Blockchain',
    'Game Development'
  ];

  // Difficulty levels
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  // Duration options
  const durationOptions = [
    '1 week',
    '2 weeks',
    '3 weeks',
    '1 month',
    '2 months',
    '3 months',
    '6 months'
  ];

  // Initialize form data
  const [formData, setFormData] = useState(() => {
    if (editProject) {
      return {
        title: editProject.title || '',
        description: editProject.description || '',
        category: editProject.category || '',
        curator: editProject.curator || '',
        technologies: editProject.technologies || [],
        difficulty: editProject.difficulty || 'Beginner',
        duration: editProject.duration || '2 weeks',
        prerequisites: editProject.prerequisites || [''],
        project_description: editProject.project_description || ''
      };
    }
    return {
      title: '',
      description: '',
      category: '',
      curator: '',
      technologies: [],
      difficulty: 'Beginner',
      duration: '2 weeks',
      prerequisites: [''],
      project_description: ''
    };
  });

  const [errors, setErrors] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'

  // Markdown guide - MOVED INSIDE the component but as a constant, not a component
  const markdownGuide = [
    { syntax: '# Header', description: 'Large header' },
    { syntax: '## Header', description: 'Medium header' },
    { syntax: '### Header', description: 'Small header' },
    { syntax: '**bold**', description: 'Bold text' },
    { syntax: '*italic*', description: 'Italic text' },
    { syntax: '- List item', description: 'Bullet point' },
    { syntax: '`code`', description: 'Inline code' },
  ];

  // Handle basic form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle category selection - only predefined categories
  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setShowCategoryDropdown(false);
  };

  // Handle technology management - allow any technology
  const handleAddTechnology = (tech) => {
    const techToAdd = tech.trim();
    if (techToAdd && !formData.technologies.includes(techToAdd)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techToAdd]
      }));
    }
    setTechInput('');
  };

  const handleRemoveTechnology = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const handleTechInputChange = (value) => {
    setTechInput(value);
  };

  // Handle tech input key press (Enter to add)
  const handleTechKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology(techInput);
    }
  };

  // Handle prerequisites
  const handlePrerequisiteChange = (index, value) => {
    const updatedPrerequisites = [...formData.prerequisites];
    updatedPrerequisites[index] = value;
    setFormData(prev => ({
      ...prev,
      prerequisites: updatedPrerequisites
    }));
  };

  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  };

  const removePrerequisite = (index) => {
    if (formData.prerequisites.length > 1) {
      const updatedPrerequisites = formData.prerequisites.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        prerequisites: updatedPrerequisites
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Project description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.curator.trim()) newErrors.curator = 'Curator name is required';
    if (formData.technologies.length === 0) newErrors.technologies = 'At least one technology is required';
    if (!formData.project_description.trim()) newErrors.project_description = 'Project description is required';

    // Validate prerequisites - at least one non-empty
    const validPrerequisites = formData.prerequisites.filter(prereq => prereq.trim() !== '');
    if (validPrerequisites.length === 0) {
      newErrors.prerequisites = 'At least one prerequisite is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Filter out empty prerequisites
    const processedData = {
      ...formData,
      prerequisites: formData.prerequisites.filter(prereq => prereq.trim() !== '')
    };

    onSaveProject(processedData, !!editProject);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const filteredCategories = topCategories.filter(category =>
    category.toLowerCase().includes(formData.category.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Main Modal with Gradient Border - ONLY outer div has gradient */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full max-w-4xl max-h-[95vh] shadow-2xl">
        <div className="bg-surface-800 rounded-xl p-6 max-h-[95vh] overflow-y-auto shadow-lg">
          <div className="flex justify-between items-center mb-6">
            {/* Animated Title */}
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
              {editProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Project Information - No gradient, only black shadow */}
            <div className="bg-surface-800 rounded-xl p-6 border-2 border-black">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Project Information</h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <label className="block text-white text-sm font-medium mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full bg-gray-700 border ${
                      errors.title ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                    placeholder="Enter project title"
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <label className="block text-white text-sm font-medium mb-2">
                    Short Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    className={`w-full bg-gray-700 border ${
                      errors.description ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
                    placeholder="Brief description of the project"
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Category with Enhanced Dropdown and Search */}
  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
    <label className="block text-white text-sm font-medium mb-2">
      Category *
    </label>
    <div className="relative">
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={(e) => {
          handleChange(e);
          setShowCategoryDropdown(true);
        }}
        onFocus={() => setShowCategoryDropdown(true)}
        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
        className={`w-full bg-gray-700 border ${
          errors.category ? 'border-red-500' : 'border-gray-600'
        } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent`}
        placeholder="Type to search categories..."
      />
      
      {/* Enhanced Category Dropdown with Search Results */}
      {showCategoryDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto shadow-xl">
          {/* Search results header */}
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
            {filteredCategories.length > 0 
              ? `Found ${filteredCategories.length} categories` 
              : 'No categories found'
            }
          </div>
          
          {/* Category options */}
          {filteredCategories.map((category, index) => (
            <div
              key={index}
              className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white transition-colors border-b border-gray-700 last:border-b-0 flex items-center justify-between"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleCategorySelect(category);
              }}
            >
              <span>{category}</span>
              {formData.category === category && (
                <span className="text-sky-400 text-sm">✓</span>
              )}
            </div>
          ))}
          
          {/* Add new category option if no exact match */}
          {formData.category && 
           !topCategories.includes(formData.category) && 
           !filteredCategories.includes(formData.category) && (
            <div
              className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-sky-400 transition-colors border-t border-gray-700 flex items-center"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCategorySelect(formData.category);
              }}
            >
              <span className="mr-2">+</span>
              <span>Add "{formData.category}" as new category</span>
            </div>
          )}
        </div>
      )}
      {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
    </div>
    
    {/* Quick category suggestions */}
    <div className="mt-3">
      <div className="text-xs text-gray-400 mb-2">Popular categories:</div>
      <div className="flex flex-wrap gap-2">
        {topCategories.slice(0, 4).map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => handleCategorySelect(category)}
            className="text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-1 rounded transition-colors"
          >
            {category}
          </button>
        ))}
      </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Difficulty */}
                  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                    <label className="block text-white text-sm font-medium mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      {difficultyLevels.map((level, index) => (
                        <option key={index} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                    <label className="block text-white text-sm font-medium mb-2">
                      Estimated Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      {durationOptions.map((duration, index) => (
                        <option key={index} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Technologies - Allow any technology */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <label className="block text-white text-sm font-medium mb-2">
                    Technologies Used *
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => handleTechInputChange(e.target.value)}
                        onKeyPress={handleTechKeyPress}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Type technology and press Enter to add"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTechnology(techInput)}
                        className="px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        Add Tech
                      </button>
                    </div>
                    
                    {/* Selected Technologies - Same style as original */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.technologies.map((tech, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnology(tech)}
                            className="text-sky-400 hover:text-sky-300 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {errors.technologies && <p className="text-red-400 text-sm mt-1">{errors.technologies}</p>}
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <label className="block text-white text-sm font-medium mb-2">
                    Prerequisites *
                  </label>
                  <div className="space-y-2">
                    {formData.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={prereq}
                          onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Enter prerequisite skill or knowledge"
                        />
                        {formData.prerequisites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrerequisite(index)}
                            className="text-red-400 hover:text-red-300 transition-colors px-3 py-3 border border-red-400 rounded-lg hover:bg-red-400 hover:bg-opacity-10"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPrerequisite}
                      className="px-3 py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-sky-400 hover:text-sky-400 transition-colors text-sm"
                    >
                      + Add Prerequisite
                    </button>
                  </div>
                  {errors.prerequisites && <p className="text-red-400 text-sm mt-1">{errors.prerequisites}</p>}
                </div>

                {/* Detailed Project Description with Markdown Support */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-white text-sm font-medium">
                      Detailed Project Description *
                    </label>
                    
                    {/* Markdown Guide */}
                    <div className="relative group">
                      <button
                        type="button"
                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        Markdown Guide
                      </button>
                      <div className="absolute right-0 top-6 w-64 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <h4 className="font-medium text-white mb-2">Markdown Syntax</h4>
                        <div className="space-y-1 text-xs">
                          {markdownGuide.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <code className="text-sky-400">{item.syntax}</code>
                              <span className="text-gray-400">{item.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Markdown Tabs */}
                  <div className="flex border-b border-gray-600 mb-3">
                    <button
                      type="button"
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTab === 'write' 
                          ? 'border-b-2 border-sky-500 text-sky-500' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('write')}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTab === 'preview' 
                          ? 'border-b-2 border-sky-500 text-sky-500' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('preview')}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Markdown Editor/Preview */}
                  {activeTab === 'write' ? (
                    <textarea
                      name="project_description"
                      value={formData.project_description}
                      onChange={handleChange}
                      rows="8"
                      className={`w-full bg-gray-700 border ${
                        errors.project_description ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm`}
                      placeholder="Provide detailed project requirements, features to implement, expected outcomes, success criteria, and any specific instructions...

You can use Markdown formatting:
# Main Heading
## Subheading
**Bold text**
*Italic text*
- List items
`inline code`"
                    />
                  ) : (
                    <div className="min-h-[200px] bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 overflow-y-auto max-h-64">
                      {formData.project_description ? (
                        <MarkdownPreview content={formData.project_description} />
                      ) : (
                        <p className="text-gray-400 italic">Nothing to preview yet. Start writing in the Write tab.</p>
                      )}
                    </div>
                  )}
                  
                  {errors.project_description && <p className="text-red-400 text-sm mt-1">{errors.project_description}</p>}
                  <p className="text-gray-400 text-xs mt-2">
                    Include requirements, features to build, expected outputs, and success criteria. 
                    <span className="text-sky-400"> Markdown is supported for rich formatting.</span>
                  </p>
                </div>
              </div>
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
                {editProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;