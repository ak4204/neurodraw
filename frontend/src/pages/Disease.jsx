import { Link } from 'react-router-dom'
import { Brain, Users, Activity, Microscope, Heart, BookOpen, ArrowRight, Dna, Pill } from 'lucide-react'

const STATS = [
  { value: '10M+', label: 'people worldwide live with Parkinson\'s' },
  { value: '60+', label: 'typical age of onset (early-onset: <50)' },
  { value: '#2', label: 'most common neurodegenerative disorder' },
]

const MOTOR_SYMPTOMS = [
  { name: 'Resting tremor', description: 'Involuntary shaking of a limb at rest, often the "pill-rolling" motion of the hand' },
  { name: 'Bradykinesia', description: 'Slowness of movement — reduced arm swing, shuffling gait, difficulty initiating movement' },
  { name: 'Rigidity', description: 'Muscle stiffness or resistance to movement, often causing aching or pain' },
  { name: 'Postural instability', description: 'Impaired balance and coordination, increasing fall risk in later stages' },
  { name: 'Micrographia', description: 'Handwriting becomes progressively smaller and more cramped — a key biomarker this platform targets' },
  { name: 'Hypophonia', description: 'Voice becomes softer and less distinct due to weakened respiratory and laryngeal muscles' },
]

const NON_MOTOR_SYMPTOMS = [
  { name: 'Sleep disturbances', description: 'REM sleep behavior disorder, excessive daytime sleepiness, insomnia' },
  { name: 'Cognitive changes', description: 'Mild cognitive impairment in some patients; Parkinson\'s dementia in later stages' },
  { name: 'Mood disorders', description: 'Depression (affects ~40%) and anxiety are among the most common non-motor symptoms' },
  { name: 'Autonomic dysfunction', description: 'Constipation, orthostatic hypotension, bladder problems, excessive sweating' },
  { name: 'Anosmia', description: 'Loss of sense of smell — often one of the earliest pre-motor symptoms, appearing years before diagnosis' },
  { name: 'Pain', description: 'Central and peripheral pain syndromes are underrecognized but common in PD' },
]

const STAGES = [
  {
    num: 'I',
    name: 'Minimal',
    group: 'early',
    description: 'Symptoms on one side of the body only (unilateral). Tremor or other symptoms but no balance impairment. Often subtle — may be dismissed.',
  },
  {
    num: 'II',
    name: 'Mild',
    group: 'early',
    description: 'Bilateral symptoms (both sides). Gait and posture may be affected. Daily activities still manageable independently.',
  },
  {
    num: 'III',
    name: 'Moderate',
    group: 'middle',
    description: 'Balance impairment. Mild to moderate disability but still fully independent. Falls become a concern.',
  },
  {
    num: 'IV',
    name: 'Severe',
    group: 'advanced',
    description: 'Severely disabling. Can stand and walk unaided but is significantly limited. Often requires assistance with daily activities.',
  },
  {
    num: 'V',
    name: 'Advanced',
    group: 'advanced',
    description: 'Confined to wheelchair or bed without assistance. Requires full-time nursing care. Significant cognitive decline may be present.',
  },
]

const DIAGNOSIS_METHODS = [
  { name: 'Clinical examination', description: 'Neurologist assesses motor signs, medical history, and drug response. No definitive test exists — diagnosis is clinical.' },
  { name: 'UPDRS scale', description: 'Unified Parkinson\'s Disease Rating Scale — standardized assessment of motor and non-motor symptoms across 4 sections.' },
  { name: 'DaTscan', description: 'SPECT imaging that visualizes dopamine transporter function — helpful in distinguishing PD from essential tremor.' },
  { name: 'Response to levodopa', description: 'Dramatic improvement with levodopa strongly supports a PD diagnosis over other Parkinsonian syndromes.' },
]

