
import { useState, useRef } from "react";
import SkillCategoryChart from "./components/SkillCategoryChart";
import SkillEvidencePanel from "./components/SkillEvidencePanel";
import LearningRoadmap from "./components/LearningRoadmap";

const SKILL_CATEGORIES = {
  Frontend: ["HTML", "CSS", "JavaScript", "React"],
  Backend: ["Python", "FastAPI", "SQL"],
  Tooling: ["Git", "Docker"],
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
  SQL: "sql",
  Docker: "docker",
};

export default function App() {
  const [github, setGithub] = useState("");
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // refs for smooth scroll
  const categoryRefs = {
    Frontend: useRef(),
    Backend: useRef(),
    Tooling: useRef(),
  };

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
      setResult(data);
    } catch (err) {
      console.error("Analyze failed", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Build chart data
  const buildChartData = () => {
    if (!result?.skill_map) return [];

    return Object.entries(SKILL_CATEGORIES).map(([category, skills]) => {
      let total = 0;
      let count = 0;

      skills.forEach((skill) => {
        const backendKey = KEY_MAP[skill];
        const raw = result.skill_map[backendKey];
        if (raw !== undefined) {
          total += Number(raw.score ?? raw); // fallback
          count++;
        }
      });

      return {
        category,
        score: count > 0 ? Math.round(total / count) : 0,
      };
    });
  };

  // Compute missing skills for roadmap
  const computeScore = (data) => {
    let score = 0;
    if (data.resume) score += 40;
    if (data.github > 0) score += 60;
    return Math.min(score, 100);
  };

  const missingSkills = result?.skill_map
    ? Object.entries(result.skill_map)
        .filter(([_, data]) => computeScore(data) < 70)
        .map(([skill]) => skill)
    : [];

  // Job readiness
  const readiness = result
    ? Math.round(
        Object.values(result.skill_map)
          .map(computeScore)
          .reduce((a, b) => a + b, 0) / Object.keys(result.skill_map).length
      )
    : 0;

  return (
    <div className="container">
      <h1>SkillSignal</h1>

      <div className="card">
        <input
          placeholder="GitHub username"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
        />
        <br />
        <br />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResume(e.target.files[0])}
        />
        <br />
        <br />
        <button onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {result && (
        <>
          {/* Skill Overview */}
          <div className="card">
            <h2>Skill Overview</h2>
            <p className="muted">Average proficiency by category</p>
            <SkillCategoryChart
              data={buildChartData()}
              onSelect={(cat) => {
                setSelectedCategory(cat);
                categoryRefs[cat].current.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>

          {/* Evidence Panel */}
          {selectedCategory && result && (
            <div ref={categoryRefs[selectedCategory]}>
              <SkillEvidencePanel
                category={selectedCategory}
                skillMap={result.skill_map}
                categorySkills={SKILL_CATEGORIES[selectedCategory]}
              />
            </div>
          )}

                   {selectedCategory && (
  <div className="card">
    <h2>{selectedCategory} Skill Scores</h2>

    {SKILL_CATEGORIES[selectedCategory].map(skill => {
      const backendKey = KEY_MAP[skill];
      const data = result.skill_map?.[backendKey];

      if (!data) return null;

      return (
        <div key={skill} className="skill-block">
  <div className="skill-header">
    <span>{skill}</span>
    <span className="score">{data.score}%</span>
  </div>

  <div className="tooltip-wrapper">
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{
        width: `${data.score}%`,
         backgroundColor:
          data.score >= 70
            ? "#22c55e"
            : data.score >= 40
            ? "#eab308"
            : "#ef4444",
      }}
    />
  </div>

        <div className="tooltip">
          <strong>Score breakdown</strong>
          <div>📄 Resume: {data.resume ? "+40" : "0"}</div>
          <div>💻 GitHub: {data.github > 0 ? "+60" : "0"}</div>
        </div>
      </div>
      </div>
              
          );
        })}
      </div>
      )}


       <div className="card">
            <h2>Skill Gaps</h2>
            <div className="chips">
              {missingSkills.length === 0 && (
                <span className="chip success">No major gaps 🎉</span>
              )}
              {missingSkills.map(skill => (
                <span className="chip danger" key={skill}>
                  {skill+" "}
                </span>
              ))}
            </div>
          </div>

          {/* Learning Roadmap */}
          <LearningRoadmap skillMap={result.skill_map} />

          {/* Job Readiness */}
          <div className="card">
            <h2>💼 Job Readiness</h2>
            <p>Your readiness score: {readiness}%</p>
          </div>
        </>
      )}
    </div>
  );
}
