import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function SkillCategoryChart({ data, onSelect }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="category" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar
            dataKey="score"
            radius={[8, 8, 0, 0]}
            onClick={(data) => onSelect(data.category)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}