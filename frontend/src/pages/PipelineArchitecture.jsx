import { Network, FileImage, PenTool, BrainCircuit, Activity, FileText, ArrowDown } from 'lucide-react'

export default function PipelineArchitecture() {
  const steps = [
    {
      icon: <Network size={24} />,
      title: "Input Source",
      desc: "Patient provides either a scanned photograph of a drawing or a digital tablet recording (.svc)."
    },
    {
      icon: <FileImage size={24} />,
      title: "Drawing Type Detection",
      desc: "MobileNetV2 routing classifier detects if the image is a Spiral, Wave, or invalid drawing (Garbage class)."
    },
    {
      icon: <BrainCircuit size={24} />,
      title: "Specialist Models",
      desc: "Images route to specialized VGG16 CNNs. .svc files route to the PaHaW classical kinematic feature extractor."
    },
    {
      icon: <Activity size={24} />,
      title: "Cross Validation",
      desc: "The Unified VGG16 cross-checker runs in parallel for image tasks to ensure specialist model agreement."
    },
    {
      icon: <FileText size={24} />,
      title: "Clinical Report",
      desc: "Outputs are synthesized into a clinical confidence score and PDF export for the Doctor Workspace."
    }
  ]

  return (
    <div className="main-content flex-col" style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 className="page-title" style={{ marginBottom: 16 }}>Pipeline Architecture</h1>
        <p className="page-greeting" style={{ fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
          NeuroDraw uses a dynamic routing pipeline to process different input modalities through optimized specialist models.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 700 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            
            <div className="card" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 24, padding: 32, transform: 'translateY(0)', transition: 'transform 0.3s' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--panel-grad)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 20px rgba(138, 93, 245, 0.2)' }}>
                {step.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: 'var(--c-ink-muted)', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div style={{ height: 40, width: 2, background: 'var(--c-purple)', opacity: 0.3, margin: '8px 0' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
