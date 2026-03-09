// routes/AppRoutes.jsx
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

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

import { OnboardingProvider } from "./context/OnboardingContext";

// PROJECT-BASED LEARNING
import ProjectsMarketplace from "./pages/projects/ProjectsMarketplace.jsx";
import GenerateProjectPage from "./pages/projects/GenerateProjectPage.jsx";
import ProjectDetail from "./pages/projects/ProjectDetail";
import ProjectWorkspace from "./pages/projects/ProjectWorkspace";
import ProjectSubmission from "./pages/projects/ProjectSubmission";

// COURSE-BASED LEARNING
import CoursesMarketplace from "./pages/courses/CourseMarketplace.jsx";
import CourseDetail from "./pages/courses/CourseDetail.jsx";
import CourseWorkspace from "./pages/courses/CourseWorkspace.jsx";
import Quiz from "./pages/courses/Quiz";
import QuizLauncher from "./components/QuizLauncher";

// ADMIN
import RootLayout from "./pages/admin/RootLayout.jsx";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";


// =========================
// PROTECTED ROUTE
// =========================
const ProtectedRoute = ({ user, children, adminOnly = false }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};


// =========================
// GUEST ONLY ROUTE
// =========================
const GuestOnlyRoute = ({ user, children }) => {
  if (user) {
    if (user.is_admin) return <Navigate to="/admin" replace />;
    if (user.is_hr) return <Navigate to="/talent" replace />;
    if (user.is_mentor) return <Navigate to="/mentor-dashboard" replace />;

    return <Navigate to="/skill" replace />;
  }

  return children;
};


// =========================
// PUBLIC ROUTE
// =========================
const PublicRoute = ({ children }) => {
  return children;
};


// =========================
// APP ROUTES
// =========================
function AppRoutes({ user, setUser }) {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home user={user} />} />

      <Route
        path="/signup"
        element={
          <GuestOnlyRoute user={user}>
            <Signup setUser={setUser} />
          </GuestOnlyRoute>
        }
      />

      <Route
        path="/login"
        element={
          <GuestOnlyRoute user={user}>
            <Login setUser={setUser} />
          </GuestOnlyRoute>
        }
      />


      {/* PROJECT MARKETPLACE */}
      <Route
        path="/projects"
        element={
          <PublicRoute>
            <ProjectsMarketplace user={user} />
          </PublicRoute>
        }
      />

      <Route
        path="/generate-project"
        element={
          <ProtectedRoute user={user}>
            <GenerateProjectPage user={user} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute user={user}>
            <ProjectDetail user={user} />
          </ProtectedRoute>
        }
      />


      {/* COURSES */}
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
          <ProtectedRoute user={user}>
            <CourseDetail user={user} />
          </ProtectedRoute>
        }
      />


      {/* LEARNING */}
      <Route
        path="/learn"
        element={
          <ProtectedRoute user={user}>
            <Learn />
          </ProtectedRoute>
        }
      />


      {/* TALENT */}
      <Route
        path="/talent"
        element={
          <PublicRoute>
            <Talent user={user} />
          </PublicRoute>
        }
      />

      <Route
        path="/talent/:talentId"
        element={
          <ProtectedRoute user={user}>
            <TalentProfile user={user} />
          </ProtectedRoute>
        }
      />


      {/* MENTOR DASHBOARD */}
      <Route
        path="/mentor-dashboard"
        element={
          <ProtectedRoute user={user}>
            <MentorDashboard user={user} />
          </ProtectedRoute>
        }
      />


      {/* ONBOARDING ROUTES */}
      <Route element={<OnboardingProvider />}>
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
      </Route>


      {/* PROJECT WORKSPACE */}
      <Route
        path="/projects/:projectId/workspace"
        element={
          <ProtectedRoute user={user}>
            <ProjectWorkspace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/project-quiz/:projectId"
        element={
          <ProtectedRoute user={user}>
            <QuizLauncher userId={user?.id || user?._id} />
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


      {/* COURSE WORKSPACE */}
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
            <Quiz userId={user?.id || user?._id} />
          </ProtectedRoute>
        }
      />


      {/* ADMIN */}
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


      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default AppRoutes;