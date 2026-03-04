import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { projectAPI } from "../services/api";

export default function ProjectGenerator({ userId }) {
  // Memoize user ID resolution to prevent logging on every render
  const resolvedId = useMemo(() => {
    let id = userId;
    if (!id) {
      try {
        const obj = JSON.parse(localStorage.getItem('user') || '{}');
        id = obj.id || obj._id || obj.user_id;
      } catch {
        // ignore
      }
    }
    if (id) {
      console.log('Resolved user_id:', id);
    }
    return id;
  }, [userId]);

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setSkillInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const generate = async () => {
    console.log('Sending skills:', skills, 'Type:', typeof skills, 'IsArray:', Array.isArray(skills));
    console.log('Sending user_id (prop):', userId, 'resolved:', resolvedId);

    if (!resolvedId) {
      console.error('User not logged in or user ID not found');
      alert('Please log in to generate a project');
      return;
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      alert('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const payload = { user_id: resolvedId, skills };
      console.log('Final payload:', payload);
      const data = await projectAPI.generateUserProject(resolvedId, skills);
      console.log('Generate API success:', data);
      setProject(data);
    } catch (err) {
      console.error('Full error:', err);
      alert(`Failed to generate project: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const markComplete = async () => {
    if (!project || !project.project_id) return;
    try {
      const updated = await projectAPI.completeUserProject(project.project_id);
      setProject({ ...project, status: "completed", completed_at: new Date().toISOString(), ...updated });
    } catch (err) {
      console.error(err);
      alert("Failed to mark complete");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Skills</label>
        <div className="flex flex-wrap gap-2">
          {skills.map((s, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
            >
              <span>{s}</span>
              <button
                onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex mt-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded-l px-2 py-1"
            placeholder="Type a skill and press Enter"
          />
          <button
            onClick={addSkill}
            className="bg-blue-600 text-white px-4 rounded-r"
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading || skills.length === 0}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate My Project"}
      </button>

      {project && (
        <div className="mt-6 bg-white shadow rounded p-4">
          <h2 className="text-2xl font-bold mb-2">
            {project.project_title}
          </h2>
          <p className="mb-4">{project.project_description}</p>

          <div className="mb-4">
            <h3 className="font-semibold">Tech Stack</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {project.skills.map((t, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {project.tasks && project.tasks.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold">Tasks</h3>
              <ul className="mt-1">
                {project.tasks.map((task, idx) => (
                  <li key={idx} className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.learning_outcomes && (
            <div className="mb-4">
              <h3 className="font-semibold">Learning Outcomes</h3>
              <ul className="list-disc list-inside mt-1">
                {project.learning_outcomes.split("\n").map((lo, idx) => (
                  <li key={idx}>{lo}</li>
                ))}
              </ul>
            </div>
          )}

          {project.status !== "completed" ? (
            <button
              onClick={markComplete}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Mark as Complete
            </button>
          ) : (
            <button
              onClick={() => navigate(`/project-quiz/${project.project_id}`)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Take Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
