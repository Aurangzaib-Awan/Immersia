// pages/Divide.jsx
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';


function Divide() {
  const navigate = useNavigate();
  const { onboardingData, updateOnboarding } = useOnboarding();
  const unknownTopics = onboardingData.unknownTopics;

  const handleCourseLearning = async () => {
  updateOnboarding({ learningStyle: 'course' });
  await saveOnboardingData('course');
};

const handleProjectBasedLearning = async () => {
  updateOnboarding({ learningStyle: 'project' });
  await saveOnboardingData('project');
};
  const saveOnboardingData = async (learningStyle) => {
  try {
    const payload = {
      selectedCareer: onboardingData.selectedCareer,
      knownTopics: onboardingData.knownTopics,
      unknownTopics: onboardingData.unknownTopics,
      learningStyle,
    };

    const response = await fetch('http://localhost:8000/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to save onboarding data');

    // Navigate after successful save
    if (learningStyle === 'course') {
      navigate('/courses');
    } else {
      navigate('/projects');
    }

  } catch (err) {
    console.error('Onboarding save failed:', err);
  }
};

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[rgb(37,99,235)]">
            Choose Your Learning Style
          </h1>
          <p className="text-[rgb(71,85,105)] text-lg max-w-2xl mx-auto">
            Select how you want to learn the remaining <span className="text-[rgb(37,99,235)] font-semibold">{unknownTopics.length} topics</span> in your path
          </p>
        </div>

        {/* Divider */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="h-[1px] bg-[rgb(226,232,240)]"></div>
        </div>

        {/* Learning Style Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Course Learning Card */}
          <div
            onClick={handleCourseLearning}
            className="group relative border border-[rgb(226,232,240)] rounded-xl cursor-pointer hover:border-[rgb(37,99,235)] transition-all duration-300"
          >
            <div className="bg-white rounded-xl p-6 sm:p-8 h-full">
              <div className="text-center mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[rgb(37,99,235)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">📚</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[rgb(15,23,42)] mb-2">
                  Course Learning
                </h3>
                <p className="text-[rgb(37,99,235)] font-semibold text-sm sm:text-base">
                  Structured & Comprehensive
                </p>
              </div>

              <ul className="space-y-3 text-[rgb(71,85,105)]">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Step-by-step courses and lectures</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Interactive quizzes and assessments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Theoretical foundations first</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Gradual progression from basics to advanced</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-[rgb(226,232,240)]">
                <p className="text-[rgb(148,163,184)] text-sm text-center">
                  Ideal for building strong fundamentals
                </p>
              </div>
            </div>
          </div>

          {/* Project Based Learning Card */}
          <div
            onClick={handleProjectBasedLearning}
            className="group relative border border-[rgb(226,232,240)] rounded-xl cursor-pointer hover:border-[rgb(37,99,235)] transition-all duration-300"
          >
            <div className="bg-white rounded-xl p-6 sm:p-8 h-full">
              <div className="text-center mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[rgb(37,99,235)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">🚀</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[rgb(15,23,42)] mb-2">
                  Project Based Learning
                </h3>
                <p className="text-[rgb(37,99,235)] font-semibold text-sm sm:text-base">
                  Hands-on & Practical
                </p>
              </div>

              <ul className="space-y-3 text-[rgb(71,85,105)]">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Learn by building real projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Immediate practical application</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Portfolio-ready projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                  <span>Problem-solving focused approach</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-[rgb(226,232,240)]">
                <p className="text-[rgb(148,163,184)] text-sm text-center">
                  Ideal for rapid skill application
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl mx-auto border border-[rgb(226,232,240)]">
            <p className="text-[rgb(71,85,105)] text-lg">
              You have <span className="text-[rgb(37,99,235)] font-semibold">{unknownTopics.length} topics</span> to master
            </p>
            {unknownTopics.length > 0 && (
              <div className="mt-4">
                <p className="text-[rgb(148,163,184)] text-sm mb-2">Topics to cover:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {unknownTopics.slice(0, 4).map((topic, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-[rgb(37,99,235)] px-3 py-1 rounded-full text-sm border border-[rgb(37,99,235)]/20"
                    >
                      {topic}
                    </span>
                  ))}
                  {unknownTopics.length > 4 && (
                    <span className="bg-[rgb(241,245,249)] text-[rgb(71,85,105)] px-3 py-1 rounded-full text-sm border border-[rgb(226,232,240)]">
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