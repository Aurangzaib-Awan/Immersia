// pages/Talent.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Award, FileText, Mail, Calendar, MapPin } from 'lucide-react';

const Talent = ({ user }) => {
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
 // const  setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockTalents = [
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
          location: "San Francisco, CA",
          availability: "Immediately",
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
          location: "New York, NY",
          availability: "2 weeks notice",
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
          location: "Austin, TX",
          availability: "Immediately",
          isVerified: true
        }
      ];
      setTalents(mockTalents);
      setFilteredTalents(mockTalents);
      setLoading(false);
    }, 1000);
  }, []);

  // Check if user is HR (you'll implement this based on your backend)
  const isHRUser = user && user.email && user.email.endsWith('@company.com'); // Replace with your HR email check

  const handleRecruit = (talentId) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { returnUrl: `/talent#${talentId}` } });
      return;
    }

    if (!isHRUser) {
      alert('Only verified HR professionals can access recruitment features.');
      return;
    }

    // Navigate to talent profile for HR view
    navigate(`/talent/${talentId}`);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = talents.filter(talent => 
      talent.name.toLowerCase().includes(term) ||
      talent.title.toLowerCase().includes(term) ||
      talent.skills.some(skill => skill.toLowerCase().includes(term)) ||
      talent.bio.toLowerCase().includes(term)
    );
    
    setFilteredTalents(filtered);
  };

  //const allSkills = [...new Set(talents.flatMap(talent => talent.skills))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading talent pool...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-surface-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
              Talent Pool
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover verified professionals with certified skills and real-world project experience
            </p>
            
            {/* Search Bar with Flowing Gradient Border */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow max-w-2xl mx-auto mb-8">
              <div className="bg-surface-800 rounded-xl p-2">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search by name, skills, or role..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-4 py-3"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <Users className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{talents.length}+</div>
                <div className="text-gray-400 text-sm">Verified Talents</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <Award className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-gray-400 text-sm">Certifications</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <FileText className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-gray-400 text-sm">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Talent Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTalents.map((talent) => (
            <div key={talent.id} className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <div className="bg-surface-800 rounded-xl p-6 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{talent.name}</h3>
                    <p className="text-sky-400 font-medium">{talent.title}</p>
                  </div>
                  {talent.isVerified && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <Award className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Location & Availability */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{talent.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{talent.availability}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  {talent.bio}
                </p>

                {/* Skills */}
                <div className="mb-6">
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

                {/* Certifications */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Certifications</h4>
                  <div className="space-y-2">
                    {talent.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Award className={`w-4 h-4 ${
                          cert.type === 'course' ? 'text-green-400' : 'text-blue-400'
                        }`} />
                        <span className="text-gray-300">{cert.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
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

                {/* Recruit Button */}
                <button
                  onClick={() => handleRecruit(talent.id)}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {user && isHRUser ? 'View Full Profile' : 'Recruit'}
                </button>

                {/* HR Only Notice */}
                {user && !isHRUser && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Only verified HR can access full profiles
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTalents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No talents found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Talent;