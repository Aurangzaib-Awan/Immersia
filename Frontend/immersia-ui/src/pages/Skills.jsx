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
      // Convert to URL-friendly format
      const careerId = selectedRole.toLowerCase().replace(/\s+/g, '-');
      navigate(`/mindmap?career=${careerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-6">
          Choose a Path
        </h1>
        
        <hr className="border-gray-700 mb-12 max-w-2xl mx-auto" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              onClick={() => handleRoleSelect(role)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === role
                  ? "bg-blue-600 border-blue-500 transform scale-105"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
              }`}
            >
              <h3 className={`text-lg font-semibold text-center ${
                selectedRole === role ? "text-white" : "text-gray-300"
              }`}>
                {role}
              </h3>
            </div>
          ))}
        </div>

        {/* Selected Role Display */}
         {selectedRole && (
      <div className="mt-12 p-6 bg-gray-800 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Selected Path:
        </h3>
        <p className="text-blue-400 text-lg">{selectedRole}</p>
        <button
          onClick={handleContinue} // Use onClick instead of <a>
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Continue as {selectedRole}
        </button>
      </div>
    )}
      </div>
    </div>
  );
}

export default Roadmaps;