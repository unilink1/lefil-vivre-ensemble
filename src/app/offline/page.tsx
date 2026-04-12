export default function OfflinePage() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hors ligne — Le Fil</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'DM Sans', sans-serif;
            background: #FAFAF8;
            color: #2D3748;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .container {
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          .icon-wrapper {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #4A90D9, #7EC8B0);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            box-shadow: 0 8px 32px rgba(74,144,217,0.25);
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #2D3748;
            margin-bottom: 12px;
          }
          p {
            font-size: 15px;
            color: #718096;
            line-height: 1.6;
            margin-bottom: 8px;
          }
          .retry-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 28px;
            padding: 14px 28px;
            background: linear-gradient(135deg, #4A90D9, #7BB3E8);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 4px 16px rgba(74,144,217,0.3);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(74,144,217,0.35);
          }
          .features {
            margin-top: 32px;
            text-align: left;
            background: white;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #E8ECF0;
          }
          .features h2 {
            font-size: 13px;
            font-weight: 600;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
          }
          .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            font-size: 14px;
            color: #4A5568;
            border-bottom: 1px solid #F7FAFC;
          }
          .feature-item:last-child { border-bottom: none; }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #7EC8B0;
            flex-shrink: 0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon-wrapper">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="50" cy="22" r="8" fill="white"/>
            </svg>
          </div>

          <h1>Vous êtes hors ligne</h1>
          <p>Pas de connexion internet pour le moment.</p>
          <p>Les données consultées récemment restent disponibles.</p>

          <a href="/dashboard/profil" className="retry-btn">
            ↺ Réessayer
          </a>

          <div className="features">
            <h2>Disponible hors ligne</h2>
            <div className="feature-item">
              <div className="dot"></div>
              Journal quotidien (dernières consultations)
            </div>
            <div className="feature-item">
              <div className="dot"></div>
              Agenda (rendez-vous mis en cache)
            </div>
            <div className="feature-item">
              <div className="dot"></div>
              Médicaments actifs
            </div>
            <div className="feature-item">
              <div className="dot"></div>
              Objectifs thérapeutiques
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
