// pages/TalentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, FileText, Users, Download } from 'lucide-react';

const TalentProfile = ({ user }) => {
  const { talentId } = useParams();
  const navigate = useNavigate();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Move ALL hooks to the top, before any conditional returns
  useEffect(() => {
    // Only fetch data if user is HR
    if (user && user.is_hr) {
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockTalent = {
          id: talentId,
          name: "Sarah Johnson",
          title: "Full Stack Developer",
          email: "sarah.johnson@email.com",
          phone: "+1 (555) 123-4567",
          bio: "Passionate developer with 3+ years of experience in React, Node.js, and cloud technologies. Completed 5 certified courses and 12 real-world projects.",
          skills: ["React", "Node.js", "MongoDB", "AWS", "TypeScript", "Docker", "Git"],
          certifications: [
            { name: "Advanced React Development", type: "course", date: "2024-01-15" },
            { name: "Cloud Architecture", type: "course", date: "2024-02-20" },
            { name: "E-commerce Platform", type: "project", date: "2024-03-10" }
          ],
          experience: [
            { role: "Senior Developer", company: "Tech Corp", duration: "2 years" },
            { role: "Full Stack Developer", company: "Startup Inc", duration: "1 year" }
          ],
          education: "BS Computer Science - Stanford University",
          location: "San Francisco, CA",
          availability: "Immediately",
          expectedSalary: "$120,000 - $140,000",
          resumeUrl: "#", // URL to download resume
          isVerified: true
        };
        setTalent(mockTalent);
        setLoading(false);
      }, 1000);
    } else {
      // Use setTimeout to make setLoading asynchronous
      const timer = setTimeout(() => {
        setLoading(false);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [talentId, user]); // Add user to dependencies

  // Now do conditional returns AFTER all hooks
  if (!user) {
    return <Navigate to="/login" state={{ from: `/talent/${talentId}` }} />;
  }

  if (!user.is_hr) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
            <p className="text-[rgb(71,85,105)] mb-4">
              Only verified HR professionals can view talent profiles. 
              Your email ({user.email}) doesn't have HR privileges.
            </p>
            <button 
              onClick={() => navigate('/talent')}
              className="bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Talent Pool
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[rgb(71,85,105)] text-lg">Loading talent profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link 
          to="/talent"
          className="inline-flex items-center gap-2 text-[rgb(37,99,235)] hover:text-[rgb(37,99,235)] mb-6 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Talent Pool
        </Link>

        {/* HR Only Notice */}
        <div className="bg-[rgb(37,99,235)]/10 border border-sky-400/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-[rgb(37,99,235)]">
            <Users className="w-5 h-5" />
            <span className="font-semibold">HR Access Enabled</span>
          </div>
          <p className="text-[rgb(71,85,105)] text-sm mt-1">
            You are viewing full candidate profile with contact information and resume access.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div className="relative border border-[rgb(226,232,240)] rounded-xl">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-[rgb(15,23,42)] mb-2">{talent.name}</h1>
                    <p className="text-xl text-[rgb(37,99,235)] font-medium mb-4">{talent.title}</p>
                    <p className="text-[rgb(71,85,105)] leading-relaxed">{talent.bio}</p>
                  </div>
                  {talent.isVerified && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-500/10 px-3 py-1 rounded-full border border-green-400/20">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[rgb(37,99,235)]" />
                  <div>
                    <div className="text-sm text-[rgb(148,163,184)]">Email</div>
                    <div className="text-[rgb(15,23,42)]">{talent.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[rgb(37,99,235)]" />
                  <div>
                    <div className="text-sm text-[rgb(148,163,184)]">Phone</div>
                    <div className="text-[rgb(15,23,42)]">{talent.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[rgb(37,99,235)]" />
                  <div>
                    <div className="text-sm text-[rgb(148,163,184)]">Location</div>
                    <div className="text-[rgb(15,23,42)]">{talent.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[rgb(37,99,235)]" />
                  <div>
                    <div className="text-sm text-[rgb(148,163,184)]">Availability</div>
                    <div className="text-[rgb(15,23,42)]">{talent.availability}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">Work Experience</h2>
              <div className="space-y-4">
                {talent.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-sky-400 pl-4">
                    <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">{exp.role}</h3>
                    <p className="text-[rgb(37,99,235)]">{exp.company}</p>
                    <p className="text-[rgb(148,163,184)] text-sm">{exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume Download */}
            <div className="relative border border-[rgb(226,232,240)] rounded-xl">
              <div className="bg-white rounded-xl p-6">
                <button className="w-full bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Resume
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-sm text-[rgb(37,99,235)] bg-[rgb(37,99,235)]/10 px-3 py-2 rounded-lg border border-[rgb(37,99,235)]/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Certifications</h3>
              <div className="space-y-3">
                {talent.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Award className={`w-5 h-5 ${
                      cert.type === 'course' ? 'text-green-600' : 'text-blue-400'
                    }`} />
                    <div>
                      <div className="text-[rgb(15,23,42)] text-sm font-medium">{cert.name}</div>
                      <div className="text-[rgb(148,163,184)] text-xs">{cert.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Expectations */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">Salary Expectations</h3>
              <p className="text-[rgb(37,99,235)] font-semibold">{talent.expectedSalary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;