const TREATMENTS = [
  {
    category: 'Pharmacological',
    items: [
      'Levodopa/Carbidopa — most effective, the gold standard; "wearing off" phenomenon develops over time',
      'Dopamine agonists — pramipexole, ropinirole; useful early or as adjuncts',
      'MAO-B inhibitors — rasagiline, selegiline; slow dopamine breakdown',
      'COMT inhibitors — entacapone; extend levodopa effect',
    ],
  },
  {
    category: 'Surgical',
    items: [
      'Deep Brain Stimulation (DBS) — high-frequency electrode implanted in subthalamic nucleus or globus pallidus; effective for tremor and dyskinesia',
      'Focused Ultrasound — non-invasive lesioning; approved for tremor-dominant PD',
    ],
  },
  {
    category: 'Rehabilitation',
    items: [
      'Physiotherapy — gait training, LSVT BIG amplitude-focused exercises',
      'Occupational therapy — adaptive strategies for daily living',
      'Speech therapy — LSVT LOUD voice amplitude training',
      'Exercise — evidence supports that regular aerobic exercise may slow progression',
    ],
  },
]

const RESOURCES = [
  { name: "Parkinson's Foundation", url: 'https://www.parkinson.org', description: 'Global leader in PD research, care, and advocacy' },
  { name: 'Michael J. Fox Foundation', url: 'https://www.michaeljfox.org', description: 'Largest private funder of Parkinson\'s research globally' },
  { name: 'NHS: Parkinson\'s disease', url: 'https://www.nhs.uk/conditions/parkinsons-disease/', description: 'UK National Health Service patient information' },
  { name: 'EPDA (European Parkinson\'s Disease Association)', url: 'https://www.epda.eu.com', description: 'European advocacy and support network' },
]

function SectionHeading({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--r-sm)',
        background: 'var(--c-purple-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--c-purple)',
      }}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--c-ink)' }}>{title}</h2>
    </div>
  )
}

