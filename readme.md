# MyDivinos App

Un'applicazione mobile-first per ordinare vini e distillati tramite WhatsApp, integrata con database Supabase.

## 🚀 Features

- **Catalogo prodotti** organizzato per categorie (Vini, Distillati, Analcolici, Alimentare)
- **Sistema preferiti** per salvare i prodotti preferiti
- **Carrello intelligente** con gestione quantità
- **Storico ordini** completo con possibilità di clonazione
- **Invio ordini tramite WhatsApp** con messaggio formattato
- **Design responsive** ottimizzato per mobile
- **PWA ready** - installabile come app nativa

## 🛠️ Tecnologie

- **Frontend**: React 18, Tailwind CSS, Lucide React (icone)
- **Backend**: Supabase (database PostgreSQL)
- **Deploy**: Vercel
- **Comunicazione**: WhatsApp API per invio ordini

## 📋 Prerequisiti

- Node.js 16+ 
- Account Supabase
- Account Vercel (per deploy)

## 🔧 Setup Locale

1. **Clona il repository**
```bash
git clone https://github.com/tuousername/mydivinos-app.git
cd mydivinos-app
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili ambiente**
Crea un file `.env.local` nella root del progetto:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_WHATSAPP_NUMBER=393356222225
```

4. **Setup Database Supabase**
- Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
- Esegui lo script SQL fornito in `database/schema.sql` nell'SQL Editor di Supabase
- Copia l'URL del progetto e la chiave anon dalle impostazioni

5. **Avvia l'app in sviluppo**
```bash
npm start
```

L'app sarà disponibile su `http://localhost:3000`

## 🚀 Deploy su Vercel

### Setup Automatico
1. **Connetti a Vercel**
```bash
npm install -g vercel
vercel
```

2. **Configura le variabili ambiente in Vercel**
Nel dashboard Vercel, vai in Settings > Environment Variables e aggiungi:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY` 
- `REACT_APP_WHATSAPP_NUMBER`

3. **Deploy**
```bash
vercel --prod
```

### Setup GitHub
1. **Crea repository GitHub**
```bash
git remote add origin https://github.com/tuousername/mydivinos-app.git
git branch -M main
git add .
git commit -m "Initial commit: MyDivinos app"
git push -u origin main
```

2. **Connetti Vercel a GitHub**
- Vai su [vercel.com](https://vercel.com)
- Importa il repository GitHub
- Configura le variabili ambiente
- Deploy automatico ad ogni push

## 📱 Struttura del Progetto

```
mydivinos-app/
├── public/
│   ├── index.html          # HTML principale con meta PWA
│   ├── manifest.json       # Configurazione PWA
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── MyDivinos.jsx   # Componente principale
│   ├── lib/
│   │   └── supabase.js     # Client e API Supabase
│   ├── App.js              # App principale
│   ├── index.js            # Entry point React
│   ├── index.css           # Stili Tailwind
│   └── App.css             # Stili aggiuntivi
├── .env.local              # Variabili ambiente (non in git)
├── .gitignore              # File ignorati da git
├── package.json            # Dipendenze npm
├── vercel.json             # Configurazione Vercel
└── README.md               # Questo file
```

## 🗄️ Schema Database

Il database Supabase include le seguenti tabelle:

- **utenti**: Clienti dell'enoteca
- **macro_categorie**: Categorie principali (Vino, Distillati, etc.)
- **sub_categorie**: Sottocategorie per ogni macro categoria
- **prodotti**: Catalogo prodotti completo
- **prodotti_utente**: Prodotti visibili per ogni cliente
- **preferiti**: Prodotti preferiti per utente
- **ordini**: Storico ordini
- **ordini_prodotti**: Dettaglio prodotti per ordine

## 🔐 Sicurezza

- Le variabili ambiente sono gestite tramite Vercel
- Supabase Row Level Security disabilitato per semplicità (per ora)
- Autenticazione basata su numero di telefono hardcoded

## 🎨 Personalizzazione

### Aggiungere un nuovo utente
1. Inserisci l'utente nella tabella `utenti` in Supabase
2. Associa i prodotti nella tabella `prodotti_utente`
3. Modifica il componente per gestire l'autenticazione

### Modificare i colori
I colori principali sono definiti in Tailwind:
- `text-blue-900`: Testo principale
- `bg-blue-900`: Sfondo pulsanti
- `text-red-600`: Accento "My" nel logo

### Aggiungere nuovi prodotti
1. Inserisci in Supabase tramite SQL o dashboard
2. Associa alla sub_categoria corretta
3. Aggiungi alla tabella `prodotti_utente` per renderlo visibile

## 📞 Integrazione WhatsApp

L'app genera automaticamente messaggi formattati per WhatsApp con:
- Dati cliente
- Lista prodotti ordinati con codici e quantità
- Note aggiuntive
- Data e ora ordine

## 🔄 Funzionalità Avanzate

### Clonazione Ordini
- Clone ultimo ordine con un clic
- Clone da storico ordini
- Mantiene quantità e note originali

### Sistema Preferiti
- Salvataggio persistente in database
- Sezione dedicata in homepage
- Toggle rapido da ogni prodotto

### Gestione Offline
- Carrello mantenuto in memoria
- Sincronizzazione al reconnect
- Gestione errori di rete

## 🐛 Troubleshooting

### App non si carica
1. Verifica le variabili ambiente in Vercel
2. Controlla i log in Vercel Dashboard > Functions
3. Verifica la connessione a Supabase

### Prodotti non appaiono
1. Controlla che l'utente sia presente in `utenti`
2. Verifica le associazioni in `prodotti_utente`
3. Controlla la struttura dati in Supabase

### Ordini non si salvano
1. Verifica le credenziali Supabase
2. Controlla le policy RLS se abilitate
3. Verifica la struttura delle tabelle

## 📈 Roadmap Future

- [ ] Autenticazione multi-utente
- [ ] Gestione inventario in tempo reale
- [ ] Sistema di notifiche push
- [ ] Dashboard admin per gestione ordini
- [ ] Integrazione pagamenti
- [ ] Sistema di recensioni prodotti

## 🤝 Contributi

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 📞 Supporto

Per supporto tecnico o domande:
- Email: support@mydivinos.com
- WhatsApp: +39 335 622 2225

---

**MyDivinos** - La tua enoteca digitale 🍷
