// services/api.js
const API_BASE_URL = 'http://localhost:8000';

const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // User login
  login: async (email, password) => {
    return await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // User registration
  register: async (userData) => {
    return await apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest('/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Course API functions
export const courseAPI = {
  // Get all courses
  getCourses: async () => {
    return await apiRequest('/courses');
  },

  // Create new course
  createCourse: async (courseData) => {
    return await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  // Update existing course
  updateCourse: async (courseId, courseData) => {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  // Delete course
  deleteCourse: async (courseId) => {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
};

// Project API functions
export const projectAPI = {
  // Get all projects
  getProjects: async () => {
    return await apiRequest('/projects');
  },

  // Create new project
  createProject: async (projectData) => {
    return await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Update existing project
  updateProject: async (projectId, projectData) => {
    return await apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  // Delete project
  deleteProject: async (projectId) => {
    return await apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

// ADD ONLY THIS - Admin API functions for StatsGrid
export const adminAPI = {
  // Get dashboard stats
  getStats: async () => {
    return await apiRequest('/admin/stats');
  },

  // Get all users
  getUsers: async () => {
    return await apiRequest('/admin/users');
  },
    // Delete user
  deleteUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
});
  },

  // Get all courses
  getCourses: async () => {
    return await apiRequest('/courses');
  },

  // Get all projects
  getProjects: async () => {
    return await apiRequest('/projects');
  },
};