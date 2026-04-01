export default function Stars({ rating = 0, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0", fontSize: size }}>★</span>
      ))}
      <span style={{ fontSize: size - 1, color: "#94a3b8", marginLeft: 4 }}>
        {Number(rating || 0).toFixed(1)}
      </span>
    </span>
  );
}
