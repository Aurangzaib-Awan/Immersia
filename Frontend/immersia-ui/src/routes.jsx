// routes/AppRoutes.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Learn from "./pages/Learn.jsx";
import Talent from "./pages/talent/Talent.jsx";
import TalentProfile from "./pages/talent/TalentProfile.jsx";
import Skills from "./pages/Skills.jsx";
import Mindmap from "./pages/MindMap.jsx";
import Divide from "./pages/Divide.jsx";
import MentorDashboard from "./pages/mentorReview/MentorDashboard.jsx"; 

// PROJECT-BASED LEARNING COMPONENTS
import ProjectsMarketplace from "./pages/projects/ProjectsMarketplace.jsx";
import ProjectDetail from "./pages/projects/ProjectDetail";
import ProjectWorkspace from "./pages/projects/ProjectWorkspace";
import ProjectSubmission from "./pages/projects/ProjectSubmission";

// COURSE-BASED LEARNING COMPONENTS
import CoursesMarketplace from "./pages/courses/CourseMarketplace.jsx";
import CourseDetail from "./pages/courses/CourseDetail.jsx";
import CourseWorkspace from "./pages/courses/CourseWorkspace.jsx";
import Quiz from "./pages/courses/Quiz";

// Admin Components
import RootLayout from "./pages/admin/RootLayout.jsx";
import Dashboard from "./pages/admin//Dashboard";
import UserManagement from "./pages/admin//UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";

// Protected Route Components
const ProtectedRoute = ({ user, children, adminOnly = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component - Allows access without authentication
const PublicRoute = ({ children }) => {
  return children;
};

function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      
      {/* Public Project Routes - Accessible without login */}
      <Route 
        path="/projects" 
        element={
          <PublicRoute>
            <ProjectsMarketplace user={user} />
          </PublicRoute>
        } 
      />
      <Route 
        path="/projects/:projectId" 
        element={
          <PublicRoute>
            <ProjectDetail user={user} />
          </PublicRoute>
        } 
      />
      
      {/* Public Course Routes - Accessible without login */}
      <Route 
        path="/courses" 
        element={
          <PublicRoute>
            <CoursesMarketplace user={user} />
          </PublicRoute>
        } 
      />
      <Route 
        path="/courses/:courseId" 
        element={
          <PublicRoute>
            <CourseDetail user={user} />
          </PublicRoute>
        } 
      />
      
      {/* === FIXED: Single Talent Route === */}
      <Route 
        path="/talent" 
        element={
          <PublicRoute>
            <Talent user={user} />
          </PublicRoute>
        } 
      />
      
      {/* Protected Talent Profile Route for HR */}
      <Route 
        path="/talent/:talentId" 
        element={
          <ProtectedRoute user={user}>
            <TalentProfile user={user} />
          </ProtectedRoute>
        } 
      />
      <Route 
  path="/mentor-dashboard" 
  element={
    <ProtectedRoute user={user}>
      <MentorDashboard user={user} />
    </ProtectedRoute>
  } 
/>
      {/* User Routes - Protected but not admin only */}
      <Route 
        path="/learn" 
        element={
          <ProtectedRoute user={user}>
            <Learn />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/skill" 
        element={
          <ProtectedRoute user={user}>
            <Skills />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mindmap" 
        element={
          <ProtectedRoute user={user}>
            <Mindmap />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/divide" 
        element={
          <ProtectedRoute user={user}>
            <Divide />
          </ProtectedRoute>
        } 
      />
      
      {/* PROTECTED Project Workspace Routes - Require authentication */}
      <Route 
        path="/projects/:projectId/workspace" 
        element={
          <ProtectedRoute user={user}>
            <ProjectWorkspace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:projectId/submit" 
        element={
          <ProtectedRoute user={user}>
            <ProjectSubmission />
          </ProtectedRoute>
        } 
      />
      
      {/* PROTECTED Course Workspace Routes - Require authentication */}
      <Route 
        path="/courses/:courseId/workspace" 
        element={
          <ProtectedRoute user={user}>
            <CourseWorkspace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses/:courseId/quiz" 
        element={
          <ProtectedRoute user={user}>
            <Quiz />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes - Protected and admin only */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute user={user} adminOnly={true}>
            <RootLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="learningContent" element={<ContentManagement />} />
        <Route path="projects" element={<ProjectManagement />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;