function CalloutBox({ children, variant = 'teal' }) {
  const bg = variant === 'teal' ? 'var(--c-cyan-light)' : 'var(--c-warning-bg)'
  const border = variant === 'teal' ? 'var(--c-cyan)' : 'var(--c-warning)'
  const color = variant === 'teal' ? '#0b888c' : '#c28607'
  return (
    <div style={{
      background: bg, border: `1px solid rgba(0,0,0,0.05)`,
      borderLeft: `4px solid ${border}`,
      borderRadius: 'var(--r-md)',
      padding: '14px 16px',
      color,
      fontSize: '0.9rem',
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  )
}

export default function Disease() {
  return (
    <div className="main-content flex-col" style={{ maxWidth: 900, margin: '0 auto', padding: '40px' }}>
      {/* Hero */}
      <div style={{
        marginBottom: 48,
        paddingBottom: 32,
        borderBottom: '1px solid #edf2f7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="trend-badge trend-pos" style={{ background: 'var(--c-purple-light)', color: 'var(--c-purple)' }}>Condition Overview</span>
          <span style={{ color: 'var(--c-ink-muted)', fontSize: '0.875rem' }}>·</span>
          <span style={{ color: 'var(--c-ink-muted)', fontSize: '0.875rem' }}>Not about the app — about the condition</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: 12, color: 'var(--c-ink)' }}>
          Understanding<br />
          <em style={{ fontStyle: 'italic', color: 'var(--c-purple)' }}>Parkinson's Disease</em>
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--c-ink-muted)', lineHeight: 1.7, maxWidth: 680, marginBottom: 28 }}>
          Parkinson's disease is a progressive neurological disorder affecting movement, balance,
          and increasingly recognized non-motor systems. It is the second most common
          neurodegenerative disorder after Alzheimer's disease, affecting an estimated
          10 million people worldwide.
        </p>

        {/* Stats */}
        <div className="grid-3" style={{ gap: 16 }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--c-purple)',
                marginBottom: 4,
              }}>
                {value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--c-ink-muted)', lineHeight: 1.4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. What is Parkinson's */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Brain} title="What is Parkinson's Disease?" />
        <p style={{ lineHeight: 1.75, marginBottom: 14, fontSize: '0.9375rem', color: 'var(--c-ink)' }}>
          Parkinson's disease (PD) is a chronic, progressive neurodegenerative disorder
          primarily affecting the <strong>dopaminergic neurons</strong> in the
          <strong> substantia nigra pars compacta</strong> — a small region of the midbrain
          responsible for producing the neurotransmitter dopamine.
        </p>
        <p style={{ lineHeight: 1.75, marginBottom: 14, fontSize: '0.9375rem', color: 'var(--c-ink)' }}>
          Dopamine plays a central role in coordinating smooth, purposeful movement.
          As neurons in the substantia nigra progressively degenerate, dopamine production
          falls. Symptoms typically appear when approximately <strong>60–80% of dopaminergic
          neurons have been lost</strong> — meaning the disease has often been progressing
          silently for years before the first motor signs emerge.
        </p>
        <CalloutBox>
          A hallmark pathological feature of PD is the accumulation of abnormal protein aggregates
          called <strong>Lewy bodies</strong> — primarily composed of misfolded alpha-synuclein protein.
          The Braak staging hypothesis suggests PD pathology spreads in a predictable caudo-rostral
          pattern, potentially explaining why non-motor symptoms (like loss of smell and constipation)
          precede motor signs by years.
        </CalloutBox>
      </div>

      {/* 2. Who gets it */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Users} title="Who Gets Parkinson's Disease?" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Age', content: 'Risk increases significantly with age. Mean age of onset is ~60 years. Approximately 4% of cases are early-onset (before 50). Young-onset PD often has a stronger genetic component.' },
            { label: 'Sex', content: 'Men are approximately 1.5× more likely to develop PD than women, though the reason is not fully understood. Hormonal and genetic factors are thought to play a role.' },
            { label: 'Genetics', content: 'About 10–15% of cases have a clear genetic cause. Implicated genes include LRRK2, SNCA (alpha-synuclein), PARKIN, PINK1, and GBA (glucocerebrosidase) — the last being the strongest known risk factor.' },
            { label: 'Environment', content: 'Exposure to pesticides (rotenone, paraquat) and industrial chemicals is associated with increased risk. Rural living with well-water use is a consistently identified environmental factor.' },
          ].map(({ label, content }) => (
            <div key={label} className="card">
              <h5 style={{ marginBottom: 8, color: 'var(--c-ink)' }}>{label}</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', lineHeight: 1.6, margin: 0 }}>{content}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, fontSize: '0.85rem', color: 'var(--c-ink-muted)' }}>
          <Dna size={16} style={{ color: 'var(--c-purple)', flexShrink: 0 }} />
          Approximately <strong style={{ color: 'var(--c-ink)', margin: '0 4px' }}>85–90%</strong> of PD cases are sporadic (no identifiable single-gene cause).
          Most cases result from a complex interplay of genetic susceptibility and environmental exposures.
        </div>
      </div>

      {/* 3. Symptoms */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Activity} title="Signs & Symptoms" />
        <p style={{ fontSize: '0.9rem', color: 'var(--c-ink-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          PD symptoms are divided into motor (movement-related) and non-motor categories.
          Non-motor symptoms are increasingly recognized as having a major impact on quality of life
          and often appear before motor symptoms.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h5 style={{ marginBottom: 12, color: 'var(--c-ink)' }}>Motor symptoms</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOTOR_SYMPTOMS.map(({ name, description }) => (
                <div key={name} style={{ borderLeft: '3px solid var(--c-purple)', paddingLeft: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2, color: 'var(--c-ink)' }}>{name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--c-ink-muted)', lineHeight: 1.5 }}>{description}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 style={{ marginBottom: 12, color: 'var(--c-ink)' }}>Non-motor symptoms</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NON_MOTOR_SYMPTOMS.map(({ name, description }) => (
                <div key={name} style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2, color: 'var(--c-ink)' }}>{name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--c-ink-muted)', lineHeight: 1.5 }}>{description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Stages */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Microscope} title="Disease Stages — Hoehn & Yahr Scale" />
        <p style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', marginBottom: 16 }}>
          The Hoehn & Yahr scale (1967, modified 1987) is the most widely used staging system.
          It describes motor disability from Stage I (minimal unilateral symptoms) to Stage V (fully dependent).
        </p>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {STAGES.map((stage, i) => (
            <div key={stage.num} style={{
              flex: '1 0 120px',
              padding: '16px 14px',
              borderRight: i < STAGES.length - 1 ? '1px solid #e2e8f0' : 'none',
              background: stage.group === 'early' ? 'var(--c-success-bg)' : stage.group === 'middle' ? '#fffbea' : 'var(--c-error-bg)',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stage.group === 'early' ? 'var(--c-success)' : stage.group === 'middle' ? 'var(--c-warning)' : 'var(--c-error)', marginBottom: 4 }}>{stage.num}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6, color: 'var(--c-ink)' }}>{stage.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--c-ink-muted)', lineHeight: 1.4 }}>{stage.description}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--c-ink-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--c-success-bg)', border: '1px solid var(--c-success)', display: 'inline-block' }} /> Early (I–II)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#fffbea', border: '1px solid var(--c-warning)', display: 'inline-block' }} /> Middle (III)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--c-error-bg)', border: '1px solid var(--c-error)', display: 'inline-block' }} /> Advanced (IV–V)</span>
        </div>
      </div>

      {/* 5. Handwriting changes */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Activity} title="How Handwriting Changes in Parkinson's" />
        <CalloutBox>
          This section directly connects to the research behind NeuroDraw. Handwriting changes
          are a measurable, quantifiable motor biomarker for Parkinson's disease — which is why
          AI analysis of drawings like spirals and waves can serve as a non-invasive screening tool.
        </CalloutBox>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { term: 'Micrographia', text: 'The most characteristic handwriting change in PD. Writing becomes progressively smaller during a writing task (progressive micrographia) or consistently small throughout (constant micrographia). Caused by bradykinesia affecting fine motor control. Detectable even in early-stage PD.' },
            { term: 'Reduced pen pressure and velocity', text: 'PD patients apply less pressure and move the pen more slowly. Kinematic analysis of digitizer tablet data (like the PaHaW dataset) captures velocity, acceleration, and jerk — all significantly different in PD vs. healthy controls.' },
            { term: 'Spiral distortion', text: 'When asked to copy a spiral template, PD patients produce drawings with irregular spacing between turns, tremor-induced oscillations, and reduced amplitude consistency. This is the basis for the spiral drawing tests analyzed by this platform.' },
            { term: 'Tremor signatures', text: 'Resting tremor (3–6 Hz), postural tremor, and action tremor produce distinctive oscillatory patterns visible in digitized pen trajectories. Wavelet analysis of these frequency components forms part of the PaHaW classical pipeline.' },
            { term: 'Wave drawing irregularity', text: 'In wave drawing tests, PD patients show reduced amplitude, irregular frequency, and inter-cycle variability — reflecting impaired rhythmic motor control. The Wave VGG16 specialist model was trained specifically to detect these patterns.' },
          ].map(({ term, text }) => (
            <div key={term} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, padding: '14px 0', borderBottom: '1px solid #edf2f7' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--c-ink)', paddingTop: 2 }}>{term}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link to="/models" className="btn" style={{ background: 'var(--c-purple-light)', color: 'var(--c-purple)', display: 'inline-flex', gap: 8 }}>
            View model architecture and metrics <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 6. Diagnosis */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Microscope} title="Diagnosis Methods" />
        <p style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          There is no single definitive test for Parkinson's disease.
          Diagnosis relies on clinical assessment combined with ruling out other conditions.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {DIAGNOSIS_METHODS.map(({ name, description }) => (
            <div key={name} className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, color: 'var(--c-ink)' }}>{name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', lineHeight: 1.5 }}>{description}</div>
            </div>
          ))}
        </div>
        <CalloutBox variant="warning">
          NeuroDraw is a <strong>research and screening demonstration</strong> — not a diagnostic tool.
          Results from this platform should never substitute for clinical evaluation by a neurologist.
        </CalloutBox>
      </div>

      {/* 7. Treatments */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={Heart} title="Living with Parkinson's" />
        <p style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          While there is currently no cure for Parkinson's disease, treatment has advanced
          significantly. Most people with PD can maintain a good quality of life for many years
          with appropriate management.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TREATMENTS.map(({ category, items }) => (
            <div key={category} className="card">
              <h5 style={{ marginBottom: 12, color: 'var(--c-ink)' }}>{category}</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', lineHeight: 1.5, paddingLeft: 14, borderLeft: '3px solid #e2e8f0' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Resources */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeading icon={BookOpen} title="Resources & Further Reading" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {RESOURCES.map(({ name, url, description }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="card"
              style={{ textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--c-purple)', marginBottom: 6 }}>{name} ↗</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)' }}>{description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 24px', background: 'var(--c-purple-light)' }}>
        <h3 style={{ marginBottom: 10, color: 'var(--c-ink)' }}>Explore the Research Platform</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--c-ink-muted)', marginBottom: 24 }}>
          See how NeuroDraw uses handwriting analysis to screen for Parkinson's motor biomarkers.
        </p>
        <Link to="/analyze" className="btn btn-primary">
          <ArrowRight size={14} /> Try an analysis
        </Link>
      </div>
    </div>
  )
}
