import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import careerPaths from '../data/mindmap.json';

function Mindmap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const careerId = searchParams.get('career');
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [careerData, setCareerData] = useState(null);

  useEffect(() => {
    if (careerId && careerPaths[careerId]) {
      setTimeout(() => {
        setCareerData(careerPaths[careerId]);
        setSelectedTopics(new Set());
      }, 0);
    }
  }, [careerId]);

  const handleTopicClick = (topicId) => {
    setSelectedTopics(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(topicId)) {
        newSelected.delete(topicId);
      } else {
        newSelected.add(topicId);
      }
      return newSelected;
    });
  };

  const handleContinue = () => {
    if (!careerData) return;

    const allTopics = careerData.categories.flatMap(category => 
      category.topics.map(topic => topic.id)
    );
    
    const unknownTopics = allTopics.filter(topicId => !selectedTopics.has(topicId));
    
    const unknownTopicNames = unknownTopics.map(topicId => {
      const topic = careerData.categories.flatMap(cat => cat.topics).find(t => t.id === topicId);
      return topic ? topic.name : topicId;
    });

    console.log('Topics to learn:', unknownTopicNames);
    navigate('/divide', { state: { unknownTopics: unknownTopicNames } });
  };

  if (!careerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 flex items-center justify-center p-6">
        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
          <div className="bg-surface-800 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
              No Career Selected
            </h2>
            <p className="text-gray-300">Please go back and select a career path first.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 flex items-center justify-center p-6">
        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
          <div className="bg-surface-800 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-4">
              Career Path Not Found
            </h2>
            <p className="text-gray-300">The career "{careerId}" was not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTopics = careerData.categories.flatMap(cat => cat.topics).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 py-8 sm:py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-3">
          {careerData.title}
        </h1>
        <p className="text-gray-300 text-lg">
          Select topics you already know
        </p>
      </div>

      {/* Central Node */}
      <div className="relative p-[2px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-fit mx-auto mb-8 sm:mb-12">
        <div className="bg-surface-800 text-white text-xl font-semibold py-4 px-6 sm:px-8 rounded-full text-center shadow-lg">
          {careerData.title}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-7xl mx-auto mb-8">        
        {careerData.categories.map((category) => (
          <div key={category.name} className="flex flex-col items-center w-full sm:w-auto">
            {/* Category Header */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full mb-4 sm:mb-6">
              <div className="bg-surface-800 text-white font-semibold py-3 px-4 sm:px-6 rounded-full text-center text-sm sm:text-base">
                {category.name}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-3 sm:space-y-4 w-full">
              {category.topics.map(topic => (
                <div
                  key={topic.id}
                  className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 font-medium text-center border-2 hover:-translate-y-1 ${
                    selectedTopics.has(topic.id)
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-500 transform scale-105 shadow-lg'
                      : 'bg-surface-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  {topic.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="text-center mt-8 sm:mt-12">
        <button 
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg mb-4"
          onClick={handleContinue}
        >
          Continue to Learning Plan
        </button>
        <div className="bg-surface-800 rounded-lg p-4 max-w-md mx-auto border border-gray-700">
          <p className="text-gray-400 text-sm">
            <span className="text-sky-400 font-semibold">{selectedTopics.size}</span> topics selected | 
            <span className="text-green-400 font-semibold ml-2">{totalTopics - selectedTopics.size}</span> to learn
          </p>
        </div>
      </div>
    </div>
  );
}

export default Mindmap;