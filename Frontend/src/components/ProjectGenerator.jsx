import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { projectAPI } from "../services/api";
import {
  Sparkles, Plus, X, BookOpen, CheckCircle,
  Clock, Layers, Target, ArrowRight, Code2,
  AlertCircle, Loader2, ChevronRight, ArrowLeft,
  Calendar, BarChart2, Tag, List
} from "lucide-react";

// ============================================================================
// MARKDOWN RENDERER (matches ProjectForm's MarkdownPreview exactly)
// ============================================================================
const MarkdownPreview = ({ content }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-[rgb(15,23,42)] mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[rgb(15,23,42)] mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-[rgb(15,23,42)] mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-[rgb(15,23,42)]">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-[rgb(71,85,105)]">$1</li>')
      .replace(/(<li.*?<\/li>)/gims, '<ul class="list-disc ml-6 my-2">$1</ul>')
      .replace(/\n/g, '<br>')
      .replace(/`(.*?)`/g, '<code class="bg-[rgb(241,245,249)] px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  };
  return (
    <div
      className="prose max-w-none text-[rgb(71,85,105)] leading-relaxed text-sm"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

// ============================================================================
// CONSTANTS
// ============================================================================
const DIFFICULTY_OPTIONS = [
  { value: "Beginner", desc: "Just starting out", border: "border-green-200", activeBorder: "border-green-500", activeBg: "bg-green-50", activeText: "text-green-700" },
  { value: "Intermediate", desc: "Some experience", border: "border-yellow-200", activeBorder: "border-yellow-500", activeBg: "bg-yellow-50", activeText: "text-yellow-700" },
  { value: "Advanced", desc: "Real-world complexity", border: "border-red-200", activeBorder: "border-red-500", activeBg: "bg-red-50", activeText: "text-red-700" },
];

const POPULAR_SKILLS = [
  "React", "Python", "Node.js", "FastAPI", "MongoDB",
  "TypeScript", "PostgreSQL", "Docker", "Vue.js", "Django",
  "Machine Learning", "REST API", "GraphQL", "Redis", "AWS",
  "Next.js", "Express.js", "Firebase", "Tailwind CSS", "Flutter"
];

const CATEGORY_COLORS = {
  "Web Development": "bg-blue-50 text-blue-700",
  "Mobile Development": "bg-purple-50 text-purple-700",
  "Data Science": "bg-teal-50 text-teal-700",
  "Machine Learning": "bg-orange-50 text-orange-700",
  "Cloud Computing": "bg-sky-50 text-sky-700",
  "DevOps": "bg-gray-100 text-gray-700",
  "Cyber Security": "bg-red-50 text-red-700",
  "Artificial Intelligence": "bg-violet-50 text-violet-700",
  "Blockchain": "bg-yellow-50 text-yellow-700",
  "Game Development": "bg-green-50 text-green-700",
};

const DIFFICULTY_BADGE = {
  "Beginner": "bg-green-50 text-green-700",
  "Intermediate": "bg-yellow-50 text-yellow-700",
  "Advanced": "bg-red-50 text-red-700",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function GenerateProjectPage({ userId }) {
  const navigate = useNavigate();

  const resolvedId = useMemo(() => {
    let id = userId;
    if (!id) {
      try {
        const obj = JSON.parse(localStorage.getItem('user') || '{}');
        id = obj.id || obj._id || obj.user_id;
      } catch { }
    }
    return id;
  }, [userId]);

  // Form state
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // ========================================================================
  // SKILL MANAGEMENT
  // ========================================================================
  const addSkill = (val) => {
    const v = (val || skillInput).trim();
    if (v && !skills.includes(v)) {
      setSkills(prev => [...prev, v]);
      setError("");
    }
    setSkillInput("");
  };

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  // ========================================================================
  // GENERATE
  // ========================================================================
  const generate = async () => {
    if (!resolvedId) { setError("Please log in to generate a project"); return; }
    if (skills.length === 0) { setError("Please add at least one skill to continue"); return; }
    setError("");
    setLoading(true);
    setProject(null);
    try {
      const data = await projectAPI.generateUserProject(resolvedId, skills, difficulty);
      setProject(data);
      setActiveTab("overview");
    } catch (err) {
      setError(`Generation failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // MARK COMPLETE
  // ========================================================================
  // ========================================================================
  // RENDER: PROJECT RESULT
  // ========================================================================
  if (project) {
    const technologies = project.technologies || project.skills || [];
    const tasks = project.tasks || [];
    const prerequisites = project.prerequisites || [];
    const catColor = CATEGORY_COLORS[project.category] || "bg-blue-50 text-blue-700";
    const diffColor = DIFFICULTY_BADGE[project.difficulty] || "bg-yellow-50 text-yellow-700";

    const TABS = [
      { id: "overview", label: "Overview", icon: BookOpen },
      { id: "tasks", label: `Tasks (${tasks.length})`, icon: List },
      { id: "prerequisites", label: "Prerequisites", icon: Layers },
      { id: "outcomes", label: "Outcomes", icon: Target },
    ];

    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => { setProject(null); setSkills([]); setError(""); }}
              className="flex items-center gap-2 bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Generate New Project
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              ● In Progress
            </span>
          </div>

          {/* Hero Card */}
          <div className="bg-white border border-[rgb(226,232,240)] rounded-2xl p-8 mb-5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {project.category && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor}`}>
                  <Tag className="inline w-3 h-3 mr-1" />{project.category}
                </span>
              )}
              {project.difficulty && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${diffColor}`}>
                  <BarChart2 className="inline w-3 h-3 mr-1" />{project.difficulty}
                </span>
              )}
              {project.duration && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgb(241,245,249)] text-[rgb(71,85,105)]">
                  <Calendar className="inline w-3 h-3 mr-1" />{project.duration}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-3">
              {project.title || project.project_title}
            </h1>

            {/* Short description */}
            {project.description && (
              <p className="text-[rgb(71,85,105)] mb-5 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Technologies */}
            {technologies.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[rgb(148,163,184)] uppercase mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((t, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-3 py-1 bg-[rgb(241,245,249)] text-[rgb(71,85,105)] text-xs rounded-full border border-[rgb(226,232,240)]"
                    >
                      <Code2 className="w-3 h-3" />{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-[rgb(226,232,240)] rounded-xl p-1 mb-5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id
                  ? 'bg-[rgb(37,99,235)] text-white shadow-sm'
                  : 'text-[rgb(148,163,184)] hover:text-[rgb(15,23,42)]'
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-[rgb(226,232,240)] rounded-2xl p-8 mb-5 min-h-[300px]">

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-base font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[rgb(37,99,235)]" />
                  Project Description
                </h2>
                {project.project_description
                  ? <MarkdownPreview content={project.project_description} />
                  : <p className="text-[rgb(148,163,184)] text-sm italic">No description generated.</p>
                }
              </div>
            )}

            {/* ── TASKS ── */}
            {activeTab === "tasks" && (
              <div>
                <h2 className="text-base font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                  <List className="w-4 h-4 text-[rgb(37,99,235)]" />
                  Step-by-Step Implementation Tasks
                </h2>
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)] hover:border-[rgb(37,99,235)]/30 transition-colors"
                      >
                        <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-[rgb(71,85,105)] leading-relaxed">{task}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[rgb(148,163,184)] text-sm italic">No tasks generated.</p>
                )}
              </div>
            )}

            {/* ── PREREQUISITES ── */}
            {activeTab === "prerequisites" && (
              <div>
                <h2 className="text-base font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[rgb(37,99,235)]" />
                  Prerequisites
                </h2>
                {prerequisites.length > 0 ? (
                  <div className="space-y-2">
                    {prerequisites.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)]"
                      >
                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-sm text-[rgb(71,85,105)]">{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[rgb(148,163,184)] text-sm italic">No prerequisites listed.</p>
                )}
              </div>
            )}

            {/* ── OUTCOMES ── */}
            {activeTab === "outcomes" && (
              <div>
                <h2 className="text-base font-bold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[rgb(37,99,235)]" />
                  Learning Outcomes
                </h2>
                {project.learning_outcomes
                  ? <MarkdownPreview content={project.learning_outcomes} />
                  : <p className="text-[rgb(148,163,184)] text-sm italic">No outcomes listed.</p>
                }
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/projects/${project.project_id}/workspace`)}
              className="flex-1 flex items-center justify-center gap-2 bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-bold py-3.5 px-6 rounded-xl transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Start Project
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: GENERATION FORM
  // ========================================================================
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[rgb(37,99,235)]" />
          </div>
          <h1 className="text-3xl font-bold text-[rgb(15,23,42)] mb-2">AI Project Generator</h1>
          <p className="text-[rgb(71,85,105)]">
            Enter your skills and we'll generate a complete real-world project plan
          </p>
        </div>

        <div className="bg-white border border-[rgb(226,232,240)] rounded-3xl p-8 shadow-sm space-y-8">

          {/* ── STEP 1: Skills ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[rgb(15,23,42)] mb-3">
              <span className="w-6 h-6 bg-[rgb(37,99,235)] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              Your Skills
              <span className="text-[rgb(148,163,184)] font-normal text-xs">— press Enter or click Add</span>
            </label>

            {/* Tag input box */}
            <div className={`min-h-[54px] flex flex-wrap gap-2 items-center p-3 rounded-xl border-2 transition-all ${error && skills.length === 0
              ? 'border-red-300 bg-red-50'
              : 'border-[rgb(226,232,240)] bg-[rgb(248,250,252)] focus-within:border-[rgb(37,99,235)] focus-within:bg-white'
              }`}>
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-700 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)]"
                placeholder={skills.length === 0 ? "e.g. React, Python, MongoDB..." : "Add more skills..."}
              />
              {skillInput.trim() && (
                <button
                  onClick={() => addSkill()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[rgb(37,99,235)] text-white text-xs rounded-lg font-medium"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>

            {/* Popular skills */}
            <div className="mt-3">
              <p className="text-xs text-[rgb(148,163,184)] mb-2">Quick add popular skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="px-2.5 py-1 text-xs border border-[rgb(226,232,240)] text-[rgb(71,85,105)] rounded-full hover:border-blue-300 hover:text-[rgb(37,99,235)] hover:bg-blue-50 transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── STEP 2: Difficulty ── */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[rgb(15,23,42)] mb-3">
              <span className="w-6 h-6 bg-[rgb(37,99,235)] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map(opt => {
                const active = difficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center ${active
                      ? `${opt.activeBorder} ${opt.activeBg}`
                      : `${opt.border} hover:border-[rgb(148,163,184)]`
                      }`}
                  >
                    <span className={`text-sm font-bold ${active ? opt.activeText : 'text-[rgb(15,23,42)]'}`}>
                      {opt.value}
                    </span>
                    <span className="text-[10px] text-[rgb(148,163,184)] mt-0.5 leading-tight">
                      {opt.desc}
                    </span>
                    {active && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[rgb(37,99,235)] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Summary pill */}
          {skills.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl text-sm text-[rgb(71,85,105)]">
              <Sparkles className="w-4 h-4 text-[rgb(37,99,235)] shrink-0" />
              Generating a <strong className="text-[rgb(15,23,42)]">{difficulty}</strong> project
              using <strong className="text-[rgb(15,23,42)]">{skills.slice(0, 3).join(", ")}{skills.length > 3 ? ` +${skills.length - 3} more` : ""}</strong>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading || skills.length === 0}
            className="w-full flex items-center justify-center gap-3 bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all text-base"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Generating Your Project...</>
            ) : (
              <><Sparkles className="w-5 h-5" />Generate My Project<ChevronRight className="w-5 h-5" /></>
            )}
          </button>

          {loading && (
            <p className="text-center text-xs text-[rgb(148,163,184)] -mt-4">
              Gemini AI is crafting a personalized project — usually takes 10–20 seconds...
            </p>
          )}

        </div>
      </div>
    </div>
  );
}