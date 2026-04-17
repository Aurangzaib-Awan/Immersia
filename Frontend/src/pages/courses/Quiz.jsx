
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

const getCsrfToken = () => {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const Quiz = ({ questions: propQuestions, quizId, userId, projectId }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackToWorkspace = useCallback(() => {
    stopProctoring();

    if (location.pathname.startsWith('/project-quiz')) {
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate('/projects');
      }
      return;
    }

    // Default: came from course workspace
    if (courseId) {
      navigate(`/courses/${courseId}/workspace`);
      return;
    }

    // Fallback: go back in history, or home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [location.pathname, courseId, navigate]);

  // ========================================================================
  // QUIZ STATE
  // ========================================================================
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizTerminated, setQuizTerminated] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // ========================================================================
  // QUIZ FREEZE STATE
  // ========================================================================
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUntil, setFrozenUntil] = useState(null);
  const [remainingTime, setRemainingTime] = useState("Loading...");

  // ========================================================================
  // PROCTORING STATE
  // ========================================================================
  const [chances, setChances] = useState(3);
  const [violationLogs, setViolationLogs] = useState([]);
  const [showViolationToast, setShowViolationToast] = useState(false);
  const [currentViolation, setCurrentViolation] = useState('');
  const [gazeViolationStart, setGazeViolationStart] = useState(null);
  const [gazeViolationDuration, setGazeViolationDuration] = useState(0);

  const gazeTimerRef = useRef(null);
  const lockTimeoutRef = useRef(null);
  const quizContainerRef = useRef(null);
  const freezeIntervalRef = useRef(null);
  const mouseOutsideRef = useRef(false);

  // ========================================================================
  // LOCK INTERFACE FUNCTION
  // ========================================================================
  const lockInterface = useCallback(() => {
    // Removed - no longer needed for simple solution
  }, []);

  // ========================================================================
  // ALERT HANDLER (depends on lockInterface)
  // ========================================================================
  const handleAlert = useCallback((data) => {
    const alertType = data.alert;
    if (alertType === 'none') return;

    console.log('🚨 VIOLATION DETECTED:', alertType);

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

    setChances(prev => {
      const next = Math.max(0, prev - 1);
      console.log(`💔 Chances: ${prev} → ${next}`);
      if (next === 0) {
        console.log('❌ QUIZ TERMINATED');
        setQuizTerminated(true);
        setQuizStarted(false);
      }
      return next;
    });
  }, []);

  // ========================================================================
  // BLOCK KEYBOARD SHORTCUTS (REMOVED - SIMPLIFIED)
  // ========================================================================
  // Keyboard blocking removed for simplified solution

  // ========================================================================
  // BRUTAL MOUSE BOUNDARY DETECTION - IMMEDIATE VIOLATION
  // ========================================================================
  useEffect(() => {
    if (!quizStarted || !quizContainerRef.current) return;

    const handleMouseMove = (e) => {
      const container = quizContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // BRUTAL: Check if mouse is ANYWHERE outside the quiz container - NO GRACE PERIOD
      const isOutsideBoundary =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      // Trigger violation IMMEDIATELY when mouse leaves, even briefly
      if (isOutsideBoundary && !mouseOutsideRef.current) {
        mouseOutsideRef.current = true;
        console.log('🖱️ BRUTAL: Mouse left quiz area IMMEDIATELY DETECTED', { clientX: e.clientX, clientY: e.clientY, rect });
        handleAlert({
          alert: 'mouse_left_quiz',
          behavior_status: 'Mouse left quiz area - Boundary violation detected'
        });
      } else if (!isOutsideBoundary && mouseOutsideRef.current) {
        // Only reset when mouse comes back inside
        mouseOutsideRef.current = false;
      }
    };

    // Detect when mouse completely leaves browser window
    const handleMouseLeave = () => {
      if (!mouseOutsideRef.current) {
        mouseOutsideRef.current = true;
        console.log('🖱️ CRITICAL: Mouse left browser window completely');
        handleAlert({
          alert: 'mouse_left_window',
          behavior_status: 'Mouse left the browser window - went to taskbar/system area'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [quizStarted, handleAlert]);

  // ========================================================================
  // WINDOW BLUR/FOCUS DETECTION - INSTANT TERMINATION
  // ========================================================================
  useEffect(() => {
    if (!quizStarted) return;

    const handleWindowBlur = () => {
      console.log('❌ Window lost focus - Terminating quiz');
      setQuizTerminated(true);
      setQuizStarted(false);
      handleAlert({
        alert: 'window_blur',
        behavior_status: 'User switched to another window/application'
      });
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [quizStarted, handleAlert]);

  // ========================================================================
  // CHECK QUIZ FREEZE STATUS (Call on mount to check if frozen)
  // ========================================================================
  useEffect(() => {
    if (!projectId || !userId) {
      console.log('⏭️ Skipping freeze check - missing projectId or userId');
      return;
    }

    console.log(`🔍 Checking freeze status for project: ${projectId}, user: ${userId}`);

    const checkFreezeStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/quiz/check-freeze/${projectId}/${userId}`);
        if (!res.ok) {
          console.error('Freeze check failed with status:', res.status);
          return;
        }
        
        const data = await res.json();
        console.log('📊 Freeze check response:', data);
        
        setIsFrozen(data.is_frozen);
        setFrozenUntil(data.frozen_until ? new Date(data.frozen_until) : null);
        setRemainingTime(data.remaining_time || "");
        
        if (data.is_frozen) {
          console.log(`🔒 PROJECT QUIZ IS FROZEN: ${data.message}`);
        } else {
          console.log('✅ Quiz is available (not frozen)');
        }
      } catch (err) {
        console.error('❌ Error checking quiz freeze status:', err);
      }
    };

    checkFreezeStatus();
  }, [projectId, userId]); // Only depends on projectId and userId

  // ========================================================================
  // COUNTDOWN TIMER FOR FROZEN QUIZ
  // ========================================================================
  useEffect(() => {
    if (!isFrozen || !frozenUntil) {
      return; // No need to update if not frozen
    }

    console.log('⏱️ Starting countdown timer for frozen quiz');

    const updateCountdown = () => {
      const now = new Date();
      const remaining = frozenUntil - now;
      
      if (remaining <= 0) {
        console.log('✅ Freeze period expired - quiz is now available');
        setIsFrozen(false);
        setRemainingTime(null);
        if (freezeIntervalRef.current) {
          clearInterval(freezeIntervalRef.current);
          freezeIntervalRef.current = null;
        }
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    freezeIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (freezeIntervalRef.current) {
        clearInterval(freezeIntervalRef.current);
        freezeIntervalRef.current = null;
      }
    };
  }, [isFrozen, frozenUntil]);

  // ========================================================================
  // TRACK QUIZ TERMINATION (when terminated before submission)
  // ========================================================================
  useEffect(() => {
    if (!quizTerminated || !quizId || !userId) return;

    console.log('📊 Tracking quiz termination as failed attempt...');

    const trackTermination = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/quiz/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            quiz_id: quizId,
            passed: false
          }),
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Termination tracked - freeze status:', data.is_frozen);
          if (data.is_frozen) {
            setIsFrozen(true);
            setFrozenUntil(data.frozen_until ? new Date(data.frozen_until) : null);
          }
        } else {
          console.error('Failed to track termination:', res.status);
        }
      } catch (err) {
        console.error('❌ Error tracking quiz termination:', err);
      }
    };

    trackTermination();
  }, [quizTerminated, quizId, userId]);

  // ========================================================================
  // GAZE TIMER
  // ========================================================================
  useEffect(() => {
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
        setChances(prev => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            console.log('❌ Quiz terminated - no chances remaining');
            setQuizTerminated(true);
            setQuizStarted(false);
          }
          return next;
        });
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
  // QUIZ DATA — only from props, no hardcoded fallback
  // ========================================================================
  const quizQuestions = propQuestions || [];

  // Guard: if no questions were passed in, show a clear error state
  if (!propQuestions || propQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[rgb(226,232,240)] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-2">No Questions Found</h2>
          <p className="text-[rgb(71,85,105)] text-sm mb-6">
            Quiz questions could not be loaded. Please go back and try again.
          </p>
          <button
            onClick={handleBackToWorkspace}
            className="w-full bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // QUIZ NAVIGATION
  // ========================================================================
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
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
  // SCORING (local fallback for course quizzes without a quizId)
  // ========================================================================
  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) correct++;
    });
    return {
      correct,
      total: quizQuestions.length,
      percentage: Math.round((correct / quizQuestions.length) * 100)
    };
  };

  // ========================================================================
  // QUIZ SUBMIT
  // ========================================================================
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    stopProctoring();

    const user_answers = quizQuestions.map((q, idx) => {
      const answerIndex = answers[idx];
      let selected_letter = null;
      if (typeof answerIndex === 'number') {
        selected_letter = String.fromCharCode(65 + answerIndex); // 0→A, 1→B …
      }
      return { question_id: q.id, selected_answer: selected_letter };
    });

    // No quizId = course quiz → score locally
    if (!quizId) {
      console.log('ℹ️ No quizId — using local scoring for course quiz');
      const calc = calculateScore();
      setSubmissionResult({
        score: calc.correct,
        total: calc.total,
        results: quizQuestions.map((q, idx) => ({
          question_id: q.id,
          is_correct: answers[idx] === q.correctAnswer,
          explanation: q.explanation || ''
        }))
      });
      setShowResults(true);
      setIsSubmitting(false);
      return;
    }

    // Has quizId = project quiz → submit to backend
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) console.warn('⚠️ CSRF token not found — request may be rejected');

      const res = await fetch('http://localhost:8000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
        },
        credentials: 'include',
        body: JSON.stringify({ quiz_id: quizId, user_id: userId, user_answers }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Submit failed:', res.status, errorData);
        if (res.status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setSubmissionResult(data);
      setShowResults(true);
    } catch (err) {
      console.error('❌ Quiz submission error:', err);
      alert(`Quiz submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // QUIZ CONTROL
  // ========================================================================
  const handleStartQuiz = () => {
    console.log('▶️ Starting quiz');
    setQuizStartTime(Date.now());
    startProctoring();
    setQuizStarted(true);
  };

  // ========================================================================
  // CLEANUP
  // ========================================================================
  useEffect(() => {
    return () => {
      stopProctoring();
      if (gazeTimerRef.current) clearInterval(gazeTimerRef.current);
      if (freezeIntervalRef.current) clearInterval(freezeIntervalRef.current);
    };
  }, [stopProctoring]);

  // ========================================================================
  // COPY & TAB SWITCH DETECTION
  // ========================================================================
  useEffect(() => {
    if (!quizStarted) return;

    const handleCopyEvent = () => {
      console.log('📋 Copy detected during quiz');
      handleAlert({ alert: 'copy_detected', behavior_status: 'copy_event' });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔁 Tab switched/hidden during quiz');
        handleAlert({ alert: 'tab_switch', behavior_status: 'visibility_hidden' });
      }
    };

    window.addEventListener('copy', handleCopyEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('copy', handleCopyEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizStarted, handleAlert]);

  // ========================================================================
  // RENDER: QUIZ TERMINATED
  // ========================================================================
  if (quizTerminated) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Quiz Terminated</h1>
          <p className="text-[rgb(71,85,105)] mb-4">
            Too many integrity violations were detected.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm font-medium">
              This attempt has been flagged and will be reviewed by your instructor.
            </p>
          </div>
          <button
            onClick={handleBackToWorkspace}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            {location.pathname.startsWith('/project-quiz') ? 'Return to Project Details' : 'Return to Workspace'}
          </button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: RESULTS
  // ========================================================================
  if (showResults) {
    let correct, total, percentage, resultsList;
    if (submissionResult) {
      correct = submissionResult.score;
      total = submissionResult.total;
      percentage = Math.round((correct / total) * 100);
      resultsList = submissionResult.results;
    } else {
      const calc = calculateScore();
      correct = calc.correct;
      total = calc.total;
      percentage = calc.percentage;
      resultsList = quizQuestions.map((q, idx) => ({
        question_id: q.id,
        is_correct: answers[idx] === q.correctAnswer,
        explanation: q.explanation || ''
      }));
    }
    const passed = percentage >= 70;
    const isProjectQuiz = location.pathname.startsWith('/project-quiz');

    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[rgb(15,23,42)]">Quiz Completed</h1>
            <p className="text-[rgb(71,85,105)]">Your assessment results are ready</p>
          </div>

          <div className="bg-white border border-[rgb(226,232,240)] rounded-2xl p-8 text-center">
            <div className={`w-24 h-24 rounded-full ${passed ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center mx-auto mb-6 border ${passed ? 'border-green-500/30' : 'border-red-500/30'}`}>
              {passed
                ? <CheckCircle className="w-12 h-12 text-green-500" />
                : <X className="w-12 h-12 text-red-500" />
              }
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Assessment Passed ✓' : 'Assessment Not Passed'}
            </h2>
            <div className="text-5xl font-bold mb-6 text-[rgb(15,23,42)]">{percentage}%</div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)]">
                <div className="text-2xl font-bold text-green-600">{correct}</div>
                <div className="text-[10px] uppercase font-bold text-[rgb(148,163,184)]">Correct</div>
              </div>
              <div className="p-4 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)]">
                <div className="text-2xl font-bold text-red-500">{total - correct}</div>
                <div className="text-[10px] uppercase font-bold text-[rgb(148,163,184)]">Incorrect</div>
              </div>
              <div className="p-4 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)]">
                <div className="text-2xl font-bold text-[rgb(37,99,235)]">{total}</div>
                <div className="text-[10px] uppercase font-bold text-[rgb(148,163,184)]">Total</div>
              </div>
            </div>

            {/* Proctoring Summary */}
            <div className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-4 mb-6">
              <h3 className="text-sm font-bold text-[rgb(148,163,184)] mb-3">Proctoring Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[rgb(148,163,184)]">Integrity Score:</span>
                  <span className="ml-2 font-bold text-[rgb(15,23,42)]">{chances}/3</span>
                </div>
                <div>
                  <span className="text-[rgb(148,163,184)]">Violations:</span>
                  <span className="ml-2 font-bold text-[rgb(15,23,42)]">{violationLogs.length}</span>
                </div>
              </div>
            </div>

            {/* Per-question feedback */}
            {resultsList && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Question Feedback</h3>
                <ul className="space-y-4">
                  {resultsList.map((r, idx) => {
                    const question = quizQuestions.find(q => q.id === r.question_id);
                    return (
                      <li key={idx} className="p-4 border rounded text-left">
                        <div className="font-semibold">
                          Q{idx + 1}: {question?.question}
                        </div>
                        <div>
                          {r.is_correct
                            ? <span className="text-green-600">Correct</span>
                            : <span className="text-red-600">Incorrect</span>
                          }
                        </div>
                        {r.explanation && (
                          <div className="mt-1 text-sm text-gray-700">
                            Explanation: {r.explanation}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button
              onClick={handleBackToWorkspace}
              className="bg-[rgb(37,99,235)] text-white font-bold py-3 px-8 rounded-xl hover:bg-[rgb(29,78,216)] transition-all"
            >
              {isProjectQuiz ? 'Back to Project Details' : 'Back to Workspace'}
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
    // Show frozen message if quiz is frozen
    if (isFrozen) {
      return (
        <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">Quiz Frozen</h2>
            <p className="text-[rgb(71,85,105)] mb-6">
              You have reached the maximum of 3 failed attempts on this quiz.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm font-medium mb-3">⏱️ Available in:</p>
              <div className="text-3xl font-bold text-red-600 font-mono">{remainingTime}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-600 text-sm">
                💡 Use this time to review the material and prepare for your next attempt.
              </p>
            </div>
            <button
              onClick={handleBackToWorkspace}
              className="w-full bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Back to Project
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[rgb(15,23,42)] mb-4">Course Assessment</h1>
            <p className="text-[rgb(71,85,105)]">Please review the instructions before starting</p>
          </div>

          <div className="bg-white border border-[rgb(226,232,240)] rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-sky-500" />
                  Quiz Info
                </h3>
                <ul className="space-y-3 text-sm text-[rgb(71,85,105)]">
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
                <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  AI Proctoring Rules
                </h3>
                <ul className="space-y-2 text-sm text-[rgb(71,85,105)]">
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
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-600 font-bold" />
                    <span className="font-semibold text-red-600">⚠️ Keep mouse INSIDE quiz area - any movement outside triggers violation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-500 font-medium">
                ⚠️ You have 3 chances. Each violation costs 1 chance. At 0 chances, the quiz will auto-terminate.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-500 font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                🖱️ CRITICAL: Mouse Boundary Rule
              </p>
              <p className="text-sm text-red-500 mt-2">
                Your mouse must stay INSIDE the quiz area at ALL times. Any movement outside (taskbar, other windows, search bar, etc.) will immediately trigger a violation and cost 1 chance.
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
    <div className="min-h-screen bg-[rgb(248,250,252)] text-[rgb(15,23,42)]">
      {/* Header */}
      <div className="h-16 border-b border-[rgb(226,232,240)] bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-[rgb(241,245,249)] rounded-lg text-xs font-bold text-[rgb(148,163,184)]">
            SECURE EXAM MODE
          </div>
          <div className="h-4 w-px bg-[rgb(226,232,240)]" />
          <h2 className="text-sm font-medium text-[rgb(71,85,105)]">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[rgb(148,163,184)]" />
            <span className="text-sm font-mono text-[rgb(71,85,105)]">
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
            className="text-[rgb(148,163,184)] hover:text-[rgb(15,23,42)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={quizContainerRef}
        className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10"
      >
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

            {gazeViolationDuration > 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center justify-between text-yellow-500 mb-1">
                  <span className="text-xs font-bold uppercase">Gaze Timer</span>
                  <span className="text-sm font-mono">{gazeViolationDuration.toFixed(1)}s / 3.0s</span>
                </div>
                <div className="w-full bg-[rgb(226,232,240)] rounded-full h-2 overflow-hidden">
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
            <div className="bg-white border border-[rgb(226,232,240)] rounded-3xl p-8 min-h-[400px] flex flex-col">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-8 leading-tight">
                  {currentQ.question}
                </h2>
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group ${answers[currentQuestion] === index
                          ? 'border-[rgb(37,99,235)] bg-blue-50 text-[rgb(15,23,42)]'
                          : 'border-[rgb(226,232,240)] bg-[rgb(248,250,252)] text-[rgb(71,85,105)] hover:border-[rgb(148,163,184)] hover:bg-[rgb(241,245,249)]'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[currentQuestion] === index
                          ? 'border-[rgb(37,99,235)] bg-[rgb(37,99,235)]'
                          : 'border-[rgb(226,232,240)] group-hover:border-[rgb(148,163,184)]'
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

              <div className="flex justify-between items-center mt-12 pt-8 border-t border-[rgb(226,232,240)]">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 rounded-xl font-bold text-[rgb(148,163,184)] hover:text-[rgb(15,23,42)] disabled:opacity-0 transition-all"
                >
                  Previous
                </button>

                <div className="flex gap-4">
                  {currentQuestion === quizQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting || Object.keys(answers).length < quizQuestions.length}
                      className="bg-[rgb(37,99,235)] text-white font-bold py-3 px-10 rounded-xl hover:bg-[rgb(29,78,216)] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="bg-[rgb(37,99,235)] text-white font-bold py-3 px-10 rounded-xl hover:bg-[rgb(29,78,216)] transition-all"
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
          <div className="bg-red-600 border border-red-500 text-white px-8 py-4 rounded-2xl flex items-center gap-4">
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