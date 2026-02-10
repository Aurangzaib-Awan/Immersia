// components/courses/Quiz.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What is the main purpose of React components?",
      options: [
        "To handle API calls",
        "To create reusable UI pieces",
        "To manage database operations",
        "To style web pages"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Which hook is used for side effects in React?",
      options: [
        "useState",
        "useEffect", 
        "useContext",
        "useReducer"
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What is JSX in React?",
      options: [
        "A JavaScript testing framework",
        "A syntax extension for JavaScript",
        "A state management library",
        "A build tool for React"
      ],
      correctAnswer: 1
    }
  ];

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quizQuestions.length,
      percentage: Math.round((correct / quizQuestions.length) * 100)
    };
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowResults(true);
    }, 2000);
  };

  const handleBackToWorkspace = () => {
    navigate(`/courses/${courseId}/workspace`);
  };

  if (showResults) {
    const { correct, total, percentage } = calculateScore();
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
              Quiz Results
            </h1>
            <p className="text-gray-300 text-lg">
              Here's how you performed on the assessment
            </p>
          </div>

          <div className="bg-surface-800 border border-gray-700 rounded-xl p-8 text-center">
            <div className={`w-24 h-24 rounded-full ${passed ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center mx-auto mb-6`}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-400" />
              ) : (
                <X className="w-12 h-12 text-red-400" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              {passed ? 'Congratulations! Quiz Passed' : 'Quiz Not Passed'}
            </h2>
            
            <div className="text-4xl font-bold text-white mb-2">
              {percentage}%
            </div>
            <div className="text-gray-300 mb-6">
              {correct} out of {total} questions correct
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{correct}</div>
                  <div className="text-gray-300">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{total - correct}</div>
                  <div className="text-gray-300">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-400">{total}</div>
                  <div className="text-gray-300">Total Questions</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackToWorkspace}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Back to Learning Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
            Course Assessment
          </h1>
          <p className="text-gray-300 text-lg">
            Test your knowledge and track your progress
          </p>
        </div>

        <div className="bg-surface-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5" />
              <span>Time: Unlimited</span>
            </div>
            <div className="text-gray-300">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">{currentQ.question}</h2>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                    answers[currentQuestion] === index
                      ? 'border-sky-400 bg-sky-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-sky-400/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Previous
            </button>

            {currentQuestion === quizQuestions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Quiz Guidelines
          </h3>
          <ul className="text-sky-300 text-sm space-y-2">
            <li>• Answer all questions to complete the quiz</li>
            <li>• You can navigate between questions using Previous/Next buttons</li>
            <li>• Passing score is 70% or higher</li>
            <li>• Take your time and read each question carefully</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Quiz;