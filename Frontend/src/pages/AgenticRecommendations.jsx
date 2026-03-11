import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Sparkles, Code, CheckSquare, ArrowRight, RefreshCw } from 'lucide-react';
import { agentAPI } from '../services/api';

function AgenticRecommendations() {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentAPI.getRecommendation();
      setRecommendation({
        ...data.recommendation,
        knownTopics: data.knownTopics,
        unknownTopics: data.unknownTopics,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[rgb(37,99,235)] mb-2">
  AI Project Recommendation
</h1>

          <p className="text-[rgb(71,85,105)]">
            Based on your profile and skill gaps, here's what you should build next.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-[rgb(226,232,240)] rounded-2xl p-8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[rgb(37,99,235)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[rgb(241,245,249)] rounded-2xl rounded-tl-none px-5 py-4 max-w-sm">
                <div className="flex items-center gap-2 text-[rgb(71,85,105)] text-sm">
                  <div className="w-2 h-2 bg-[rgb(37,99,235)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[rgb(37,99,235)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[rgb(37,99,235)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1">Analyzing your profile...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchRecommendation}
              className="flex items-center gap-2 mx-auto text-[rgb(37,99,235)] font-semibold hover:underline"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        )}

        {/* Recommendation */}
        {!loading && !error && recommendation && (
          <div className="bg-white border border-[rgb(226,232,240)] rounded-2xl p-8">

            {/* Agent bubble */}
            <div className="flex items-start gap-3 mb-8">
              <div className="w-9 h-9 rounded-full bg-[rgb(37,99,235)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[rgb(241,245,249)] rounded-2xl rounded-tl-none px-5 py-4">
                <p className="text-[rgb(15,23,42)] text-sm leading-relaxed">
                  I analyzed your profile. You already know{' '}
                  <span className="font-semibold text-[rgb(37,99,235)]">
                    {recommendation.knownTopics?.join(', ') || 'no topics yet'}
                  </span>
                  , and you still need to learn{' '}
                  <span className="font-semibold text-red-500">
                    {recommendation.unknownTopics?.join(', ') || 'nothing — you are all caught up!'}
                  </span>
                  . Here's the project I recommend to close that gap.
                </p>
              </div>
            </div>

            {/* Project Card */}
            <div className="border border-[rgb(226,232,240)] rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[rgb(37,99,235)]" />
                <h2 className="text-xl font-bold text-[rgb(15,23,42)]">
                  {recommendation.title}
                </h2>
              </div>
              <p className="text-[rgb(71,85,105)] text-sm mb-5">
                {recommendation.description}
              </p>

              {/* Technologies */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-[rgb(37,99,235)]" />
                  <span className="text-sm font-semibold text-[rgb(15,23,42)]">Technologies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendation.technologies?.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-[rgb(37,99,235)] px-3 py-1 rounded-full border border-[rgb(37,99,235)]/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills you'll learn */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[rgb(37,99,235)]" />
                  <span className="text-sm font-semibold text-[rgb(15,23,42)]">Skills you'll learn</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendation.technologies?.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="w-4 h-4 text-[rgb(37,99,235)]" />
                  <span className="text-sm font-semibold text-[rgb(15,23,42)]">Tasks</span>
                </div>
                <ul className="space-y-2">
                  {recommendation.tasks?.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[rgb(71,85,105)]">
                      <span className="text-[rgb(37,99,235)] font-bold mt-0.5">{i + 1}.</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="flex-1 flex items-center justify-center gap-2 bg-[rgb(37,99,235)] text-white font-semibold py-3 rounded-xl hover:bg-[rgb(29,78,216)] transition-all duration-200"
              >
                Go to Projects <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={fetchRecommendation}
                className="flex items-center justify-center gap-2 border border-[rgb(226,232,240)] text-[rgb(71,85,105)] font-semibold py-3 px-5 rounded-xl hover:border-[rgb(37,99,235)] hover:text-[rgb(37,99,235)] transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgenticRecommendations;