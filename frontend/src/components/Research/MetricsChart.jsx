import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine,
} from 'recharts'

const MODEL_NAMES = {
  routing_classifier: 'Router',
  spiral_vgg16: 'Spiral VGG16',
  wave_vgg16: 'Wave VGG16',
  unified_vgg16: 'Unified VGG16',
  pahaw_pipeline: 'PaHaW',
}

const COLORS = ['#0D7377', '#0891B2', '#7C3AED', '#B45309', '#059669']

export default function MetricsChart({ metrics }) {
  if (!metrics) return null

  // Bar chart data
  const barData = Object.entries(metrics).map(([key, m], i) => ({
    name: MODEL_NAMES[key] || key,
    Accuracy: m.accuracy != null ? Math.round(m.accuracy * 100) : null,
    'ROC-AUC': m.roc_auc != null ? Math.round(m.roc_auc * 100) : null,
    F1: m.f1 != null ? Math.round(m.f1 * 100) : null,
    color: COLORS[i % COLORS.length],
  }))

  // ROC curve data — collect from models that have it
  const rocModels = Object.entries(metrics)
    .filter(([, m]) => m.roc_curve)
    .map(([key, m], i) => ({
      key,
      name: MODEL_NAMES[key] || key,
      curve: m.roc_curve,
      color: COLORS[i % COLORS.length],
    }))

  // Combine roc curve points (all share FPR x-axis values)
  const allFPR = [...new Set(rocModels.flatMap(m => m.curve.map(p => p[0])))].sort((a, b) => a - b)
  const rocData = allFPR.map(fpr => {
    const point = { fpr }
    rocModels.forEach(m => {
      const p = m.curve.find(c => c[0] === fpr)
      if (p) point[m.name] = parseFloat((p[1] * 100).toFixed(1))
    })
    return point
  })
  rocData.push({ fpr: 1.0, ...Object.fromEntries(rocModels.map(m => [m.name, 100])) })

  return (
    <div>
      {/* Bar chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h5 style={{ marginBottom: 16 }}>Performance Comparison</h5>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip
              formatter={(v) => `${v}%`}
              contentStyle={{
                fontSize: 12, fontFamily: 'var(--font-body)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-body)' }}
            />
            <Bar dataKey="Accuracy" fill="#0D7377" radius={[2, 2, 0, 0]} />
            <Bar dataKey="ROC-AUC" fill="#0891B2" radius={[2, 2, 0, 0]} />
            <Bar dataKey="F1" fill="#7C3AED" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROC curves */}
      {rocData.length > 0 && (
        <div className="card">
          <h5 style={{ marginBottom: 16 }}>ROC Curves</h5>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rocData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="fpr"
                tickFormatter={v => `${Math.round(v * 100)}%`}
                tick={{ fontSize: 10 }}
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 10 }}
                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{ fontSize: 11, border: '1px solid var(--color-border)', borderRadius: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {/* Reference diagonal */}
              <Line
                data={[{ fpr: 0, 'Random': 0 }, { fpr: 1, 'Random': 100 }]}
                dataKey="Random"
                stroke="#D1D5DB"
                strokeDasharray="4 4"
                dot={false}
              />
              {rocModels.map((m, i) => (
                <Line
                  key={m.key}
                  dataKey={m.name}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
