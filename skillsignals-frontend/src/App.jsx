import { useState } from "react";
import SkillCategoryChart from "./components/SkillCategoryChart";

const SKILL_CATEGORIES = {
  Frontend: ["HTML", "CSS", "JavaScript", "React"],
  Backend: ["Python", "FastAPI", "Node"],
  Tooling: ["Git", "GitHub"],
};

// Map frontend labels → backend lowercase keys
const KEY_MAP = {
  HTML: "html",
  CSS: "css",
  JavaScript: "javascript",
  React: "react",
  Python: "python",
  FastAPI: "fastapi",
  Node: "node",
  Git: "git",
  GitHub: "github",
};

export default function App() {
  const [github, setGithub] = useState("");
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!github || !resume) {
      alert("Please enter GitHub username and upload resume");
      return;
    }

    const formData = new FormData();
    formData.append("github_username", github);
    formData.append("resume_file", resume);

    setLoading(true);
   

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Backend response:", data);
      setResult(data);
      
    } catch (err) {
      console.error("Analyze failed", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Build chart data per category
  const buildChartData = () => {
  if (!result?.skill_map) return [];

  return Object.entries(SKILL_CATEGORIES).map(
    ([category, skills]) => {
      let total = 0;
      let count = 0;

      skills.forEach(skill => {
        const backendKey = KEY_MAP[skill];
        const raw = result.skill_map[backendKey];

        if (raw !== undefined) {
          const value = Number(raw);

          // fallback if backend sends non-numeric
          total += Number.isNaN(value) ? 70 : value;
          count++;
        }
      });

      return {
        category,
        score: count > 0 ? Math.round(total / count) : 0,
      };
    }
  );
};

  // Calculate missing skills
  const missingSkills = result?.skill_map
    ? Object.values(SKILL_CATEGORIES)
        .flat()
        .filter(skill => {
          const backendKey = KEY_MAP[skill];
          return result.skill_map[backendKey] === undefined;
        })
    : [];

  return (
    <div className="container">
      <h1>SkillSignal</h1>

      <div className="card">
        <input
          placeholder="GitHub username"
          value={github}
          onChange={e => setGithub(e.target.value)}
        />
        <br /><br />

        <input
          type="file"
          accept="application/pdf"
          onChange={e => setResume(e.target.files[0])}
        />
        <br /><br />

        <button onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {result && (
        <>
          <div className="card">
            <h2>Skill Overview</h2>
            <p className="muted">
              Average proficiency by category
            </p>
            <SkillCategoryChart data={buildChartData()} />
          </div>

          <div className="card">
            <h2>Skill Gaps</h2>
            <div className="chips">
              {missingSkills.length === 0 && (
                <span className="chip success">No major gaps 🎉</span>
              )}
              {missingSkills.map(skill => (
                <span className="chip danger" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


