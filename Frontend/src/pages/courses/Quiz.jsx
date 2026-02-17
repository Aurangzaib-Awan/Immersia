/**
 * Quiz Component - Production Ready
 * 
 * Secure quiz interface with AI proctoring integration
 * 
 * Features:
 * - 3-strike integrity system
 * - Real-time AI monitoring
 * - 3-second gaze violation threshold
 * - Immediate alerts for critical violations (devices, multiple faces)
 * - Violation logging
 * - Auto-termination on 0 chances
 * - Results calculation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  ShieldAlert,
  ShieldX,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import ProctorFeed from '../../components/fyp/ProctorFeed';
import ProctorStats from '../../components/fyp/ProctorStats';
import useProctoring from '../../hooks/useProctoring';

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ========================================================================
  // QUIZ STATE
  // ========================================================================
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizTerminated, setQuizTerminated] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // ========================================================================
  // PROCTORING STATE
  // ========================================================================
  const [chances, setChances] = useState(3);
  const [violationLogs, setViolationLogs] = useState([]);
  const [showViolationToast, setShowViolationToast] = useState(false);
  const [currentViolation, setCurrentViolation] = useState('');
  const [gazeViolationStart, setGazeViolationStart] = useState(null);
  const [gazeViolationDuration, setGazeViolationDuration] = useState(0);

  // Refs for violation tracking
  const gazeTimerRef = useRef(null);
  const processedAlertsRef = useRef(new Set());

  // ========================================================================
  // ALERT HANDLER - Core proctoring logic
  // ========================================================================
  const handleAlert = useCallback((data) => {
    const alertType = data.alert;
    const timestamp = data.timestamp || Date.now();

    // Prevent duplicate processing of the same alert
    const alertKey = `${alertType}-${timestamp}`;
    if (processedAlertsRef.current.has(alertKey)) {
      return;
    }
    processedAlertsRef.current.add(alertKey);

    // Clean up old alert keys (keep last 50)
    if (processedAlertsRef.current.size > 50) {
      const entries = Array.from(processedAlertsRef.current);
      processedAlertsRef.current = new Set(entries.slice(-50));
    }

    const isGazeAlert = alertType === 'gaze_off_screen';

    // ====================================================================
    // GAZE VIOLATION: 3-SECOND THRESHOLD
    // ====================================================================
    if (isGazeAlert) {
      if (!gazeViolationStart) {
        // First gaze violation detected - start timer
        console.log('👁️ Gaze violation started');
        setGazeViolationStart(Date.now());

        // Start continuous duration update
        gazeTimerRef.current = setInterval(() => {
          setGazeViolationDuration(prev => {
            const duration = (Date.now() - gazeViolationStart) / 1000;
            return duration;
          });
        }, 100); // Update every 100ms for smooth counter
      }
    } else {
      // ================================================================
      // NON-GAZE ALERT: Check if we need to penalize ongoing gaze violation
      // ================================================================
      if (gazeViolationStart) {
        const elapsed = (Date.now() - gazeViolationStart) / 1000;

        if (elapsed >= 3) {
          // Gaze violation exceeded 3 seconds - log it
          console.log(`⚠️ Gaze violation completed: ${elapsed.toFixed(1)}s`);

          const logEntry = {
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
            type: 'gaze_off_screen_3s',
            behavior: `Gaze deviation for ${elapsed.toFixed(1)}s`
          };

          setViolationLogs(prev => [logEntry, ...prev].slice(0, 50));
          setCurrentViolation('Gaze away for 3+ seconds!');
          setShowViolationToast(true);
          setTimeout(() => setShowViolationToast(false), 3000);

          // Deduct chance
          setChances(prev => {
            const next = Math.max(0, prev - 1);
            if (next === 0) {
              setQuizTerminated(true);
              setQuizStarted(false);
            }
            return next;
          });
        }

        // Reset gaze timer
        setGazeViolationStart(null);
        setGazeViolationDuration(0);
        if (gazeTimerRef.current) {
          clearInterval(gazeTimerRef.current);
          gazeTimerRef.current = null;
        }
      }

      // ================================================================
      // IMMEDIATE ALERT PROCESSING (Critical violations)
      // ================================================================
      if (alertType !== 'none') {
        console.log('🚨 Immediate violation:', alertType);

        const logEntry = {
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          type: alertType,
          behavior: data.behavior_status
        };

        setViolationLogs(prev => [logEntry, ...prev].slice(0, 50));
        setCurrentViolation(alertType.replace(/_/g, ' '));
        setShowViolationToast(true);
        setTimeout(() => setShowViolationToast(false), 3000);

        // Deduct chance
        setChances(prev => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            console.log('❌ Quiz terminated - no chances remaining');
            setQuizTerminated(true);
            setQuizStarted(false);
          }
          return next;
        });
      }
    }
  }, [gazeViolationStart]);

  // ========================================================================
  // GAZE TIMER CLEANUP
  // ========================================================================
  useEffect(() => {
    // Check if gaze violation has exceeded 3 seconds
    if (gazeViolationStart) {
      const elapsed = (Date.now() - gazeViolationStart) / 1000;

      if (elapsed >= 3) {
        console.log(`⚠️ Gaze violation reached 3 seconds: ${elapsed.toFixed(1)}s`);

        const logEntry = {
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          type: 'gaze_off_screen_3s',
          behavior: `Gaze deviation for ${elapsed.toFixed(1)}s`
        };

        setViolationLogs(prev => [logEntry, ...prev].slice(0, 50));
        setCurrentViolation('Gaze away for 3+ seconds!');
        setShowViolationToast(true);
        setTimeout(() => setShowViolationToast(false), 3000);

        // Deduct chance
        setChances(prev => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            console.log('❌ Quiz terminated - no chances remaining');
            setQuizTerminated(true);
            setQuizStarted(false);
          }
          return next;
        });

        // Reset gaze timer
        setGazeViolationStart(null);
        setGazeViolationDuration(0);
        if (gazeTimerRef.current) {
          clearInterval(gazeTimerRef.current);
          gazeTimerRef.current = null;
        }
      }
    }
  }, [gazeViolationStart, gazeViolationDuration]);

  // ========================================================================
  // PROCTORING HOOK
  // ========================================================================
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
  } = useProctoring({
    onAlert: handleAlert,
    frameRate: 5
  });

  // ========================================================================
  // QUIZ DATA
  // ========================================================================
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
    },
    {
      id: 4,
      question: "What is the Virtual DOM in React?",
      options: [
        "A copy of the real DOM kept in memory",
        "A cloud-based DOM storage",
        "A testing environment for React",
        "A CSS framework for React"
      ],
      correctAnswer: 0
    },
    {
      id: 5,
      question: "Which method is used to update state in React?",
      options: [
        "updateState()",
        "setState()",
        "changeState()",
        "modifyState()"
      ],
      correctAnswer: 1
    }
  ];

  // ========================================================================
  // QUIZ NAVIGATION
  // ========================================================================
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

  // ========================================================================
  // SCORING
  // ========================================================================
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

  // ========================================================================
  // QUIZ CONTROL
  // ========================================================================
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    stopProctoring();

    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setShowResults(true);
    }, 2000);
  };

  const handleStartQuiz = () => {
    console.log('▶️ Starting quiz');
    setQuizStartTime(Date.now());
    startProctoring();
    setQuizStarted(true);
  };

  const handleBackToWorkspace = () => {
    stopProctoring();
    navigate(`/courses/${courseId}/workspace`);
  };

  // ========================================================================
  // CLEANUP
  // ========================================================================
  useEffect(() => {
    return () => {
      stopProctoring();
      if (gazeTimerRef.current) {
        clearInterval(gazeTimerRef.current);
      }
    };
  }, [stopProctoring]);

  // ========================================================================
  // RENDER: QUIZ TERMINATED
  // ========================================================================
  if (quizTerminated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-800 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Terminated</h1>
          <p className="text-gray-400 mb-4">
            Too many integrity violations were detected.
          </p>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm font-medium">
              This attempt has been flagged and will be reviewed by your instructor.
            </p>
          </div>
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

  // ========================================================================
  // RENDER: RESULTS
  // ========================================================================
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
              {passed ? 'Assessment Passed ✓' : 'Assessment Not Passed'}
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

            {/* Proctoring Summary */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Proctoring Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Integrity Score:</span>
                  <span className="ml-2 font-bold text-white">{chances}/3</span>
                </div>
                <div>
                  <span className="text-gray-500">Violations:</span>
                  <span className="ml-2 font-bold text-white">{violationLogs.length}</span>
                </div>
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

  // ========================================================================
  // RENDER: START SCREEN
  // ========================================================================
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
                    <CheckCircle className="w-4 h-4" /> {quizQuestions.length} questions
                  </li>
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
                  AI Proctoring Rules
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                    <span>Keep your face visible and centered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                    <span>Look at the screen (3-second gaze threshold)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                    <span>No electronic devices visible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                    <span>Stay alone in the room</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-500 font-medium">
                ⚠️ You have 3 chances. Each violation costs 1 chance. At 0 chances, the quiz will auto-terminate.
              </p>
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

  // ========================================================================
  // RENDER: QUIZ IN PROGRESS
  // ========================================================================
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
          <h2 className="text-sm font-medium text-gray-300">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-mono text-gray-400">
              {quizStartTime ? Math.floor((Date.now() - quizStartTime) / 60000) : 0}:
              {quizStartTime ? String(Math.floor(((Date.now() - quizStartTime) % 60000) / 1000)).padStart(2, '0') : '00'}
            </span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit? Progress will be lost.')) {
                handleBackToWorkspace();
              }
            }}
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

            {/* Warning indicator */}
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

            {/* Gaze timer indicator */}
            {gazeViolationDuration > 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center justify-between text-yellow-500 mb-1">
                  <span className="text-xs font-bold uppercase">Gaze Timer</span>
                  <span className="text-sm font-mono">{gazeViolationDuration.toFixed(1)}s / 3.0s</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all duration-100"
                    style={{ width: `${Math.min(100, (gazeViolationDuration / 3) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Column: Quiz Content */}
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
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[currentQuestion] === index
                          ? 'border-sky-500 bg-sky-500'
                          : 'border-gray-600 group-hover:border-gray-500'
                        }`}>
                        {answers[currentQuestion] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
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
              gazeViolationDuration={gazeViolationDuration}
            />
          </div>
        </div>
      </div>

      {/* Violation Toast */}
      {showViolationToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-red-600/90 backdrop-blur-md border border-red-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] opacity-80">
                Integrity Violation
              </div>
              <div className="text-xl font-black uppercase italic tracking-tighter">
                {currentViolation}
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