import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, Award, FileText, Mail, Calendar, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Talent = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTalent, setSelectedTalent] = useState(null);

  // Static talent data
  const talents = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Full Stack Developer",
      bio: "Passionate developer with 3+ years of experience in React, Node.js, and cloud technologies. Completed 5 certified courses and 12 real-world projects.",
      skills: ["React", "Node.js", "MongoDB", "AWS", "TypeScript"],
      certifications: [
        { name: "Advanced React Development", type: "course" },
        { name: "Cloud Architecture", type: "course" },
        { name: "E-commerce Platform", type: "project" }
      ],
      isVerified: true
    },
    {
      id: 2,
      name: "Mike Chen",
      title: "Data Scientist",
      bio: "Data scientist specializing in machine learning and predictive analytics. Strong background in Python, TensorFlow, and data visualization.",
      skills: ["Python", "TensorFlow", "SQL", "Data Analysis", "Machine Learning"],
      certifications: [
        { name: "Machine Learning Specialist", type: "course" },
        { name: "Data Analytics Master", type: "course" },
        { name: "Fraud Detection System", type: "project" }
      ],
      isVerified: true
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "UX/UI Designer",
      bio: "Creative designer focused on creating intuitive user experiences. Expertise in user research, prototyping, and design systems.",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Adobe Creative Suite"],
      certifications: [
        { name: "UX Design Professional", type: "course" },
        { name: "Mobile App Design", type: "project" },
        { name: "Design System Implementation", type: "project" }
      ],

      isVerified: true
    }
  ];

   const handleLogin = () => {
        navigate('/login', { state: { from: location } });
    };

     const handleRecruit = async () => {
    if (!selectedTalent) {
        alert('Please select a talent first by clicking on their profile');
        return;
    }

    if (!user) {
        navigate('/login', { state: { from: location } });
        return;
    }

    // Check if user is HR using the role from your login system
    if (!user.is_hr) {
        alert('Only verified HR professionals can access recruitment features. Please contact admin to verify your HR email.');
        return;
    }

    // Navigate to talent profile for HR view
    navigate(`/talent/${selectedTalent.id}`);
  };

  const filteredTalents = talents.filter(talent => 
    talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    talent.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

 return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white">
    {/* Header Section */}
    <div className="bg-surface-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Bar with Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          {/* Title Section - Centered */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
              Talent Pool
            </h1>
            <p className="text-xl text-gray-300">
              Discover verified professionals with certified skills and real-world project experience
            </p>
          </div>

          {/* Buttons - Top Right Corner */}
          <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
            <div className="w-fit p-4 rounded-3xl bg-gray-800 shadow-2xl flex flex-col space-y-4 items-center">
              {/* Login Button with Flowing Gradient Border */}
              <div className="relative p-[2px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
                <button 
                  onClick={handleLogin}
                  className="w-full min-w-[160px] rounded-full py-2 px-6 text-white text-base font-semibold bg-surface-800 hover:bg-gray-700 transition-colors"
                >
                  Login
                </button>
              </div>

              {/* Recruit Button with Flowing Gradient Border */}
              <div className="relative p-[2px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
                <button 
                  onClick={handleRecruit}
                  className="w-full min-w-[160px] rounded-full py-2 px-6 text-white text-base font-semibold bg-surface-800 hover:bg-gray-700 transition-colors"
                >
                  Recruit
                </button>
              </div>
            </div>
          </div>
        </div>

{/* Enhanced Search Bar - Full Width */}
<div className="w-full px-6">
  <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full">
    <div className="bg-surface-800 rounded-xl p-2">
      <div className="flex items-center">
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="Search by name, skills, role, bio, or certifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-4 py-2 text-base"
        />
        {/* Search Icon on the right when typing */}
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="p-1 text-gray-400 hover:text-white transition-colors mr-2"
          >
             ✕
          </button>
        )}
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
    

    {/* Horizontal Talent Cards - Centered */}
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="space-y-6">
        {filteredTalents.map((talent) => (
          <div 
            key={talent.id} 
            className={`relative p-[2px] rounded-xl cursor-pointer transition-all duration-300 ${
              selectedTalent?.id === talent.id ? 'ring-2 ring-sky-400 scale-[1.02]' : ''
            }`}
            onClick={() => setSelectedTalent(talent)}
          >
            <div className="bg-surface-800 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Section - Basic Info & Skills */}
                <div className="flex-1 min-w-0">
                  {/* Header with proper alignment */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{talent.name}</h3>
                        {talent.isVerified && (
                          <div className="flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full border border-green-400/20">
                            <Award className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sky-400 font-medium">{talent.title}</p>
                    </div>
                   
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {talent.bio}
                  </p>

                  {/* Skills */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section - Certifications */}
                <div className="lg:w-80 xl:w-96 flex-shrink-0">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-sky-400" />
                      Certifications & Projects
                    </h4>
                    <div className="space-y-3">
                      {talent.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <Award className={`w-4 h-4 flex-shrink-0 ${
                            cert.type === 'course' ? 'text-green-400' : 'text-blue-400'
                          }`} />
                          <span className="text-gray-300 flex-1 truncate">{cert.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                            cert.type === 'course' 
                              ? 'bg-green-500/20 text-green-400 border border-green-400/20'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-400/20'
                          }`}>
                            {cert.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedTalent?.id === talent.id && (
                    <div className="mt-3 text-sky-400 text-sm font-medium flex items-center gap-2 justify-end">
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                      Selected for recruitment
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Centered */}
      {filteredTalents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No talents found</h3>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Instructions - Centered */}
      {filteredTalents.length > 0 && (
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Click on a talent profile to select, then click "Recruit" to view full details</p>
          <p className="mt-1">Full profiles are only accessible to verified HR professionals</p>
        </div>
      )}
    </div>
  </div>
);
};

export default Talent;