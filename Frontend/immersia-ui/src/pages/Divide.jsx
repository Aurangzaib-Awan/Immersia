import { useNavigate, useLocation } from 'react-router-dom';

function Divide() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const unknownTopics = location.state?.unknownTopics || [];

  const handleTraditionalLearning = () => {
    console.log('Traditional Learning selected with topics:', unknownTopics);
    navigate('/traditional-learning', { state: { unknownTopics } });
  };

  const handleProjectBasedLearning = () => {
    console.log('Project Based Learning selected with topics:', unknownTopics);
    navigate('/project-learning', { state: { unknownTopics } });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Learning Style
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select how you want to learn the remaining {unknownTopics.length} topics in your path
          </p>
        </div>

        <hr className="border-gray-700 mb-12 max-w-2xl mx-auto" />

        {/* Learning Style Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional Learning Card */}
          <div
            onClick={handleTraditionalLearning}
            className="p-8 rounded-xl border-2 border-gray-700 bg-gray-800 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:border-gray-600 hover:transform hover:scale-105"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Traditional Learning
              </h3>
              <p className="text-blue-400 font-semibold">
                Structured & Comprehensive
              </p>
            </div>
            
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Step-by-step courses and lectures
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Interactive quizzes and assessments
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Theoretical foundations first
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Gradual progression from basics to advanced
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center">
                Ideal for building strong fundamentals
              </p>
            </div>
          </div>

          {/* Project Based Learning Card */}
          <div
            onClick={handleProjectBasedLearning}
            className="p-8 rounded-xl border-2 border-gray-700 bg-gray-800 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:border-gray-600 hover:transform hover:scale-105"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Project Based Learning
              </h3>
              <p className="text-green-400 font-semibold">
                Hands-on & Practical
              </p>
            </div>
            
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Learn by building real projects
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Immediate practical application
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Portfolio-ready projects
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Problem-solving focused approach
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center">
                Ideal for rapid skill application
              </p>
            </div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            You have <span className="text-blue-400 font-semibold">{unknownTopics.length} topics</span> to master
          </p>
          {unknownTopics.length > 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Topics: {unknownTopics.slice(0, 3).join(', ')}
              {unknownTopics.length > 3 && ` and ${unknownTopics.length - 3} more...`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Divide;