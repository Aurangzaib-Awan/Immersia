import React from 'react';

const Home = () => {
  const topCompanies = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix", 
    "Apple", "Tesla", "Spotify", "Uber", "Airbnb"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Immersia</div>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#paths" className="text-gray-300 hover:text-white font-medium transition-colors">Paths</a>
            <a href="#projects" className="text-gray-300 hover:text-white font-medium transition-colors">Projects</a>
            <a href="#talent" className="text-gray-300 hover:text-white font-medium transition-colors">Talent</a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
                <a href="./signup">Get Started</a>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-20 px-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Master Your Skills
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Learn. Build. Grow.
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Choose your learning journey: master concepts through structured paths, 
            or dive into real-world projects. Get certified, evaluated by industry experts, 
            and discovered by top companies.
          </p>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section id="paths" className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Two Powerful Learning Paths
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Choose the approach that works best for you. Learn systematically or by building
            real projects.
          </p>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Structured Learning Path */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6">
                Structured Learning Path
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Master concepts step by step with guided courses and expert instruction.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Curated curriculum from industry experts</span>
                </div>
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Interactive courses with video lessons</span>
                </div>
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Comprehensive quizzes and assessments</span>
                </div>
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Earn recognized certifications & badges</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Explore Paths →
              </button>
            </div>

            {/* Applied Learning */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6">
                Applied Learning (Build & Learn)
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Learn by doing. Take on real-world projects and build your portfolio.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Hands-on projects with real challenges</span>
                </div>
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Mentorship from industry practitioners</span>
                </div>
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Expert evaluation & constructive feedback</span>
                </div>
                <div className="flex items-start">
                  <div className="text-green-400 mr-3 mt-1">✓</div>
                  <span className="text-gray-300">Verified portfolio for recruiters</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Start a Project →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Review Section */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                Expert Review
              </h2>
              <h3 className="text-2xl font-semibold text-gray-300 mb-6">
                Get Feedback from Industry Specialists
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Submit your completed projects for evaluation by experienced industry 
                professionals who know best practices inside and out.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Professional Assessment
                  </h4>
                  <p className="text-gray-400">
                    Detailed feedback on code quality and practices
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Recognition
                  </h4>
                  <p className="text-gray-400">
                    Earn verified badges for successfully completed reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-6">
                Get Discovered by Top Companies
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                Complete your learning journey and join our verified talent marketplace 
                where leading recruiters find exceptional developers.
              </p>
              
              {/* Top Companies Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                {topCompanies.map((company, index) => (
                  <div 
                    key={index}
                    className="bg-gray-600 rounded-xl p-3 text-center hover:bg-gray-500 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">{company}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Start Your Learning Journey Today
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Whether you prefer structured learning or hands-on projects, we have the perfect path for you.
          </p>

          <div className="border-t border-gray-700 mb-12"></div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors">
              Get Started Free
            </button>
            <button className="border border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors">
              Schedule Demo
            </button>
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-800 pt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold text-white mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Paths</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Talent</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-800">
              <p className="text-gray-500">
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