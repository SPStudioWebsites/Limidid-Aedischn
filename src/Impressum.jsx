import { useEffect } from 'react'
import './index.css'

const C = {
  red:    '#d6363a',
  dark:   '#292a2e',
  darker: '#1e1f22',
  light:  '#f7f7f7',
  muted:  'rgba(247,247,247,0.55)',
  faint:  'rgba(247,247,247,0.12)',
  border: 'rgba(247,247,247,0.08)',
}

export default function Impressum() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Impressum – Limidid Ädischn'
    return () => { document.title = 'Limidid Ädischn – Die Partyband aus Franken' }
  }, [])

  return (
    <div style={{ background: C.dark, minHeight: '100vh', color: C.light, fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.darker,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <a href="#" onClick={() => window.location.hash = ''}>
          <picture>
            <source srcSet="/logo-transparent.webp" type="image/webp" />
            <img src="/logo-transparent.png" alt="Limidid Ädischn" loading="lazy" width="1440" height="690" style={{ height: 40, width: 'auto' }} />
          </picture>
        </a>
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.location.hash = '' }}
          style={{
            color: C.muted, textDecoration: 'none', fontSize: 13,
            letterSpacing: 2, textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}
          onMouseOver={e => e.target.style.color = C.red}
          onMouseOut={e => e.target.style.color = C.muted}
        >
          ← Zurück zur Website
        </a>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '72px 32px 100px' }}>

        {/* Heading */}
        <p style={{ fontSize: 11, letterSpacing: 6, color: C.red, textTransform: 'uppercase', marginBottom: 12 }}>
          Rechtliches
        </p>
        <h1 className="font-display" style={{ fontSize: 'clamp(44px, 7vw, 80px)', lineHeight: 1, marginBottom: 8 }}>
          IMPRESSUM
        </h1>
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, ${C.red}, transparent)`,
          marginBottom: 56, marginTop: 20,
        }} />

        <Section title="Angaben gemäß § 5 TMG">
          <Line label="Name">Vorname Nachname {/* ← hier eintragen */}</Line>
          <Line label="Adresse">Musterstraße 1, 12345 Musterstadt {/* ← hier eintragen */}</Line>
        </Section>

        <Section title="Kontakt">
          <Line label="Telefon">+49 (0) XXX XXXXXXX {/* ← hier eintragen */}</Line>
          <Line label="E-Mail">kontakt@limidid-aedischn.de {/* ← hier eintragen */}</Line>
        </Section>

        <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
          <p style={{ color: C.muted, lineHeight: 1.75 }}>
            Vorname Nachname {/* ← hier eintragen */}<br />
            Musterstraße 1 {/* ← hier eintragen */}<br />
            12345 Musterstadt {/* ← hier eintragen */}
          </p>
        </Section>

        <Section title="Haftungsausschluss">
          <p style={{ color: C.muted, lineHeight: 1.75 }}>
            <strong style={{ color: C.light }}>Haftung für Inhalte</strong><br />
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
            zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p style={{ color: C.muted, lineHeight: 1.75, marginTop: 20 }}>
            <strong style={{ color: C.light }}>Haftung für Links</strong><br />
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
        </Section>

        <Section title="Urheberrecht">
          <p style={{ color: C.muted, lineHeight: 1.75 }}>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
            Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </Section>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 40px',
        textAlign: 'center',
        background: C.darker,
      }}>
        <p style={{ color: 'rgba(247,247,247,0.18)', fontSize: 12 }}>
          © 2026 Limidid Ädischn. Alle Rechte vorbehalten.
        </p>
      </footer>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{
        fontSize: 13, letterSpacing: 3, textTransform: 'uppercase',
        color: C.red, marginBottom: 16, fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
      }}>
        {title}
      </h2>
      <div style={{
        background: 'rgba(247,247,247,0.03)',
        border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '24px 28px',
      }}>
        {children}
      </div>
    </div>
  )
}

function Line({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
      <span style={{ color: 'rgba(247,247,247,0.35)', fontSize: 13, minWidth: 80 }}>{label}</span>
      <span style={{ color: C.light, fontSize: 14 }}>{children}</span>
    </div>
  )
}
