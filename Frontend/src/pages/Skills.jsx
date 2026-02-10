import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Roadmaps() {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();
  
  const roles = [
    "ML Engineer",
    "Data Analyst", 
    "NLP Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full-stack Developer",
    "React Developer",
    "Flutter Developer",
    "Cloud Engineer",
    "DevOps Engineer"
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    console.log("Selected role:", role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      const careerId = selectedRole.toLowerCase().replace(/\s+/g, '-');
      navigate(`/mindmap?career=${careerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
            Choose Your Career Path
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select your desired role to explore the learning journey
          </p>
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              onClick={() => handleRoleSelect(role)}
              className={`group relative rounded-xl cursor-pointer transition-all duration-300 ${
                selectedRole === role 
                  ? 'border-2 border-blue-500 transform scale-105 shadow-lg' 
                  : 'border border-blue-400/50 opacity-80 hover:border-blue-400 hover:opacity-100 hover:shadow-md'
              }`}
            >
              <div className={`rounded-xl p-4 sm:p-6 text-center transition-all duration-300 ${
                selectedRole === role 
                  ? 'bg-blue-500/10' 
                  : 'bg-surface-800/80 group-hover:bg-blue-500/5'
              }`}>
                <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${
                  selectedRole === role 
                    ? "text-blue-400" 
                    : "text-gray-300 group-hover:text-blue-300"
                }`}>
                  {role}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Role Display */}
        {selectedRole && (
          <div className="mt-8 sm:mt-12">
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow max-w-2xl mx-auto">
              <div className="bg-surface-800 rounded-xl p-6 sm:p-8 shadow-lg">
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
                  Selected Career Path:
                </h3>
                <div className="text-center mb-6">
                  <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-lg font-semibold border border-blue-500/30">
                    {selectedRole}
                  </span>
                </div>
                <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
                  <button
                    onClick={handleContinue}
                    className="w-full bg-surface-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/10 transition-all duration-300 text-base sm:text-lg"
                  >
                    Continue as {selectedRole}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Roadmaps;