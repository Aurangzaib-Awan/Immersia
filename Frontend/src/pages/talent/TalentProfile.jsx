// pages/TalentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Users, CheckCircle } from 'lucide-react';

const API_BASE = "http://localhost:8000";

const TalentProfile = ({ user }) => {
  const { talentId } = useParams();
  const navigate = useNavigate();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.is_hr) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/talent/${talentId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTalent(data);
      } catch (err) {
        console.error("Failed to fetch talent profile:", err);
        setError("Could not load this talent profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [talentId, user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: `/talent/${talentId}` }} />;
  }

  if (!user.is_hr) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-3">Access Denied</h2>
            <p className="text-[rgb(71,85,105)] mb-4">
              Only verified HR professionals can view full talent profiles.
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
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[rgb(37,99,235)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[rgb(148,163,184)]">Loading talent profile...</p>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-medium mb-4">{error || "Talent not found."}</p>
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

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
      });
    } catch { return iso; }
  };

  const displayName = talent.name || talent.fullname || talent.full_name || 'Anonymous';

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <Link
          to="/talent"
          className="inline-flex items-center gap-2 text-[rgb(37,99,235)] hover:opacity-80 mb-6 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Talent Pool
        </Link>

        <div className="bg-[rgb(37,99,235)]/10 border border-[rgb(37,99,235)]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Users className="w-5 h-5 text-[rgb(37,99,235)] shrink-0" />
          <div>
            <p className="text-[rgb(37,99,235)] font-semibold text-sm">HR Access Enabled</p>
            <p className="text-[rgb(71,85,105)] text-xs mt-0.5">
              You are viewing a full candidate profile with contact information.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile header — no title/position */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {/* ✅ Show proper fullname, no position/title */}
                  <h1 className="text-3xl font-bold text-[rgb(15,23,42)] mb-3">{displayName}</h1>
                  {talent.bio && (
                    <p className="text-[rgb(71,85,105)] leading-relaxed">{talent.bio}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-400/20 shrink-0">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {talent.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[rgb(37,99,235)] shrink-0" />
                    <div>
                      <p className="text-xs text-[rgb(148,163,184)]">Email</p>
                      <p className="text-[rgb(15,23,42)] text-sm">{talent.email}</p>
                    </div>
                  </div>
                )}
                {talent.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[rgb(37,99,235)] shrink-0" />
                    <div>
                      <p className="text-xs text-[rgb(148,163,184)]">Phone</p>
                      <p className="text-[rgb(15,23,42)] text-sm">{talent.phone}</p>
                    </div>
                  </div>
                )}
                {talent.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[rgb(37,99,235)] shrink-0" />
                    <div>
                      <p className="text-xs text-[rgb(148,163,184)]">Location</p>
                      <p className="text-[rgb(15,23,42)] text-sm">{talent.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[rgb(37,99,235)] shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(148,163,184)]">Availability</p>
                    <p className="text-[rgb(15,23,42)] text-sm">{talent.availability || 'Open to opportunities'}</p>
                  </div>
                </div>
              </div>
            </div>

            {talent.experience?.length > 0 && (
              <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
                <h2 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Work Experience</h2>
                <div className="space-y-4">
                  {talent.experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-[rgb(37,99,235)] pl-4">
                      <h3 className="font-semibold text-[rgb(15,23,42)]">{exp.role}</h3>
                      <p className="text-[rgb(37,99,235)] text-sm">{exp.company}</p>
                      <p className="text-[rgb(148,163,184)] text-xs">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {talent.education && (
              <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
                <h2 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">Education</h2>
                <p className="text-[rgb(71,85,105)]">{talent.education}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {talent.expected_salary && (
              <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
                <h3 className="text-base font-bold text-[rgb(15,23,42)] mb-2">Salary Expectations</h3>
                <p className="text-[rgb(37,99,235)] font-semibold">{talent.expected_salary}</p>
              </div>
            )}

            {talent.skills?.length > 0 && (
              <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
                <h3 className="text-base font-bold text-[rgb(15,23,42)] mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-sm text-[rgb(37,99,235)] bg-[rgb(37,99,235)]/10 px-3 py-1.5 rounded-lg border border-[rgb(37,99,235)]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Fixed height scrollable certificates */}
            <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6">
              <h3 className="text-base font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[rgb(37,99,235)]" />
                Earned Certificates ({talent.cert_count})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {talent.certifications.map((cert, i) => (
                  <div key={i} className="border border-[rgb(226,232,240)] rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-[rgb(15,23,42)] font-medium text-sm leading-snug">
                        {cert.project_title}
                      </p>
                    </div>
                    <div className="pl-6 space-y-1">
                      {cert.category && (
                        <p className="text-xs text-[rgb(148,163,184)]">
                          <span className="font-medium text-[rgb(71,85,105)]">Category:</span> {cert.category}
                        </p>
                      )}
                      <p className="text-xs text-[rgb(148,163,184)]">
                        <span className="font-medium text-[rgb(71,85,105)]">Quiz Score:</span>{" "}
                        <span className={cert.quiz_score >= 80 ? "text-green-600 font-semibold" : "text-[rgb(37,99,235)] font-semibold"}>
                          {cert.quiz_score}%
                        </span>
                      </p>
                      <p className="text-xs text-[rgb(148,163,184)]">
                        <span className="font-medium text-[rgb(71,85,105)]">Issued:</span> {formatDate(cert.issued_at)}
                      </p>
                      {cert.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cert.technologies.map((t, ti) => (
                            <span key={ti} className="text-xs bg-[rgb(241,245,249)] text-[rgb(71,85,105)] px-2 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-[rgb(148,163,184)] font-mono mt-1">ID: {cert.certificate_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
export default TalentProfile;