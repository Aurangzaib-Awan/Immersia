import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, FileText, Users, Mail } from 'lucide-react';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const topCompanies = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix",
    "Apple", "Tesla", "Spotify", "Uber", "Airbnb"
  ];

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] font-sans">
      {/* Navigation */}
      <nav className="bg-white py-4 px-4 sm:px-6 border-b border-[rgb(226,232,240)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Title */}
          <div className="flex justify-center lg:justify-start">
            <h1 className="text-2xl lg:text-4xl font-bold text-center lg:text-left text-[rgb(37,99,235)]">
              <span className="lg:hidden">I</span>
              <span className="hidden lg:inline">Immersia.</span>
            </h1>
          </div>
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            <Link to="/courses" className="text-[rgb(71,85,105)] hover:text-[rgb(37,99,235)] font-medium transition-colors duration-300">Courses</Link>
            <Link to="/projects" className="text-[rgb(71,85,105)] hover:text-[rgb(37,99,235)] font-medium transition-colors duration-300">Projects</Link>
            <Link to="/talent" className="text-[rgb(71,85,105)] hover:text-[rgb(37,99,235)] font-medium transition-colors duration-300">Talent</Link>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/skill" className="text-[rgb(71,85,105)] hover:text-[rgb(37,99,235)] font-medium transition-colors duration-300">Dashboard</Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-[rgb(37,99,235)] text-white flex items-center justify-center text-sm font-bold">
                      {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>
                  {/* Profile Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[rgb(226,232,240)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-[rgb(226,232,240)]">
                      <p className="text-[rgb(15,23,42)] font-semibold text-sm">{user.fullname || 'User'}</p>
                      <p className="text-[rgb(148,163,184)] text-xs mt-1">{user.email || ''}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/skill" className="block px-3 py-2 text-sm text-[rgb(71,85,105)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors">Dashboard</Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.location.reload();
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-[rgb(71,85,105)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-[rgb(37,99,235)]/10 backdrop-blur-sm text-[rgb(37,99,235)] px-6 py-2 rounded-lg font-semibold hover:bg-[rgb(37,99,235)]/20 transition-all duration-300 border border-[rgb(37,99,235)]/20"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Register Modal with Blur Background */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRegisterModal(false)}></div>
          <div className="relative bg-white rounded-2xl border border-[rgb(226,232,240)] p-8 w-full max-w-sm mx-4 z-10">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-3 right-3 text-[rgb(148,163,184)] hover:text-[rgb(15,23,42)] transition-colors text-xl font-bold"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[rgb(37,99,235)] mb-2">Join Immersia</h2>
              <p className="text-[rgb(148,163,184)] text-sm">Create an account or sign in to continue</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { setShowRegisterModal(false); navigate('/login'); }}
                className="w-full py-3 px-6 rounded-lg font-bold text-[rgb(15,23,42)] bg-[rgb(241,245,249)] hover:bg-[rgb(226,232,240)] transition-colors duration-300 text-base"
              >
                Login
              </button>
              <button
                onClick={() => { setShowRegisterModal(false); navigate('/signup'); }}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] transition-colors duration-300 text-base"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Learning Hero Section */}
      <section className="relative bg-[rgb(248,250,252)] py-20 sm:py-28 px-4 sm:px-6 border-b border-[rgb(226,232,240)]">
        <div className="max-w-7xl mx-auto text-center">
          {/* Master Your Skills */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-[rgb(37,99,235)] mb-6">
            Master In-Demand Skills
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-[rgb(71,85,105)] mb-8 max-w-4xl mx-auto leading-relaxed">
            Learn from Industry Experts, Build Real Projects
          </p>
          <p className="text-lg sm:text-xl text-[rgb(148,163,184)] mb-12 max-w-3xl mx-auto leading-relaxed">
            Choose your learning journey: master concepts through structured courses,
            or dive into real-world projects. Get certified, evaluated by industry experts,
            and discovered by top companies.
          </p>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section id="paths" className="py-16 sm:py-20 px-4 sm:px-6 bg-[rgb(248,250,252)]">
        <div className="max-w-7xl mx-auto">
          {/* Two Powerful Learning Paths */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[rgb(37,99,235)] mb-12">
            Choose Your Learning Path
          </h2>
          <p className="text-lg sm:text-xl text-[rgb(148,163,184)] text-center mb-12 max-w-3xl mx-auto">
            Whether you prefer structured learning or hands-on projects, we have the perfect path for your growth.
          </p>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Structured Learning Path */}
            <div className="group relative border border-[rgb(226,232,240)] rounded-xl">
              <div className="bg-white rounded-xl p-6 sm:p-8 h-full">
                <h3 className="text-2xl font-bold text-[rgb(15,23,42)] mb-6">
                  Skill-Based Courses
                </h3>
                <p className="text-[rgb(148,163,184)] mb-8 leading-relaxed">
                  Master concepts step by step with guided courses and comprehensive curriculum.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Curated curriculum from industry experts</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Interactive courses with video lessons</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Comprehensive quizzes and assessments</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Earn recognized certifications & badges</span>
                  </div>
                </div>

                {/* Button */}
                <Link
                  to="/courses"
                  className="block w-full bg-[rgb(37,99,235)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[rgb(29,78,216)] transition-colors duration-300 text-center"
                >
                  Explore Courses →
                </Link>
              </div>
            </div>

            {/* Applied Learning */}
            <div className="group relative border border-[rgb(226,232,240)] rounded-xl">
              <div className="bg-white rounded-xl p-6 sm:p-8 h-full">
                <h3 className="text-2xl font-bold text-[rgb(15,23,42)] mb-6">
                  Project-Based Learning
                </h3>
                <p className="text-[rgb(148,163,184)] mb-8 leading-relaxed">
                  Learn by doing. Take on real-world projects and build your portfolio with hands-on experience.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Hands-on projects with real challenges</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Mentorship from industry practitioners</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Expert evaluation & constructive feedback</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-[rgb(71,85,105)]">Verified portfolio for recruiters</span>
                  </div>
                </div>

                {/* Button */}
                <Link
                  to="/projects"
                  className="block w-full bg-[rgb(37,99,235)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[rgb(29,78,216)] transition-colors duration-300 text-center"
                >
                  Browse Projects →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Talent Pool Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[rgb(241,245,249)]">
        <div className="max-w-7xl mx-auto">
          {/* Discover Verified Talent */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[rgb(37,99,235)] mb-12">
            Discover Verified Talent
          </h2>
          <p className="text-lg sm:text-xl text-[rgb(148,163,184)] text-center mb-12 max-w-3xl mx-auto">
            Connect with skilled professionals who have proven their expertise through certified courses
            and real-world project experience.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 border border-[rgb(226,232,240)] text-center">
              <Award className="w-12 h-12 text-[rgb(37,99,235)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">Verified Skills</h3>
              <p className="text-[rgb(148,163,184)] text-sm">
                Every talent is certified through our rigorous assessment process
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 border border-[rgb(226,232,240)] text-center">
              <FileText className="w-12 h-12 text-[rgb(37,99,235)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">Project Portfolio</h3>
              <p className="text-[rgb(148,163,184)] text-sm">
                Real-world project experience with expert evaluations
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 border border-[rgb(226,232,240)] text-center">
              <Users className="w-12 h-12 text-[rgb(37,99,235)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">HR Access</h3>
              <p className="text-[rgb(148,163,184)] text-sm">
                Exclusive access for verified HR professionals
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 border border-[rgb(226,232,240)] text-center">
              <Mail className="w-12 h-12 text-[rgb(37,99,235)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">Direct Recruitment</h3>
              <p className="text-[rgb(148,163,184)] text-sm">
                Connect directly with pre-vetted candidates
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* For Job Seekers */}
            <Link
              to="/signup"
              className="block bg-[rgb(37,99,235)] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[rgb(29,78,216)] transition-all duration-300 min-w-[200px] text-center"
            >
              Join Talent Pool
            </Link>

            {/* For HR */}
            <Link
              to="/talent"
              className="block bg-white text-[rgb(37,99,235)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[rgb(241,245,249)] transition-all duration-300 border border-[rgb(226,232,240)] min-w-[200px] text-center"
            >
              Browse Talent
            </Link>
          </div>

          {/* HR Notice */}
          <div className="text-center mt-8">
            <p className="text-[rgb(148,163,184)] text-sm">
              HR professionals: Verify your company email to access full candidate profiles
            </p>
          </div>
        </div>
      </section>

      {/* Expert Review Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(37,99,235)] mb-6">
                Expert Review
              </h2>
              <h3 className="text-xl sm:text-2xl font-semibold text-[rgb(71,85,105)] mb-6">
                Get Feedback from Industry Specialists
              </h3>
              <p className="text-[rgb(148,163,184)] mb-8 leading-relaxed">
                Submit your completed projects for evaluation by experienced industry
                professionals who know best practices inside and out.
              </p>

              <div className="space-y-6">
                <div className="bg-[rgb(241,245,249)] rounded-lg p-4 border border-[rgb(226,232,240)]">
                  <h4 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">
                    Professional Assessment
                  </h4>
                  <p className="text-[rgb(148,163,184)]">
                    Detailed feedback on code quality and practices
                  </p>
                </div>
                <div className="bg-[rgb(241,245,249)] rounded-lg p-4 border border-[rgb(226,232,240)]">
                  <h4 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">
                    Recognition
                  </h4>
                  <p className="text-[rgb(148,163,184)]">
                    Earn verified badges for successfully completed reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="border border-[rgb(226,232,240)] rounded-xl">
              <div className="bg-white rounded-xl p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-[rgb(37,99,235)] mb-6">
                  Get Discovered by Top Companies
                </h3>
                <p className="text-[rgb(148,163,184)] leading-relaxed mb-8">
                  Complete your learning journey and join our verified talent marketplace
                  where leading recruiters find exceptional developers.
                </p>

                {/* Top Companies Grid */}
                <div className="border border-[rgb(226,232,240)] rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4 bg-[rgb(248,250,252)] rounded-lg">
                    {topCompanies.map((company, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 text-center hover:bg-[rgb(241,245,249)] transition-all duration-300 border border-[rgb(226,232,240)]"
                      >
                        <span className="text-[rgb(15,23,42)] text-sm font-medium">{company}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[rgb(248,250,252)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(37,99,235)] mb-8">
            Ready to Master New Skills?
          </h2>
          <p className="text-lg sm:text-xl text-[rgb(148,163,184)] mb-12 max-w-2xl mx-auto">
            Join thousands of learners building their careers with Immersia.
          </p>

          <div className="h-[1px] bg-[rgb(226,232,240)] mb-12 max-w-2xl mx-auto"></div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 sm:mb-20">
            {/* Get Started Free Button */}
            <Link
              to="/signup"
              className="block bg-[rgb(37,99,235)] text-white px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[rgb(29,78,216)] transition-all duration-300"
            >
              Get Started Free
            </Link>

            {/* Explore Courses Button */}
            <Link
              to="/courses"
              className="block bg-white text-[rgb(37,99,235)] px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[rgb(241,245,249)] transition-all duration-300 border border-[rgb(226,232,240)]"
            >
              Browse Courses
            </Link>
          </div>

          {/* Footer */}
          <footer className="border-t border-[rgb(226,232,240)] pt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold text-[rgb(15,23,42)] mb-4">Learning</h4>
                <ul className="space-y-2 text-[rgb(148,163,184)]">
                  <li><Link to="/courses" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Courses</Link></li>
                  <li><Link to="/projects" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Projects</Link></li>
                  <li><Link to="/skill" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Skills</Link></li>
                  <li><Link to="/talent" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Talent</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[rgb(15,23,42)] mb-4">Company</h4>
                <ul className="space-y-2 text-[rgb(148,163,184)]">
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">About</a></li>
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Blog</a></li>
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[rgb(15,23,42)] mb-4">Legal</h4>
                <ul className="space-y-2 text-[rgb(148,163,184)]">
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Privacy</a></li>
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Terms</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[rgb(15,23,42)] mb-4">Connect</h4>
                <ul className="space-y-2 text-[rgb(148,163,184)]">
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">Twitter</a></li>
                  <li><a href="#" className="hover:text-[rgb(37,99,235)] transition-colors duration-300">LinkedIn</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[rgb(226,232,240)]">
              <p className="text-[rgb(148,163,184)] text-sm sm:text-base">
                © 2025 Immersia. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default Home;