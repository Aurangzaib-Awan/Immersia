import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import careerPaths from '../data/mindmap.json';

function Mindmap() {
  const [searchParams] = useSearchParams();
  const careerId = searchParams.get('career');
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [careerData, setCareerData] = useState(null);

  useEffect(() => {
    if (careerId && careerPaths[careerId]) {
      setCareerData(careerPaths[careerId]);
      setSelectedTopics(new Set());
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
    console.log('Raw unknown topic IDs:', unknownTopics);
  };

  if (!careerId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">No Career Selected</h2>
          <p className="text-gray-300">Please go back and select a career path first.</p>
        </div>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Career Path Not Found</h2>
          <p className="text-gray-300">The career "{careerId}" was not found.</p>
        </div>
      </div>
    );
  }

  const totalTopics = careerData.categories.flatMap(cat => cat.topics).length;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          {careerData.title}
        </h1>
        <p className="text-gray-300 text-lg">
          Select topics you already know
        </p>
      </div>

      {/* Central Node */}
      <div className="bg-blue-600 text-white text-xl font-semibold py-4 px-8 rounded-full w-fit mx-auto mb-12 text-center border-2 border-blue-500 transform hover:scale-105 transition-transform duration-200">
        {careerData.title}
      </div>

      {/* Categories Grid */}
        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto mb-8">        
        {careerData.categories.map((category) => (
          <div key={category.name} className="flex flex-col items-center">
            {/* Category Header */}
            <div className="bg-gray-800 text-white font-semibold py-3 px-6 rounded-full w-full text-center mb-6 border-2 border-gray-700">
              {category.name}
            </div>

            {/* Topics */}
            <div className="space-y-4 w-full">
              {category.topics.map(topic => (
                <div
                  key={topic.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 font-medium text-center border-2 hover:-translate-y-1 ${
                    selectedTopics.has(topic.id)
                      ? 'bg-blue-600 text-white border-blue-500 transform scale-105'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
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
      <div className="text-center mt-12">
        <button 
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors mb-4"
          onClick={handleContinue}
        >
          <a href="./divide">
          Continue to Learning Plan
          </a>
        </button>
        <p className="text-gray-400 text-sm">
          Selected: {selectedTopics.size} topics | 
          Remaining: {totalTopics - selectedTopics.size} to learn
        </p>
      </div>
    </div>
  );
}

export default Mindmap;