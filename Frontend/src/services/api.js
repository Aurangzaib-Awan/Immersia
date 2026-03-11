// services/api.js
const API_BASE_URL = 'http://localhost:8000';

let _csrf = null;

const fetchCsrf = async () => {
  if (_csrf) return _csrf;
  const res = await fetch(`${API_BASE_URL}/session/csrf`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch CSRF token');
  const data = await res.json();
  _csrf = data.csrf_token;
  return _csrf;
};

const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Cookie-based auth — credentials: 'include' sends session cookie automatically
    const opts = {
      credentials: 'include',
      headers,
      ...options,
    };

    // CSRF header for state-changing requests (skip auth endpoints)
    if (opts.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(opts.method.toUpperCase())) {
      const path = endpoint.split('?')[0];
      const skipCsrf = path.startsWith('/login')
                    || path.startsWith('/signup')
                    || path.startsWith('/auth/google');
      if (!skipCsrf) {
        try {
          const token = await fetchCsrf();
          opts.headers['X-CSRF-Token'] = token;
        } catch {
          // Non-fatal: some backends don't enforce CSRF on all routes
          console.warn('Could not fetch CSRF token — continuing without it');
        }
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, opts);

    if (!response.ok) {
      let errorDetail = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        const errorMessage = typeof errorData === 'object'
          ? (errorData.detail
              ? (Array.isArray(errorData.detail)
                  ? errorData.detail.map(e => e.msg).join(', ')
                  : errorData.detail)
              : JSON.stringify(errorData))
          : errorData;
        errorDetail = errorMessage || errorDetail;
      } catch {
        errorDetail = response.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    // Handle empty responses (e.g. 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true };
    }

    return await response.json();

  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {

  login: async (email, password) => {
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // After login the server sets a session cookie automatically.
    // We cache the user in sessionStorage so App.jsx doesn't need to
    // re-call /me on every page refresh.
    if (data) {
      const u = data.user
        ? data.user
        : {
            id:       data.id       || data._id,
            email:    data.email    || email,
            role:     data.role,
            is_admin: data.is_admin,
            name:     data.name     || data.username,
          };
      sessionStorage.setItem('user', JSON.stringify(u));
      console.log('✓ Login successful, user cached:', u?.email);
    }

    // Reset CSRF cache so next mutating request fetches a fresh token
    _csrf = null;

    return data;
  },

  register: async (userData) => {
    return await apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    try {
      await apiRequest('/logout', { method: 'POST' });
    } finally {
      // Always clear local cache on logout regardless of server response
      sessionStorage.removeItem('user');
      _csrf = null;
      console.log('✓ Logged out — session cache cleared');
    }
  },

  getCurrentUser: async () => {
    // Cookie is sent automatically via credentials: 'include'
    return await apiRequest('/me');
  },

  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Course API
// ─────────────────────────────────────────────────────────────────────────────
export const courseAPI = {
  getCourses: async () => apiRequest('/courses'),

  createCourse: async (courseData) => apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  }),

  updateCourse: async (courseId, courseData) => apiRequest(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  }),

  deleteCourse: async (courseId) => apiRequest(`/courses/${courseId}`, {
    method: 'DELETE',
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Project API
// ─────────────────────────────────────────────────────────────────────────────
export const projectAPI = {
  getProjects: async () => apiRequest('/projects'),

  createProject: async (projectData) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  updateProject: async (projectId, projectData) => apiRequest(`/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  deleteProject: async (projectId) => apiRequest(`/projects/${projectId}`, {
    method: 'DELETE',
  }),

  generateUserProject: async (userId, skills, difficulty) => {
    const safeSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    const payload = { user_id: userId, skills: safeSkills };
    if (difficulty) payload.difficulty = difficulty;
    return await apiRequest('/api/generate-project', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  generateQuiz: async (projectId, userId) => apiRequest('/api/generate-quiz', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, user_id: userId }),
  }),

  submitQuiz: async (quizId, userId, userAnswers) => apiRequest('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({
      quiz_id:      quizId,
      user_id:      userId,
      user_answers: userAnswers,
    }),
  }),

  completeUserProject: async (projectId) => apiRequest(`/api/projects/${projectId}/complete`, {
    method: 'PATCH',
  }),

  getUserProjects: async (userId) => apiRequest(`/api/projects/${userId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin API
// ─────────────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:    async ()         => apiRequest('/admin/stats'),
  getUsers:    async ()         => apiRequest('/admin/users'),
  deleteUser:  async (userId)   => apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
  getCourses:  async ()         => apiRequest('/courses'),
  getProjects: async ()         => apiRequest('/projects'),

  changePassword: async (currentPassword, newPassword) => apiRequest('/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Agent API
// ─────────────────────────────────────────────────────────────────────────────
export const agentAPI = {
  getRecommendation: async () => apiRequest('/agent/recommend'),
};