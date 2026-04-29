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

export default function Datenschutz() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Datenschutz – Limidid Ädischn'
    return () => { document.title = 'Limidid Ädischn – Die Partyband aus Franken' }
  }, [])

  return (
    <div style={{ background: C.dark, minHeight: '100vh', color: C.light, fontFamily: "'Inter Variable', 'Inter', sans-serif" }}>

      {/* Top bar */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.darker,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <a href="#" onClick={e => { e.preventDefault(); window.location.hash = '' }}>
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

        <p style={{ fontSize: 11, letterSpacing: 6, color: C.red, textTransform: 'uppercase', marginBottom: 12 }}>
          Rechtliches
        </p>
        <h1 className="font-display" style={{ fontSize: 'clamp(44px, 7vw, 80px)', lineHeight: 1, marginBottom: 8 }}>
          DATENSCHUTZ
        </h1>
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, ${C.red}, transparent)`,
          marginBottom: 56, marginTop: 20,
        }} />

        <Section title="1. Verantwortlicher">
          <P>
            Verantwortlich im Sinne der DSGVO ist:<br /><br />
            <strong style={{ color: C.light }}>Vorname Nachname</strong> {/* ← hier eintragen */}<br />
            Musterstraße 1 {/* ← hier eintragen */}<br />
            12345 Musterstadt {/* ← hier eintragen */}<br /><br />
            E-Mail: kontakt@limidid-aedischn.de {/* ← hier eintragen */}<br />
            Telefon: +49 (0) XXX XXXXXXX {/* ← hier eintragen */}
          </P>
        </Section>

        <Section title="2. Allgemeines zur Datenverarbeitung">
          <P>
            Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur
            Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
            Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur nach Einwilligung des Nutzers oder
            wenn die Verarbeitung durch gesetzliche Vorschriften erlaubt ist.
          </P>
        </Section>

        <Section title="3. Hosting">
          <P>
            Diese Website wird auf einem Webserver gehostet. Der Hostinganbieter erhebt in sogenannten
            Logfiles folgende Daten, die Ihr Browser übermittelt:<br /><br />
            IP-Adresse, Adresse der zuvor besuchten Website (Referer-URL), Datum und Uhrzeit der Anfrage,
            Zeitzonendifferenz zur Greenwich Mean Time, Inhalt der Anforderung, HTTP-Statuscode,
            übertragene Datenmenge, Website, von der die Anforderung kommt, sowie Informationen zu
            Browser und Betriebssystem.<br /><br />
            Das ist erforderlich, um die Website darzustellen und die Stabilität und Sicherheit zu gewährleisten.
            Dies entspricht dem berechtigten Interesse im Sinne des Art. 6 Abs. 1 S. 1 lit. f DSGVO.
          </P>
        </Section>

        <Section title="4. Kontaktformular">
          <P>
            Wenn Sie uns über das Kontaktformular auf unserer Website kontaktieren, werden die von Ihnen
            eingegebenen Daten (Name, E-Mail-Adresse und Ihre Nachricht) bei uns gespeichert, um Ihre
            Anfrage zu bearbeiten und im Falle von Anschlussfragen weiterhelfen zu können.<br /><br />
            <strong style={{ color: C.light }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
            (Vertragsanbahnung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung
            von Anfragen).<br /><br />
            <strong style={{ color: C.light }}>Speicherdauer:</strong> Die Daten werden gelöscht, sobald sie
            für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind, spätestens jedoch nach
            3 Jahren.
          </P>
        </Section>

        <Section title="5. Schriftarten (Fonts)">
          <P>
            Diese Website verwendet ausschließlich <strong style={{ color: C.light }}>lokal gespeicherte
            Schriftarten</strong>. Es erfolgt keine Verbindung zu externen Schriftarten-Diensten wie Google Fonts.
            Es werden daher keine personenbezogenen Daten (insbesondere keine IP-Adressen) an Dritte übermittelt.
          </P>
        </Section>

        <Section title="6. Ihre Rechte als betroffene Person">
          <P>
            Ihnen stehen gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten zu:
          </P>
          <ul style={{ color: C.muted, lineHeight: 2, paddingLeft: 20, marginTop: 12 }}>
            {[
              'Recht auf Auskunft (Art. 15 DSGVO)',
              'Recht auf Berichtigung (Art. 16 DSGVO)',
              'Recht auf Löschung (Art. 17 DSGVO)',
              'Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)',
              'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)',
              'Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)',
              'Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)',
            ].map(r => (
              <li key={r} style={{ marginBottom: 4 }}>
                <span style={{ color: C.red, marginRight: 8 }}>—</span>{r}
              </li>
            ))}
          </ul>
          <P style={{ marginTop: 16 }}>
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an die oben genannte Kontaktadresse.
          </P>
        </Section>

        <Section title="7. Beschwerderecht bei der Aufsichtsbehörde">
          <P>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
            personenbezogenen Daten durch uns zu beschweren. Die zuständige Aufsichtsbehörde in Bayern ist:<br /><br />
            <strong style={{ color: C.light }}>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong><br />
            Promenade 27, 91522 Ansbach<br />
            www.lda.bayern.de
          </P>
        </Section>

        <Section title="8. Aktualität dieser Datenschutzerklärung">
          <P>
            Diese Datenschutzerklärung ist aktuell gültig und hat den Stand April 2026.
            Durch die Weiterentwicklung unserer Website kann es notwendig werden, diese Datenschutzerklärung
            anzupassen.
          </P>
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
          © 2026 Limidid Ädischn. Alle Rechte vorbehalten. —{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.location.hash = 'impressum' }}
            style={{ color: 'rgba(247,247,247,0.18)', textDecoration: 'none' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = 'rgba(247,247,247,0.18)'}
          >Impressum</a>
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
        color: C.red, marginBottom: 16,
        fontFamily: "'Inter Variable', 'Inter', sans-serif",
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

function P({ children, style }) {
  return (
    <p style={{ color: 'rgba(247,247,247,0.55)', lineHeight: 1.75, fontSize: 14, ...style }}>
      {children}
    </p>
  )
}
