# AEVUM — Client Onboarding Guide

Für jeden neuen Kunden. Einmal lesen, dann Schritt für Schritt.

---

## Verzeichnisstruktur anlegen

```bash
CUSTOMER=<slug>        # z.B. ketolabs
PROJECT=<slug>         # z.B. collaglow
BOT_PORT=<freier-port> # z.B. 4120, 4121, 4122...

mkdir -p ~/projects/aevum/customers/$CUSTOMER/projects/$PROJECT/agent
mkdir -p ~/projects/aevum/customers/$CUSTOMER/projects/$PROJECT/dashboard
mkdir -p ~/projects/aevum/customers/$CUSTOMER/knowledge
```

## Dateien erstellen

```
customers/$CUSTOMER/
├── CUSTOMER.md              ← Kontakt, APIs, TG-IDs, Status
├── knowledge/
│   └── <projekt>-context.md ← Business-Kontext für Bot-Persona
└── projects/$PROJECT/
    ├── PROJECT.md           ← Scope, KPI-Schwellen, Onboarding-Checklist
    └── agent/
        ├── bot.js           ← aus Template kopieren + ENV-Namen anpassen
        ├── package.json
        ├── chats/           ← auto-erstellt
        └── state.json       ← auto-erstellt
```

---

## Bot aktivieren (5 Schritte)

### Schritt 1 — Kunde erstellt Bot bei BotFather (einmalig, manuell)
```
Telegram → @BotFather → /newbot
→ Name: "CollaGlow Agent"
→ Username: collaglow_aevum_bot
→ Token kommt zurück → an Carlos schicken
```

### Schritt 2 — Token + TG-User-ID in Env eintragen
```bash
# Kunden TG-User-ID herausfinden: @userinfobot im TG-Chat
# Dann in ~/.envs/_shared.env oder neues <customer>.env:
COLLAGLOW_BOT_TOKEN=<token-vom-botfather>
TOMMY_TG_USER_ID=<user-id>
COLLAGLOW_BOT_PORT=4120
```

### Schritt 3 — Dependencies installieren
```bash
cd ~/projects/aevum/customers/ketolabs/projects/collaglow/agent
npm install
```

### Schritt 4 — pm2 starten
```bash
pm2 start bot.js --name collaglow-bot --interpreter node
pm2 save
```

### Schritt 5 — Testen
```bash
pm2 logs collaglow-bot --lines 20
# Im TG: /start an den Bot schreiben → Antwort prüfen
```

---

## Bot-Template kopieren für neuen Kunden

```bash
# Aus Ketolabs kopieren, ENV-Variablen-Namen anpassen
cp ~/projects/aevum/customers/ketolabs/projects/collaglow/agent/bot.js \
   ~/projects/aevum/customers/<new-customer>/projects/<project>/agent/bot.js

# Dann im bot.js 3 Stellen anpassen:
# 1. COLLAGLOW_BOT_TOKEN → <PROJECT>_BOT_TOKEN
# 2. TOMMY_TG_USER_ID   → <CUSTOMER>_TG_USER_ID
# 3. COLLAGLOW_BOT_PORT → <PROJECT>_BOT_PORT
# 4. HTTP-Referer + X-Title anpassen
```

---

## Wann brauche ich mehr als 1 Bot?

| Situation | Bots |
|---|---|
| Kunde hat 1 Projekt | 1 Bot (Projekt = Kunde) |
| Kunde hat 2+ Projekte | 1 Master-Bot (Kunden-Ebene) + 1 Bot pro Projekt |
| Projekt hat 2+ Sub-Teams | 1 Bot pro Team (selten) |

---

## Ports-Vergabe (nicht doppelt belegen)

| Bot | Port |
|---|---|
| lennox-tg-bot | intern |
| kev-bot (Kevin Uhl / GTS) | 4101 |
| collaglow-bot | 4120 |
| nächster Kunde | 4121 |
| übernächster | 4122 |
