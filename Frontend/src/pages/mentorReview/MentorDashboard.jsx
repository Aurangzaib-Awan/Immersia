import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  ExternalLink
} from "lucide-react";

const MentorDashboard = () => {
  // Mock data - replace with API calls
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-commerce Platform",
      studentName: "John Doe",
      submittedDate: "2024-01-15",
      status: "pending",
      description: "Full-stack e-commerce platform with React and Node.js",
      techStack: ["React", "Node.js", "MongoDB"],
      githubLink: "https://github.com/johndoe/ecommerce",
      liveLink: "https://ecommerce-demo.com"
    },
    {
      id: 2,
      title: "Task Management App",
      studentName: "Jane Smith",
      submittedDate: "2024-01-14",
      status: "approved",
      description: "Task management application with drag-and-drop functionality",
      techStack: ["Vue.js", "Express", "PostgreSQL"],
      githubLink: "https://github.com/janesmith/taskapp",
      liveLink: "https://taskapp-demo.com"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      studentName: "Bob Johnson",
      submittedDate: "2024-01-13",
      status: "rejected",
      description: "Real-time weather dashboard with multiple APIs",
      techStack: ["React", "Python", "Redis"],
      githubLink: "https://github.com/bobjohnson/weather",
      liveLink: "https://weather-demo.com"
    },
    {
      id: 4,
      title: "Fitness Tracker",
      studentName: "Alice Brown",
      submittedDate: "2024-01-12",
      status: "pending",
      description: "Mobile fitness tracking app with workout plans",
      techStack: ["React Native", "Firebase"],
      githubLink: "https://github.com/alicebrown/fitness",
      liveLink: "https://fitness-demo.com"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use useMemo instead of useEffect to compute filtered projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(project => project.status === statusFilter);
    }

    return result;
  }, [projects, searchTerm, statusFilter]);

  // Handler functions
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    // On mobile, open sidebar when project is selected
    if (window.innerWidth < 768) {
      setSidebarOpen(true);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      // API call to approve project
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: "approved" } : p
      ));
      setSelectedProject(prev => prev ? { ...prev, status: "approved" } : null);
    } catch (error) {
      console.error("Failed to approve project:", error);
    }
  };

  const handleReject = async (projectId) => {
    try {
      // API call to reject project
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: "rejected" } : p
      ));
      setSelectedProject(prev => prev ? { ...prev, status: "rejected" } : null);
    } catch (error) {
      console.error("Failed to reject project:", error);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
    
    switch(status) {
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-500/10 text-yellow-500 border-yellow-500/20`}>
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-500/10 text-green-500 border-green-500/20`}>
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-500/10 text-red-500 border-red-500/20`}>
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Tech stack badge component
  const TechBadge = ({ tech }) => (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
      {tech}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900">
      {/* Add the gradient animation keyframes */}
      <style jsx>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-flow {
          animation: gradient-flow 3s ease infinite;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {/* Flowing Gradient Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-1">
                Mentor Dashboard
              </h1>
              <p className="text-gray-400 text-sm">Review and evaluate student projects</p>
            </div>
            
            {/* Rounded Search Bar with Gradient Border */}
            <div className="relative w-full sm:w-72">
              {/* Moving Gradient Border for Search */}
              <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full">
                <div className="relative bg-gray-800 rounded-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 bg-transparent border-0 text-white w-full rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
          {/* Left Column - Project List */}
          <div className="lg:w-1/3 flex flex-col h-full">
            {/* Filter Tabs */}
            <div className="mb-4">
              <div className="inline-flex rounded-lg bg-gray-800 p-1">
                <button
                  onClick={() => handleStatusFilter("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    statusFilter === "all" 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => handleStatusFilter("pending")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                    statusFilter === "pending" 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-3 h-3 mr-2" />
                  Pending ({projects.filter(p => p.status === "pending").length})
                </button>
                <button
                  onClick={() => handleStatusFilter("reviewed")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                    statusFilter === "reviewed" 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Reviewed ({projects.filter(p => p.status !== "pending").length})
                </button>
              </div>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] rounded-lg border ${
                      selectedProject?.id === project.id 
                        ? "ring-2 ring-blue-500 bg-gray-800/50 border-gray-700" 
                        : "bg-gray-800/30 border-gray-800 hover:bg-gray-800/50"
                    }`}
                    onClick={() => handleSelectProject(project)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white line-clamp-1">
                          {project.title}
                        </h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {project.studentName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(project.submittedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No projects found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Project Details (Sidebar) */}
          <div className="lg:w-2/3 h-full">
            <div className="bg-surface-800/50 rounded-xl border border-gray-800 h-full overflow-hidden flex flex-col">
              {selectedProject ? (
                <>
                  {/* Sidebar Header */}
                  <div className="p-6 border-b border-gray-800 flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-xl font-bold text-white">
                            {selectedProject.title}
                          </h2>
                          {getStatusBadge(selectedProject.status)}
                        </div>
                        <p className="text-gray-400">
                          Submitted by {selectedProject.studentName} • {new Date(selectedProject.submittedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Project Description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300 bg-gray-800/30 rounded-lg p-4">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.techStack.map((tech, index) => (
                          <TechBadge key={index} tech={tech} />
                        ))}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Project Links</h3>
                      <div className="space-y-3">
                        <a
                          href={selectedProject.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">GitHub Repository</p>
                            <p className="text-gray-400 text-sm truncate max-w-xs">
                              {selectedProject.githubLink}
                            </p>
                          </div>
                          <ExternalLink className="ml-auto w-4 h-4 text-gray-400" />
                        </a>

                        <a
                          href={selectedProject.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800">
                            <ExternalLink className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Live Demo</p>
                            <p className="text-gray-400 text-sm truncate max-w-xs">
                              {selectedProject.liveLink}
                            </p>
                          </div>
                          <ExternalLink className="ml-auto w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                    </div>

                    {/* Review Actions - Only show for pending projects */}
                    {selectedProject.status === "pending" && (
                      <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Review Actions</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(selectedProject.id)}
                            className="flex-1 py-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Request Changes
                          </Button>
                          <Button
                            onClick={() => handleApprove(selectedProject.id)}
                            className="flex-1 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve Project
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <Eye className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    Select a Project
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Choose a project from the list to view details and perform reviews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full sm:w-3/4 bg-surface-900 shadow-xl">
            {/* Mobile sidebar content goes here - same as desktop sidebar */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;