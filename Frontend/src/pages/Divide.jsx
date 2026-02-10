// pages/Divide.jsx
import { useNavigate, useLocation } from 'react-router-dom';

function Divide() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const unknownTopics = location.state?.unknownTopics || [];

  const handleCourseLearning = () => {
    console.log('Course Learning selected with topics:', unknownTopics);
    navigate('/courses', { 
      state: { 
        unknownTopics,
        skillGaps: unknownTopics
      } 
    });
  };

  const handleProjectBasedLearning = () => {
    console.log('Project Based Learning selected with topics:', unknownTopics);
    navigate('/projects', { 
      state: { 
        unknownTopics,
        skillGaps: unknownTopics
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
            Choose Your Learning Style
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select how you want to learn the remaining <span className="text-sky-400 font-semibold">{unknownTopics.length} topics</span> in your path
          </p>
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>

        {/* Learning Style Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Traditional Learning Card - Now Course Learning */}
          <div
            onClick={handleCourseLearning}
            className="group relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow cursor-pointer"
          >
            <div className="bg-surface-800 rounded-xl p-6 sm:p-8 h-full">
              <div className="text-center mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">📚</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Course Learning
                </h3>
                <p className="text-sky-400 font-semibold text-sm sm:text-base">
                  Structured & Comprehensive
                </p>
              </div>
              
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Step-by-step courses and lectures</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Interactive quizzes and assessments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Theoretical foundations first</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Gradual progression from basics to advanced</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm text-center">
                  Ideal for building strong fundamentals
                </p>
              </div>
            </div>
          </div>

          {/* Project Based Learning Card */}
          <div
            onClick={handleProjectBasedLearning}
            className="group relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow cursor-pointer"
          >
            <div className="bg-surface-800 rounded-xl p-6 sm:p-8 h-full">
              <div className="text-center mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">🚀</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Project Based Learning
                </h3>
                <p className="text-sky-400 font-semibold text-sm sm:text-base">
                  Hands-on & Practical
                </p>
              </div>
              
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Learn by building real projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Immediate practical application</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Portfolio-ready projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Problem-solving focused approach</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm text-center">
                  Ideal for rapid skill application
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-12 text-center">
          <div className="bg-surface-800 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto border border-gray-800">
            <p className="text-gray-300 text-lg">
              You have <span className="text-sky-400 font-semibold">{unknownTopics.length} topics</span> to master
            </p>
            {unknownTopics.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Topics to cover:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {unknownTopics.slice(0, 4).map((topic, index) => (
                    <span 
                      key={index}
                      className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-sm border border-sky-500/30"
                    >
                      {topic}
                    </span>
                  ))}
                  {unknownTopics.length > 4 && (
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm border border-gray-600">
                      +{unknownTopics.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Divide;