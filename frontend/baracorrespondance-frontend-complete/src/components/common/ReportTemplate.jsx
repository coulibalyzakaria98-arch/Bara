import React from 'react';

// Generate a full HTML string for the professional report
export function generateReportHTML(analysis) {
  const now = new Date().toLocaleString('fr-FR');
  const fullName = analysis?.full_name || (analysis?.user?.full_name) || 'Candidat';
  const title = analysis?.job_title || 'Titre professionnel';
  const photo = analysis?.photo_url || analysis?.user?.avatar_url || null;
  const overall = analysis?.overall_score ?? analysis?.scores?.overall ?? 'N/A';

  const skillsTech = (analysis?.skills?.technical || []).map(s => `<li>${s}</li>`).join('') || '<li>—</li>';
  const skillsSoft = (analysis?.skills?.soft || []).map(s => `<li>${s}</li>`).join('') || '<li>—</li>';

  const experiences = (analysis?.experiences || []).map(exp => `
    <div style="margin-bottom:12px">
      <strong>${exp.title || exp.job_title || 'Titre'}</strong> — ${exp.company || ''} <br/>
      <small>${exp.start || ''} — ${exp.end || ''}</small>
      <ul>
        ${(exp.achievements || []).map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
  `).join('') || '<div>Pas d\'expérience fournie.</div>';

  const recommendations = (analysis?.recommendations || []).map(r => `<li>${r}</li>`).join('') || '<li>Aucune recommandation spécifique</li>';

  // Simple inline CSS for the report (kept self-contained for printing)
  const css = `
    body{font-family: Inter, Poppins, Arial, sans-serif; color:#1f2937;}
    .header{background:linear-gradient(90deg,#0366d6,#4f46e5);color:white;padding:20px;border-radius:6px}
    .container{max-width:900px;margin:20px auto;padding:20px}
    .grid{display:flex;gap:20px}
    .left{flex:1}
    .right{width:220px}
    .photo{width:180px;height:180px;border-radius:8px;object-fit:cover;background:#f3f4f6;display:block}
    .score{font-size:42px;font-weight:700;color:#0f172a}
    .card{background:#fff;border:1px solid #e6edf8;padding:16px;border-radius:8px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px;text-align:left;border-bottom:1px solid #eef2f7}
    h2{margin:0 0 8px 0}
    .muted{color:#6b7280}
  `;

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Rapport d'analyse - ${fullName}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h1 style="margin:0">BaraCorrespondance AI</h1>
            <div style="opacity:0.9">Rapport d'analyse de CV — ${now}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700">${fullName}</div>
            <div class="muted">${title}</div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:20px;margin-top:18px">
        <div style="flex:1">
          <div class="card">
            <h2>Description professionnelle</h2>
            <p class="muted">${(analysis?.summary) ? analysis.summary : 'Profil analysé : résumé automatique non disponible.'}</p>
          </div>

          <div class="card">
            <h2>Score global</h2>
            <div style="display:flex;align-items:center;gap:20px">
              <div class="score">${overall}%</div>
              <div>
                <div class="muted">Interprétation :</div>
                <div>${overall >= 80 ? 'Profil très compétitif' : overall >= 60 ? 'Profil intéressant' : 'Améliorations recommandées'}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <h2>Analyse détaillée</h2>
            <table>
              <thead><tr><th>Critère</th><th>Score</th></tr></thead>
              <tbody>
                <tr><td>Pertinence du CV</td><td>${analysis?.scores?.cv_score ?? '—'}</td></tr>
                <tr><td>Compétences techniques</td><td>${analysis?.scores?.skills_score ?? '—'}</td></tr>
                <tr><td>Soft skills</td><td>${analysis?.scores?.soft_score ?? '—'}</td></tr>
                <tr><td>Expériences & réalisations</td><td>${analysis?.scores?.exp_score ?? '—'}</td></tr>
                <tr><td>Formation</td><td>${analysis?.scores?.edu_score ?? '—'}</td></tr>
                <tr><td>Mots‑clés / SEO</td><td>${analysis?.scores?.keywords_score ?? '—'}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="card">
            <h2>Compétences techniques détectées</h2>
            <ul>${skillsTech}</ul>
          </div>

          <div class="card">
            <h2>Soft skills</h2>
            <ul>${skillsSoft}</ul>
          </div>

          <div class="card">
            <h2>Expériences</h2>
            ${experiences}
          </div>

          <div class="card">
            <h2>Recommandations</h2>
            <ol>${recommendations}</ol>
          </div>
        </div>

        <div style="width:260px">
          <div class="card" style="text-align:center">
            ${photo ? `<img class="photo" src="${photo}" alt="photo"/>` : `<div class="photo" style="display:flex;align-items:center;justify-content:center;font-weight:600;color:#9ca3af">Photo du candidat</div>`}
            <div style="margin-top:10px;font-weight:700">${fullName}</div>
            <div class="muted">${title}</div>
          </div>

          <div class="card">
            <h3>Mots‑clés</h3>
            <div class="muted">${(analysis?.keywords || []).join(', ') || '—'}</div>
          </div>

          <div class="card">
            <h3>Conclusion</h3>
            <p class="muted">${analysis?.conclusion || 'Profil analysé. Voir recommandations pour actions immédiates.'}</p>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:18px;color:#6b7280">BaraCorrespondance AI – L'intelligence au service de votre carrière</div>
    </div>
  </body>
  </html>
  `;

  return html;
}

// Open a new window with the report and call print (user can save as PDF)
export function openReportWindow(analysis) {
  const html = generateReportHTML(analysis);
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) {
    alert('Impossible d\'ouvrir la fenêtre du rapport. Vérifiez le bloqueur de popups.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();

  // Wait a bit for images to load before calling print
  const tryPrint = () => {
    try {
      w.focus();
      w.print();
    } catch (e) {
      // ignore
    }
  };
  // Attempt print after small delay
  setTimeout(tryPrint, 700);
}

export default {
  generateReportHTML,
  openReportWindow
};
