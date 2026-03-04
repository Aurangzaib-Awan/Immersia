import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Quiz from "../pages/courses/Quiz";
import { projectAPI } from "../services/api";

export default function QuizLauncher({ userId }) {
  const { projectId } = useParams();
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await projectAPI.generateQuiz(projectId, userId);
        setQuizId(data.quiz_id);
        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
        alert("Failed to generate quiz");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [projectId, userId]);

  if (loading) {
    return <div className="p-4">Generating your quiz...</div>;
  }
  if (!questions) {
    return <div className="p-4 text-red-600">Unable to load quiz.</div>;
  }

  return <Quiz questions={questions} quizId={quizId} userId={userId} />;
}
