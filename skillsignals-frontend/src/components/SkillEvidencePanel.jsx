
export default function SkillEvidencePanel({ category, skillMap, categorySkills }) {
  if (!category) return null;

  return (
    <div className="card">
      <h2>{category} Evidence</h2>
      {categorySkills.map((skill) => {
        const key = skill.toLowerCase();
        const data = skillMap?.[key];
        if (!data) return null;

        return (
          <div key={skill} className="skill-row">
            <strong>{skill}</strong>
            <div className="evidence">
              <span>Resume: {data.resume ? "Found ✅" : "Missing ❌"}</span>
              <span>GitHub: {data.github > 0 ? `Used (${data.github})` : "Not found ❌"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}