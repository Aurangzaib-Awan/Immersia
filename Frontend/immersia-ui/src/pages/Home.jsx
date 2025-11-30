import React from 'react';
import { Link } from 'react-router-dom';
import { Award, FileText, Users, Mail } from 'lucide-react';

const Home = () => {
  const topCompanies = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix", 
    "Apple", "Tesla", "Spotify", "Uber", "Airbnb"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white font-sans">
      {/* Navigation */}
      <nav className="bg-surface-800/95 backdrop-blur-sm shadow-2xl py-4 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Animated Title */}
          <div className="flex justify-center lg:justify-start">
            <h1 className="text-2xl lg:text-4xl font-bold text-center lg:text-left bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
              <span className="lg:hidden">I</span>
              <span className="hidden lg:inline">Immersia.</span>
            </h1>
          </div>
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            <Link to="/courses" className="text-gray-300 hover:text-sky-400 font-medium transition-colors duration-300">Courses</Link>
            <Link to="/projects" className="text-gray-300 hover:text-sky-400 font-medium transition-colors duration-300">Projects</Link>
            <Link to="/talent" className="text-gray-300 hover:text-sky-400 font-medium transition-colors duration-300">Talent</Link>
            {/* Get Started Button - Flowing Border Glow */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <Link to="/signup" className="block bg-surface-800 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-700 transition-colors duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Skill Learning Hero Section */}
      <section className="relative bg-gradient-to-br from-surface-900 to-gray-900 py-20 sm:py-28 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          {/* Master Your Skills - Animated Gradient Text - Centered */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-6">
            Master In-Demand Skills
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Learn from Industry Experts, Build Real Projects
          </p>
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Choose your learning journey: master concepts through structured courses, 
            or dive into real-world projects. Get certified, evaluated by industry experts, 
            and discovered by top companies.
          </p>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section id="paths" className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-900 to-surface-900">
        <div className="max-w-7xl mx-auto">
          {/* Two Powerful Learning Paths - Flow Gradient Typography */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-12">
            Choose Your Learning Path
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Whether you prefer structured learning or hands-on projects, we have the perfect path for your growth.
          </p>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Structured Learning Path - Fixed Smooth Animation */}
            <div className="group relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <div className="bg-surface-800 rounded-xl p-6 sm:p-8 h-full">
                {/* Structured Learning Path - Flow Gradient Typography */}
                <h3 className="text-2xl font-bold text-white mb-6">
                  Skill-Based Courses
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Master concepts step by step with guided courses and comprehensive curriculum.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Curated curriculum from industry experts</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Interactive courses with video lessons</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Comprehensive quizzes and assessments</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Earn recognized certifications & badges</span>
                  </div>
                </div>

                {/* Button with Flowing Border Glow */}
                <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
                  <Link 
                    to="/courses"
                    className="block w-full bg-surface-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300 text-center"
                  >
                    Explore Courses →
                  </Link>
                </div>
              </div>
            </div>

            {/* Applied Learning - Fixed Smooth Animation */}
            <div className="group relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <div className="bg-surface-800 rounded-xl p-6 sm:p-8 h-full">
                {/* Applied Learning - Flow Gradient Typography */}
                <h3 className="text-2xl font-bold text-white mb-6">
                  Project-Based Learning
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Learn by doing. Take on real-world projects and build your portfolio with hands-on experience.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Hands-on projects with real challenges</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Mentorship from industry practitioners</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Expert evaluation & constructive feedback</span>
                  </div>
                  <div className="flex items-start">
                    <div className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</div>
                    <span className="text-gray-300">Verified portfolio for recruiters</span>
                  </div>
                </div>

                {/* Button with Flowing Border Glow */}
                <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
                  <Link 
                    to="/projects"
                    className="block w-full bg-surface-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300 text-center"
                  >
                    Browse Projects →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Talent Pool Section */}
<section className="py-16 sm:py-20 px-4 sm:px-6 bg-surface-800">
  <div className="max-w-7xl mx-auto">
    {/* Discover Verified Talent - Flow Gradient Typography */}
    <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-12">
      Discover Verified Talent
    </h2>
    <p className="text-lg sm:text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
      Connect with skilled professionals who have proven their expertise through certified courses 
      and real-world project experience.
    </p>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
      {/* Feature 1 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
        <Award className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Verified Skills</h3>
        <p className="text-gray-400 text-sm">
          Every talent is certified through our rigorous assessment process
        </p>
      </div>

      {/* Feature 2 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
        <FileText className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Project Portfolio</h3>
        <p className="text-gray-400 text-sm">
          Real-world project experience with expert evaluations
        </p>
      </div>

      {/* Feature 3 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
        <Users className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">HR Access</h3>
        <p className="text-gray-400 text-sm">
          Exclusive access for verified HR professionals
        </p>
      </div>

      {/* Feature 4 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
        <Mail className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Direct Recruitment</h3>
        <p className="text-gray-400 text-sm">
          Connect directly with pre-vetted candidates
        </p>
      </div>
    </div>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {/* For Job Seekers */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
        <Link 
          to="/signup"
          className="block bg-surface-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all duration-300 shadow-lg min-w-[200px] text-center"
        >
          Join Talent Pool
        </Link>
      </div>
      
      {/* For HR */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
        <Link 
          to="/talent"
          className="block bg-surface-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all duration-300 shadow-lg min-w-[200px] text-center"
        >
          Browse Talent
        </Link>
      </div>
    </div>

    {/* HR Notice */}
    <div className="text-center mt-8">
      <p className="text-gray-400 text-sm">
        HR professionals: Verify your company email to access full candidate profiles
      </p>
    </div>
  </div>
</section>

      {/* Expert Review Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-surface-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Expert Review - Flow Gradient Typography */}
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-6">
                Expert Review
              </h2>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-300 mb-6">
                Get Feedback from Industry Specialists
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Submit your completed projects for evaluation by experienced industry 
                professionals who know best practices inside and out.
              </p>

              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Professional Assessment
                  </h4>
                  <p className="text-gray-400">
                    Detailed feedback on code quality and practices
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Recognition
                  </h4>
                  <p className="text-gray-400">
                    Earn verified badges for successfully completed reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Get Discovered by Top Companies - Animated Gradient Flow Border */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <div className="bg-surface-800 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700">
                {/* Get Discovered - Flow Gradient Typography */}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-6">
                  Get Discovered by Top Companies
                </h3>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Complete your learning journey and join our verified talent marketplace 
                  where leading recruiters find exceptional developers.
                </p>
                
                {/* Top Companies Grid - StatsGrid with Animated Gradient Flow Border */}
                <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4 bg-surface-800 rounded-lg">
                    {topCompanies.map((company, index) => (
                      <div 
                        key={index}
                        className="bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600 transition-all duration-300 border border-gray-600 hover:border-sky-400/50"
                      >
                        <span className="text-white text-sm font-medium">{company}</span>
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-900 to-surface-900">
        <div className="max-w-4xl mx-auto text-center">
          {/* Start Your Learning Journey - Flow Gradient Typography */}
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-8">
            Ready to Master New Skills?
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of learners building their careers with Immersia.
          </p>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-12 max-w-2xl mx-auto"></div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 sm:mb-20">
            {/* Get Started Free Button with Flowing Border Glow */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <Link 
                to="/signup"
                className="block bg-surface-800 text-white px-6 sm:px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all duration-300 shadow-lg"
              >
                Get Started Free
              </Link>
            </div>
            
            {/* Explore Courses Button */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              <Link 
                to="/courses"
                className="block bg-surface-800 text-white px-6 sm:px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all duration-300"
              >
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-800 pt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold text-white mb-4">Learning</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/courses" className="hover:text-sky-400 transition-colors duration-300">Courses</Link></li>
                  <li><Link to="/projects" className="hover:text-sky-400 transition-colors duration-300">Projects</Link></li>
                  <li><Link to="/skill" className="hover:text-sky-400 transition-colors duration-300">Skills</Link></li>
                  <li><Link to="/talent" className="hover:text-sky-400 transition-colors duration-300">Talent</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">About</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">Blog</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">Privacy</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">Terms</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">Twitter</a></li>
                  <li><a href="#" className="hover:text-sky-400 transition-colors duration-300">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm sm:text-base">
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