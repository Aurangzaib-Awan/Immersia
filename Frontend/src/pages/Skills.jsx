import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from '../context/OnboardingContext'; //add this for saving context


function Roadmaps() {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();
  const { updateOnboarding } = useOnboarding();


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
      updateOnboarding({ selectedCareer: careerId }); // 👈 save to context
      navigate(`/mindmap?career=${careerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(37,99,235)] mb-4">
            Choose Your Career Path
          </h1>
          <p className="text-[rgb(71,85,105)] text-lg max-w-2xl mx-auto">
            Select your desired role to explore the learning journey
          </p>
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="h-[1px] bg-[rgb(226,232,240)]"></div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              onClick={() => handleRoleSelect(role)}
              className={`group relative rounded-xl cursor-pointer transition-all duration-300 ${selectedRole === role
                  ? 'border-2 border-[rgb(37,99,235)]'
                  : 'border border-[rgb(226,232,240)] hover:border-[rgb(37,99,235)]'
                }`}
            >
              <div className={`rounded-xl p-4 sm:p-6 text-center transition-all duration-300 ${selectedRole === role
                  ? 'bg-blue-50'
                  : 'bg-white group-hover:bg-blue-50/50'
                }`}>
                <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${selectedRole === role
                    ? "text-[rgb(37,99,235)]"
                    : "text-[rgb(71,85,105)] group-hover:text-[rgb(37,99,235)]"
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
            <div className="border border-[rgb(226,232,240)] rounded-xl max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-[rgb(15,23,42)] mb-4 text-center">
                  Selected Career Path:
                </h3>
                <div className="text-center mb-6">
                  <span className="bg-blue-50 text-[rgb(37,99,235)] px-4 py-2 rounded-full text-lg font-semibold border border-[rgb(37,99,235)]/20">
                    {selectedRole}
                  </span>
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full bg-[rgb(37,99,235)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[rgb(29,78,216)] transition-all duration-300 text-base sm:text-lg"
                >
                  Continue as {selectedRole}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Roadmaps;