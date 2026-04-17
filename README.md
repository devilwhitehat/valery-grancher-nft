# 🎨 Valéry Grancher — NFT Platform

## Structure du projet

```
site/
├── index.html        ← Studio Artiste (accès wallet 0xA266…6f93 uniquement)
├── marketplace.html  ← Marketplace publique pour collectionneurs
├── netlify.toml      ← Headers de sécurité EU NIS2
└── README.md
```

---

## 🚀 Déploiement GRATUIT — 3 options

### Option A — Netlify (recommandé, HTTPS auto)
1. Aller sur https://netlify.com → créer compte gratuit
2. Dashboard → glisser-déposer **le dossier site/** entier
3. URL gratuite : `https://valery-grancher.netlify.app`
4. HTTPS activé automatiquement ✅

### Option B — GitHub Pages (gratuit, HTTPS)
1. Créer repo sur https://github.com (gratuit)
2. Upload les fichiers du dossier `site/`
3. Settings → Pages → Source: main branch
4. URL : `https://votrenom.github.io/valery-grancher-nft/`

### Option C — Vercel (gratuit, très rapide)
1. https://vercel.com → New Project
2. Import depuis GitHub ou drag & drop
3. Deploy → URL instantanée avec HTTPS ✅

---

## 🔐 Sécurité intégrée (EU NIS2 / RGPD)

| Protection | Détail |
|-----------|--------|
| Content Security Policy | Niveau 3 — Anti-XSS strict |
| Sanitisation inputs | Toutes données encodées HTML avant DOM |
| Signature cryptographique | Nonce signé secp256k1 pour auth wallet |
| Rate Limiting | 5 connect/min · 8 mint/2min · 3 buy/30s |
| Anti-Clickjacking | X-Frame-Options DENY + CSP frame-ancestors |
| HTTPS/HSTS | Redirection forcée + preload 1 an |
| Accès artiste exclusif | Vérification adresse on-chain |
| RGPD | Aucun tracking, aucun cookie tiers |
| Smart Contract Guard | ReentrancyGuard + Pausable + CEI pattern |
| Audit Log | Traçabilité complète des actions |
| Validation fichiers | MIME type + taille max 50MB |
| Emergency pause | Fonction onlyOwner dans le contrat |

---

## 💡 Fonctionnement

**Vous (artiste)** → `index.html`
- Connectez MetaMask avec `0xA26698254830A4BCeB381700Cfb0B38A4f146f93`
- Mintez vos œuvres (stockage local — en attendant IPFS)
- Les œuvres apparaissent automatiquement sur la marketplace

**Collectionneurs** → `marketplace.html`
- Page publique accessible sans wallet
- Connexion wallet pour acheter
- Royalties 10% automatiques (EIP-2981)

---

## Smart Contract
Contrat Solidity disponible dans l'onglet "Contrat" du Studio.
Déployez sur https://remix.ethereum.org avec Solidity 0.8.20.
