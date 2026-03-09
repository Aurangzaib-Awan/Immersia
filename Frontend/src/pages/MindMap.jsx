import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import careerPaths from '../data/mindmap.json';
import { useOnboarding } from '../context/OnboardingContext'; // add for context


function Mindmap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const careerId = searchParams.get('career');
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [careerData, setCareerData] = useState(null);
  const { updateOnboarding } = useOnboarding();


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

    const allTopics = careerData.categories.flatMap(cat => cat.topics);

    const knownTopicNames = allTopics
      .filter(topic => selectedTopics.has(topic.id))
      .map(topic => topic.name);

    const unknownTopicNames = allTopics
      .filter(topic => !selectedTopics.has(topic.id))
      .map(topic => topic.name);

    updateOnboarding({ knownTopics: knownTopicNames, unknownTopics: unknownTopicNames }); // 👈 save to context

    navigate('/divide'); // 👈 no more location.state needed
  };

  if (!careerId) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
        <div className="border border-[rgb(226,232,240)] rounded-xl">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-[rgb(37,99,235)] mb-4">
              No Career Selected
            </h2>
            <p className="text-[rgb(71,85,105)]">Please go back and select a career path first.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
        <div className="border border-[rgb(226,232,240)] rounded-xl">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-[rgb(37,99,235)] mb-4">
              Career Path Not Found
            </h2>
            <p className="text-[rgb(71,85,105)]">The career "{careerId}" was not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTopics = careerData.categories.flatMap(cat => cat.topics).length;

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8 sm:py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(37,99,235)] mb-3">
          {careerData.title}
        </h1>
        <p className="text-[rgb(71,85,105)] text-lg">
          Select topics you already know
        </p>
      </div>

      {/* Central Node */}
      <div className="border border-[rgb(226,232,240)] rounded-full w-fit mx-auto mb-8 sm:mb-12">
        <div className="bg-white text-[rgb(15,23,42)] text-xl font-semibold py-4 px-6 sm:px-8 rounded-full text-center">
          {careerData.title}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-7xl mx-auto mb-8">
        {careerData.categories.map((category) => (
          <div key={category.name} className="flex flex-col items-center w-full sm:w-auto">
            {/* Category Header */}
            <div className="border border-[rgb(226,232,240)] rounded-full w-full mb-4 sm:mb-6">
              <div className="bg-white text-[rgb(15,23,42)] font-semibold py-3 px-4 sm:px-6 rounded-full text-center text-sm sm:text-base">
                {category.name}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-3 sm:space-y-4 w-full">
              {category.topics.map(topic => (
                <div
                  key={topic.id}
                  className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 font-medium text-center border-2 ${selectedTopics.has(topic.id)
                      ? 'bg-[rgb(37,99,235)] text-white border-[rgb(37,99,235)]'
                      : 'bg-white text-[rgb(71,85,105)] border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] hover:border-[rgb(148,163,184)]'
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
          className="bg-[rgb(37,99,235)] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-lg hover:bg-[rgb(29,78,216)] transition-all duration-300 mb-4"
          onClick={handleContinue}
        >
          Continue to Learning Plan
        </button>
        <div className="bg-white rounded-lg p-4 max-w-md mx-auto border border-[rgb(226,232,240)]">
          <p className="text-[rgb(148,163,184)] text-sm">
            <span className="text-[rgb(37,99,235)] font-semibold">{selectedTopics.size}</span> topics selected |
            <span className="text-green-600 font-semibold ml-2">{totalTopics - selectedTopics.size}</span> to learn
          </p>
        </div>
      </div>
    </div>
  );
}

export default Mindmap;