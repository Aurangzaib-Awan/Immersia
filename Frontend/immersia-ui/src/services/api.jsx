// services/api.js
const API_BASE_URL = 'http://localhost:8000';

const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      let errorDetail = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorData.message || errorDetail;
      } catch {
        errorDetail = response.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    return await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return await apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return await apiRequest('/user');
  },

  // Add changePassword to authAPI as well
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      }),
    });
  }
};

export const courseAPI = {
  getCourses: async () => {
    return await apiRequest('/courses');
  },
  createCourse: async (courseData) => {
    return await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },
  updateCourse: async (courseId, courseData) => {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },
  deleteCourse: async (courseId) => {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
};

export const projectAPI = {
  getProjects: async () => {
    return await apiRequest('/projects');
  },
  createProject: async (projectData) => {
    return await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
  updateProject: async (projectId, projectData) => {
    return await apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },
  deleteProject: async (projectId) => {
    return await apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

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

  // ADD THIS MISSING FUNCTION
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      }),
    });
  }
};