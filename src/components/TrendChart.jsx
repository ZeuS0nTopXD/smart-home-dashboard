function chartPoints(data) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 78 - ((value - min) / range) * 52;
    return `${x},${y}`;
  }).join(' ');
}

export default function TrendChart({ data, stroke, label }) {
  return (
    <figure className="trend-card">
      <div className="trend-heading"><figcaption>{label}</figcaption><span className="trend-latest">{data[data.length - 1]}%</span></div>
      <svg className="trend-chart" role="img" aria-label={label} viewBox="0 0 100 88" preserveAspectRatio="none">
        <path d="M 0 78 H 100" className="chart-baseline" />
        <polyline points={chartPoints(data)} fill="none" stroke={stroke} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="trend-footnote"><span>08:00</span><span>Now</span></div>
    </figure>
  );
}
