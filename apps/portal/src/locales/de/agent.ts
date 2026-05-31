// agent namespace — DE (Original)
// Quelle: components/agent/ProjectAgentChat.tsx

export default {
  defaultName: '{{project}} Assistant',
  welcome:
    'Hi — ich bin **{{name}}**, dein dedizierter KI-Assistent für *{{project}}*.\n\n' +
    'Ich habe ein eigenes Gedächtnis (Lennox-style file memory), das über alle Kanäle (Portal, Telegram, Terminal) hinweg gleich bleibt. Sag mir kurz was ansteht, oder bitte mich Sachen zu merken ("merk dir, …").',
  errTooMany: 'Zu viele Anfragen kurz hintereinander. Bitte kurz warten.',
  errConnectionStatus: 'Verbindung verloren (Status {{status}}).',
  memorySaved: 'Erinnerung gespeichert: {{label}}',
  memoryFallback: 'Erinnerung',
  errGeneric: 'Da ist gerade was schiefgelaufen. Bitte erneut versuchen.',
  errConnectionLost: 'Verbindung verloren. Bitte erneut versuchen.',
  badge: 'persistent memory · multi-channel',
  clearLocalTitle: 'Lokalen Verlauf löschen (Memory bleibt)',
  clearLocalLabel: 'Lokal',
  eraseAllTitle: 'Verlauf + Memory löschen (DSGVO)',
  eraseAllLabel: 'Alles',
  localCleared: 'Lokaler Verlauf gelöscht',
  eraseConfirm: 'Conversation + Agent-Memory komplett löschen? Das kann nicht rückgängig gemacht werden.',
  erased: 'Conversation + Memory komplett gelöscht',
  eraseFailed: 'Löschen fehlgeschlagen',
  inputPlaceholder: 'Schreib {{name}}…  (Enter = senden, Shift+Enter = neue Zeile)',
  inputAria: 'Nachricht eingeben',
  sendAria: 'Senden',
  typing: 'schreibt…',
};
