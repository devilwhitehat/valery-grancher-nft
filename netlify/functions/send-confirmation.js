// netlify/functions/send-confirmation.js
// ─────────────────────────────────────────────────────────────────
// Envoie un email de confirmation à l'acheteur et à Valéry Grancher
// après paiement réussi. Utilise SendGrid (gratuit jusqu'à 100/jour).
// ─────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) }; }

  const { buyerName, buyerEmail, artworkTitle, priceEth, priceEur, paymentIntentId } = body;

  const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
  const ARTIST_EMAIL = 'vgrancher@gmail.com';

  if (!SENDGRID_KEY) {
    console.warn('[Mail] SENDGRID_API_KEY non configurée — email ignoré');
    return { statusCode: 200, headers, body: JSON.stringify({ sent: false, reason: 'no_sendgrid_key' }) };
  }

  // ── Email acheteur ────────────────────────────────────────────
  const buyerHtml = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#05050a;color:#f0f0f8;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#0c0c14;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden}
  .hdr{background:#13131e;padding:32px;text-align:center;border-bottom:1px solid rgba(255,255,255,.06)}
  .hdr h1{font-size:22px;font-weight:700;margin:0;color:#c8ff00;letter-spacing:.05em}
  .hdr p{font-size:11px;color:#6b6b88;margin:6px 0 0;letter-spacing:.15em;text-transform:uppercase}
  .body{padding:32px}
  .artwork-box{background:#13131e;border:1px solid rgba(200,255,0,.15);border-radius:12px;padding:20px;margin:24px 0}
  .artwork-title{font-size:18px;font-weight:700;color:#c8ff00;margin:0 0 8px}
  .artwork-price{font-size:13px;color:#9898b8}
  .btn{display:inline-block;background:#c8ff00;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:13px;margin:16px 0}
  .footer{padding:24px 32px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:#6b6b88;text-align:center}
  .ref{font-family:monospace;font-size:10px;color:#6b6b88;word-break:break-all}
</style></head><body>
<div class="wrap">
  <div class="hdr">
    <h1>VALÉRY GRANCHER</h1>
    <p>Confirmation d'achat NFT</p>
  </div>
  <div class="body">
    <p>Bonjour <strong>${buyerName}</strong>,</p>
    <p>Votre achat a été confirmé avec succès. Merci pour votre soutien à l'art numérique !</p>
    <div class="artwork-box">
      <div class="artwork-title">${artworkTitle}</div>
      <div class="artwork-price">
        Prix : <strong>${priceEth} ETH</strong>${priceEur ? `  ·  <strong>${priceEur}</strong>` : ''}<br>
        Artiste : Valéry Grancher
      </div>
    </div>
    <p>Le transfert du NFT vers votre wallet sera effectué dans les <strong>48 heures</strong>. Vous recevrez un email de confirmation avec le hash de transaction Ethereum.</p>
    <p>Pour toute question :<br>
    <a href="mailto:vgrancher@gmail.com" style="color:#c8ff00">vgrancher@gmail.com</a></p>
    <a class="btn" href="https://devilwhitehat.github.io/valery-grancher-nft/marketplace.html">Voir la marketplace</a>
    <p class="ref">Référence paiement : ${paymentIntentId}</p>
  </div>
  <div class="footer">© Valéry Grancher Studio · Art Numérique depuis 1994</div>
</div>
</body></html>`;

  // ── Email artiste ─────────────────────────────────────────────
  const artistHtml = `
<h2>🎉 Nouvelle vente NFT !</h2>
<p><b>Œuvre :</b> ${artworkTitle}</p>
<p><b>Prix :</b> ${priceEth} ETH${priceEur ? ' / ' + priceEur : ''}</p>
<p><b>Acheteur :</b> ${buyerName} — <a href="mailto:${buyerEmail}">${buyerEmail}</a></p>
<p><b>Réf. Stripe :</b> <code>${paymentIntentId}</code></p>
<p>→ <a href="https://dashboard.stripe.com/payments/${paymentIntentId}">Voir dans Stripe Dashboard</a></p>
<hr>
<p><i>Action requise : transférer le NFT "${artworkTitle}" vers le wallet de l'acheteur dans les 48h.</i></p>`;

  const messages = [
    {
      to: [{ email: buyerEmail, name: buyerName }],
      subject: `✦ Confirmation — "${artworkTitle}" · Valéry Grancher`,
      html: buyerHtml,
    },
    {
      to: [{ email: ARTIST_EMAIL, name: 'Valéry Grancher' }],
      subject: `[VENTE] ${artworkTitle} — ${priceEth} ETH`,
      html: artistHtml,
    },
  ];

  try {
    const results = await Promise.all(messages.map(msg =>
      fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: msg.to }],
          from: { email: 'noreply@valerygrancherstudio.art', name: 'Valéry Grancher Studio' },
          subject: msg.subject,
          content: [{ type: 'text/html', value: msg.html }],
        }),
      })
    ));

    const ok = results.every(r => r.status < 300);
    return { statusCode: 200, headers, body: JSON.stringify({ sent: ok }) };

  } catch (err) {
    console.error('[SendGrid] Erreur:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
