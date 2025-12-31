

import { useState } from "react";
import { ROADMAP } from "../data/roadmap";

export default function LearningRoadmap({ skillMap }) {
  if (!skillMap) return null;

  const computeScore = (data) => {
    let score = 0;
    if (data.resume) score += 40;
    if (data.github > 0) score += 60;
    return Math.min(score, 100);
  };

  const missingSkills = [];
  const improvingSkills = [];

  Object.entries(skillMap).forEach(([skill, data]) => {
    const score = computeScore(data);
    if (score < 40) missingSkills.push({ skill, score });
    else if (score < 70) improvingSkills.push({ skill, score });
  });

  if (missingSkills.length === 0 && improvingSkills.length === 0) {
    return (
      <div className="card success">🎉 No learning gaps detected. You’re doing great!</div>
    );
  }

  const SkillRow = ({ skill, score }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="roadmap-skill">
        <h3 onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
          {skill.toUpperCase()} — {score}% {score < 40 ? "❌" : "⚠️"}
        </h3>
        {open && (
          <ul>
            {(ROADMAP[skill] || []).map((item, i) =>
              item.url ? (
                <li key={i}>
                  <a href={item.url} target="_blank">{item.title}</a>
                </li>
              ) : (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
        )}
      </div>
    );
  };

  const renderSkillList = (skills) =>
    skills.map(({ skill, score }) => <SkillRow key={skill} {...{ skill, score }} />);

  return (
    <div className="card">
      <h2>📚 Learning Roadmap</h2>
      {missingSkills.length > 0 && (
        <>
          <h3>Missing Skills ❌</h3>
          {renderSkillList(missingSkills)}
        </>
      )}
      {improvingSkills.length > 0 && (
        <>
          <h3>Improving Skills ⚠️</h3>
          {renderSkillList(improvingSkills)}
        </>
      )}
    </div>
  );
}