// agent namespace — EN

export default {
  defaultName: '{{project}} Assistant',
  welcome:
    "Hi — I'm **{{name}}**, your dedicated AI assistant for *{{project}}*.\n\n" +
    'I have my own memory (Lennox-style file memory) that stays consistent across all channels (portal, Telegram, terminal). Tell me briefly what\'s up, or ask me to remember things ("remember that …").',
  errTooMany: 'Too many requests in a short time. Please wait a moment.',
  errConnectionStatus: 'Connection lost (status {{status}}).',
  memorySaved: 'Memory saved: {{label}}',
  memoryFallback: 'Memory',
  errGeneric: 'Something just went wrong. Please try again.',
  errConnectionLost: 'Connection lost. Please try again.',
  badge: 'persistent memory · multi-channel',
  clearLocalTitle: 'Clear local history (memory stays)',
  clearLocalLabel: 'Local',
  eraseAllTitle: 'Delete history + memory (GDPR)',
  eraseAllLabel: 'All',
  localCleared: 'Local history cleared',
  eraseConfirm: 'Delete conversation + agent memory completely? This cannot be undone.',
  erased: 'Conversation + memory completely deleted',
  eraseFailed: 'Deletion failed',
  inputPlaceholder: 'Message {{name}}…  (Enter = send, Shift+Enter = new line)',
  inputAria: 'Enter message',
  sendAria: 'Send',
  typing: 'typing…',
};
