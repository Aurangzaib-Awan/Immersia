// components/courses/Quiz.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, X, ShieldAlert, ShieldX, PlayCircle } from 'lucide-react';
import ProctorFeed from '../../components/fyp/ProctorFeed';
import ProctorStats from '../../components/fyp/ProctorStats';
import useProctoring from '../../hooks/useProctoring';

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizTerminated, setQuizTerminated] = useState(false);

  // Proctoring State
  // Proctoring State
  const [chances, setChances] = useState(3);
  const [violationLogs, setViolationLogs] = useState([]);
  const [showViolationToast, setShowViolationToast] = useState(false);
  const [currentViolation, setCurrentViolation] = useState('');
  const [gazeViolationStart, setGazeViolationStart] = useState(null);

  const handleAlert = useCallback((data) => {
    const alertType = data.alert;
    const isGazeAlert = alertType === 'gaze_off_screen';

    // 3-SECOND THRESHOLD For Gaze: Only decrement after 3 seconds of continuous violation
    if (isGazeAlert) {
      setGazeViolationStart(prev => {
        if (!prev) {
          // First gaze violation detected - start timer
          return Date.now();
        } else {
          // Check if 3 seconds have passed
          const elapsed = (Date.now() - prev) / 1000;
          if (elapsed >= 3) {
            // Log and decrement chances
            const logEntry = {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              type: 'gaze_off_screen_3s',
              behavior: `Gaze deviation for ${elapsed.toFixed(1)}s`
            };
            setViolationLogs(prev => [logEntry, ...prev].slice(0, 50));
            setCurrentViolation('Gaze away for 3+ seconds!');
            setShowViolationToast(true);
            setTimeout(() => setShowViolationToast(false), 3000);

            setChances(prev => {
              const next = Math.max(0, prev - 1);
              if (next === 0) {
                setQuizTerminated(true);
                setQuizStarted(false);
              }
              return next;
            });
            return null; // Reset timer so we don't spam penalties instantly again (or could return Date.now() to continue penalizing every 3s)
          }
          return prev; // Keep counting
        }
      });
    } else {
      // Reset gaze timer when not gazing away OR if it's a different alert
      // Note: If alertType is something else (like gadget), we process it immediately
      setGazeViolationStart(null);

      if (alertType !== 'none') {
        // Immediate processing for non-gaze alerts (gadgets, faces)
        const logEntry = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: alertType,
          behavior: data.behavior_status
        };

        setViolationLogs(prev => [logEntry, ...prev].slice(0, 50));
        setCurrentViolation(alertType);
        setShowViolationToast(true);
        setTimeout(() => setShowViolationToast(false), 3000);

        setChances(prev => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            setQuizTerminated(true);
            setQuizStarted(false);
          }
          return next;
        });
      }
    }
  }, []);

  const {
    isProctoring,
    connectionStatus,
    behaviorStatus,
    devicesDetected,
    visualization,
    stats,
    startProctoring,
    stopProctoring,
    sendFrame
  } = useProctoring({ onAlert: handleAlert });

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
    stopProctoring();
    setTimeout(() => {
      setIsSubmitting(false);
      setShowResults(true);
    }, 2000);
  };

  const handleStartQuiz = () => {
    startProctoring();
    setQuizStarted(true);
  };

  const handleBackToWorkspace = () => {
    stopProctoring();
    navigate(`/courses/${courseId}/workspace`);
  };

  useEffect(() => {
    return () => stopProctoring();
  }, [stopProctoring]);

  if (quizTerminated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-800 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Terminated</h1>
          <p className="text-gray-400 mb-8">
            Too many integrity violations were detected. This attempt has been flagged and closed.
          </p>
          <button
            onClick={handleBackToWorkspace}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const { correct, total, percentage } = calculateScore();
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Quiz Completed</h1>
            <p className="text-gray-400">Your assessment results are ready</p>
          </div>

          <div className="bg-surface-800 border border-gray-800 rounded-2xl p-8 text-center shadow-xl">
            <div className={`w-24 h-24 rounded-full ${passed ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center mx-auto mb-6 border ${passed ? 'border-green-500/30' : 'border-red-500/30'}`}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <X className="w-12 h-12 text-red-500" />
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Assessment Passed' : 'Assessment Not Passed'}
            </h2>
            <div className="text-5xl font-bold mb-6 text-white">{percentage}%</div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-2xl font-bold text-green-500">{correct}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Correct</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-2xl font-bold text-red-500">{total - correct}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Incorrect</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-2xl font-bold text-sky-500">{total}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Total</div>
              </div>
            </div>

            <button
              onClick={handleBackToWorkspace}
              className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-all"
            >
              Back to Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-4">Course Assessment</h1>
            <p className="text-gray-400">Please review the instructions before starting</p>
          </div>

          <div className="bg-surface-800 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-sky-500" />
                  Quiz Info
                </h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> No time limit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 70% passing score
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> 3 violation limit
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  AI Proctoring
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  This quiz is monitored by AI. Ensure your camera is on, your face is visible, and you remain focused on the screen.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg group"
            >
              Start Secure Quiz
              <PlayCircle className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-gray-800 rounded-lg text-xs font-bold text-gray-400">
            SECURE EXAM MODE
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <h2 className="text-sm font-medium text-gray-300">Question {currentQuestion + 1} of {quizQuestions.length}</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-mono text-gray-400">00:00:00</span>
          </div>
          <button
            onClick={() => { if (window.confirm('Are you sure you want to exit? progress will be lost.')) handleBackToWorkspace(); }}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Proctor Feed */}
          <div className="lg:col-span-3 space-y-6">
            <ProctorFeed
              isProctoring={isProctoring}
              onFrame={sendFrame}
              visualization={visualization}
            />
            {chances < 3 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Violation Warning</span>
                </div>
                <p className="text-[10px] text-red-400">
                  Suspicious activity detected. {chances} {chances === 1 ? 'chance' : 'chances'} remaining.
                </p>
              </div>
            )}
          </div>

          {/* Center Column: Quiz content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface-800 border border-gray-800 rounded-3xl p-8 shadow-xl min-h-[400px] flex flex-col">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
                  {currentQ.question}
                </h2>
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group ${answers[currentQuestion] === index
                        ? 'border-sky-500 bg-sky-500/10 text-white'
                        : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700 hover:bg-gray-800'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[currentQuestion] === index ? 'border-sky-500 bg-sky-500' : 'border-gray-600 group-hover:border-gray-500'
                        }`}>
                        {answers[currentQuestion] === index && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-lg">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-white disabled:opacity-0 transition-all"
                >
                  Previous
                </button>

                <div className="flex gap-4">
                  {currentQuestion === quizQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="bg-white text-black font-bold py-3 px-10 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="bg-white text-black font-bold py-3 px-10 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Proctor Stats */}
          <div className="lg:col-span-3">
            <ProctorStats
              stats={stats}
              behaviorStatus={behaviorStatus}
              chances={chances}
              devicesDetected={devicesDetected}
              connectionStatus={connectionStatus}
              violationLogs={violationLogs}
            />
          </div>
        </div>
      </div>

      {/* Violation Toast - Critical Feedback */}
      {showViolationToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-red-600/90 backdrop-blur-md border border-red-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Integrity Violation</div>
              <div className="text-xl font-black uppercase italic tracking-tighter">
                {currentViolation.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="h-10 w-px bg-white/20 mx-2" />
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase opacity-60">Chances</div>
              <div className="text-2xl font-black">{chances}</div>
            </div>
          </div>
        </div>
      )}

      {/* Red Vignette on Violation */}
      {showViolationToast && (
        <div className="fixed inset-0 pointer-events-none z-[99] border-[40px] border-red-600/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.3)] animate-pulse" />
      )}
    </div>
  );
};

export default Quiz;