import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// HTML-to-PDF using browser's print API via a data-URI approach
// Returns an HTML page with print-optimized styles that auto-triggers the print dialog
export async function POST(req: NextRequest) {
  try {
    const { childId, token } = await req.json()

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch child data
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Fetch practitioners
    const { data: practitioners } = await supabase
      .from('practitioners')
      .select('*')
      .eq('child_id', childId)
      .neq('status', 'archive')
      .order('created_at')

    // Fetch sessions (last 20)
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*, practitioners(first_name, last_name, specialty)')
      .eq('child_id', childId)
      .order('session_date', { ascending: false })
      .limit(20)

    // Fetch medications
    const { data: medications } = await supabase
      .from('medications')
      .select('*')
      .eq('child_id', childId)
      .eq('is_active', true)

    // Fetch health records
    const { data: healthRecords } = await supabase
      .from('health_records')
      .select('*')
      .eq('child_id', childId)
      .order('record_date', { ascending: false })
      .limit(30)

    // Fetch therapeutic goals
    const { data: goals } = await supabase
      .from('therapeutic_goals')
      .select('*, practitioners(first_name, last_name)')
      .eq('child_id', childId)
      .neq('status', 'abandonne')

    const birthDate = child.birth_date
      ? new Date(child.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Non renseignée'

    const age = child.birth_date
      ? Math.floor((Date.now() - new Date(child.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : null

    const exportDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier de ${child.first_name} ${child.last_name || ''} — Le Fil</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, sans-serif;
      color: #2D3748;
      background: white;
      font-size: 11pt;
      line-height: 1.6;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 3px solid #4A90D9;
      margin-bottom: 28px;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-circle {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4A90D9, #7EC8B0);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: 18pt;
      font-weight: 700;
      color: #4A90D9;
    }

    .brand-tagline {
      font-size: 9pt;
      color: #718096;
    }

    .export-date {
      text-align: right;
      font-size: 9pt;
      color: #718096;
    }

    /* Child info card */
    .child-card {
      background: linear-gradient(135deg, #EDF5FC, #E8F6F2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 28px;
      border-left: 5px solid #4A90D9;
    }

    .child-name {
      font-size: 22pt;
      font-weight: 700;
      color: #2D3748;
    }

    .child-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 12px;
    }

    .meta-item {
      background: white;
      border-radius: 10px;
      padding: 10px 14px;
    }

    .meta-label {
      font-size: 8pt;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-value {
      font-size: 11pt;
      font-weight: 600;
      color: #2D3748;
      margin-top: 2px;
    }

    /* Section */
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #2D3748;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E8ECF0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      font-weight: 700;
      color: white;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }

    th {
      background: #F7FAFC;
      padding: 8px 12px;
      text-align: left;
      font-size: 8pt;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #E2E8F0;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #F7FAFC;
      color: #2D3748;
    }

    tr:last-child td { border-bottom: none; }

    /* Progress bar */
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #E2E8F0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4A90D9, #7EC8B0);
      border-radius: 4px;
    }

    /* Badge */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: 600;
    }

    .badge-blue { background: #EBF4FF; color: #4A90D9; }
    .badge-green { background: #E6F6F2; color: #5CB89A; }
    .badge-orange { background: #FFF0E6; color: #E8A87C; }

    /* Allergies */
    .allergy-item {
      display: inline-block;
      padding: 4px 12px;
      background: #FFF5F5;
      border: 1px solid #FED7D7;
      border-radius: 20px;
      color: #E53E3E;
      font-size: 9pt;
      font-weight: 500;
      margin: 3px;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E8ECF0;
      text-align: center;
      font-size: 8pt;
      color: #A0AEC0;
    }

    @media print {
      .no-print { display: none; }
      body { font-size: 10pt; }
      .page { padding: 20px; }
      .header { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-brand">
        <div class="logo-circle">
          <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
            <path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="50" cy="22" r="7" fill="white"/>
          </svg>
        </div>
        <div>
          <div class="brand-name">Le Fil</div>
          <div class="brand-tagline">Vivre Ensemble</div>
        </div>
      </div>
      <div class="export-date">
        <div style="font-weight:600; font-size:10pt; color:#2D3748">Dossier de suivi</div>
        <div>Exporté le ${exportDate}</div>
        <div style="margin-top:4px"><span class="badge badge-blue">Document confidentiel</span></div>
      </div>
    </div>

    <!-- Child info -->
    <div class="child-card">
      <div class="child-name">${child.first_name} ${child.last_name || ''}</div>
      <div class="child-meta">
        <div class="meta-item">
          <div class="meta-label">Date de naissance</div>
          <div class="meta-value">${birthDate}</div>
        </div>
        ${age !== null ? `<div class="meta-item">
          <div class="meta-label">Âge</div>
          <div class="meta-value">${age} ans</div>
        </div>` : ''}
        ${child.gender ? `<div class="meta-item">
          <div class="meta-label">Genre</div>
          <div class="meta-value">${child.gender === 'M' ? 'Masculin' : child.gender === 'F' ? 'Féminin' : child.gender}</div>
        </div>` : ''}
        ${child.diagnosis ? `<div class="meta-item" style="grid-column: span 3;">
          <div class="meta-label">Diagnostic</div>
          <div class="meta-value">${child.diagnosis}</div>
        </div>` : ''}
      </div>
    </div>

    ${child.allergies && child.allergies.length > 0 ? `
    <!-- Allergies -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background:#E8A87C">⚠</span>
        Allergies connues
      </div>
      <div>
        ${(Array.isArray(child.allergies) ? child.allergies : [child.allergies]).map((a: string) =>
          `<span class="allergy-item">${a}</span>`
        ).join('')}
      </div>
    </div>` : ''}

    ${practitioners && practitioners.length > 0 ? `
    <!-- Practitioners -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background:#4A90D9">♥</span>
        Équipe thérapeutique (${practitioners.length} praticien${practitioners.length > 1 ? 's' : ''})
      </div>
      <table>
        <thead>
          <tr>
            <th>Praticien</th>
            <th>Spécialité</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${practitioners.map((p: Record<string, string>) => `
          <tr>
            <td style="font-weight:600">${p.first_name} ${p.last_name || ''}</td>
            <td><span class="badge badge-blue">${p.specialty || 'N/A'}</span></td>
            <td style="color:#718096">${p.phone || p.email || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${medications && medications.length > 0 ? `
    <!-- Medications -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background:#7EC8B0">💊</span>
        Médicaments actifs (${medications.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>Médicament</th>
            <th>Dosage</th>
            <th>Fréquence</th>
            <th>Prescripteur</th>
          </tr>
        </thead>
        <tbody>
          ${medications.map((m: Record<string, string>) => `
          <tr>
            <td style="font-weight:600">${m.name}</td>
            <td>${m.dosage ? `${m.dosage} ${m.unit || 'mg'}` : '—'}</td>
            <td>${m.frequency || '—'}</td>
            <td style="color:#718096">${m.prescriber || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${goals && goals.length > 0 ? `
    <!-- Therapeutic goals -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background:#5CB89A">🎯</span>
        Objectifs thérapeutiques (${goals.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>Objectif</th>
            <th>Catégorie</th>
            <th>Progression</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${goals.map((g: Record<string, unknown>) => `
          <tr>
            <td style="font-weight:600">${g.title}</td>
            <td style="color:#718096">${g.category || '—'}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${g.progress || 0}%"></div>
              </div>
              <div style="font-size:8pt; color:#718096; margin-top:2px">${g.progress || 0}%</div>
            </td>
            <td>
              <span class="badge ${g.status === 'atteint' ? 'badge-green' : g.status === 'en_cours' ? 'badge-blue' : 'badge-orange'}">
                ${g.status === 'atteint' ? 'Atteint' : g.status === 'en_cours' ? 'En cours' : g.status === 'en_pause' ? 'En pause' : g.status}
              </span>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${sessions && sessions.length > 0 ? `
    <!-- Recent sessions -->
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background:#a78bfa">📋</span>
        Séances récentes (${sessions.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Praticien</th>
            <th>Observations</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.slice(0, 10).map((s: Record<string, unknown>) => `
          <tr>
            <td style="white-space:nowrap">${new Date(String(s.session_date)).toLocaleDateString('fr-FR')}</td>
            <td style="color:#718096">${(s.practitioners as Record<string, string>)?.first_name || ''} ${(s.practitioners as Record<string, string>)?.last_name || ''}</td>
            <td style="color:#2D3748; max-width:300px">${s.observations ? String(s.observations).slice(0, 120) + (String(s.observations).length > 120 ? '...' : '') : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Ce document a été généré par <strong>Le Fil — Vivre Ensemble</strong> le ${exportDate}.</p>
      <p style="margin-top:4px">Document confidentiel — usage médical et familial uniquement.</p>
    </div>
  </div>

  <script>
    // Auto print if opened in a new tab
    if (window.opener || document.referrer.includes('lefil')) {
      setTimeout(() => window.print(), 500);
    }
  </script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="dossier-${child.first_name}-${child.last_name || ''}.html"`,
      },
    })
  } catch (err) {
    console.error('Export PDF error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })
  return POST(new NextRequest(req.url, { method: 'POST', body: JSON.stringify({ childId }) }))
}
