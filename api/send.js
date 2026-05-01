import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, phone, date, anlass, nachricht } = req.body

  if (!name || !email || !date || !anlass) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { error } = await resend.emails.send({
    from: 'Limidid Ädischn <info@limidid-aedischn.de>',
    to: ['info@limidid-aedischn.de'],
    replyTo: email,
    subject: `Neue Buchungsanfrage: ${anlass} am ${date}`,
    html: `
      <h2>Neue Buchungsanfrage</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold;width:140px">Name</td><td style="padding:8px">${name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">E-Mail</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold">Telefon</td><td style="padding:8px">${phone || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Datum</td><td style="padding:8px">${date}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Anlass</td><td style="padding:8px">${anlass}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Nachricht</td><td style="padding:8px;white-space:pre-wrap">${nachricht || '—'}</td></tr>
      </table>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }

  return res.status(200).json({ ok: true })
}
