// Namespace: auth — Login, Magic-Link-Verify, Token-Redirect.
export default {
  // Login
  loginEyebrow: 'Kunden-Portal · Login',
  googleSignIn: 'Mit Google anmelden',
  orWithEmail: 'oder mit Email',
  emailPlaceholder: 'du@firma.de',
  sending: 'Sende…',
  emailLinkBtn: 'Login-Link per Email',
  requestError: 'Konnte den Login-Link nicht anfordern. Bitte später erneut versuchen.',
  sentTitle: 'Login-Link unterwegs',
  sentBodyPrefix: 'Falls ein Account mit',
  sentBodySuffix: 'existiert, haben wir dir einen Login-Link per Email geschickt. Prüf dein Postfach (auch Spam).',
  useOtherEmail: 'Andere Email verwenden',
  helpLine: 'Google oder Email-Login für SaaS- und Shop-Nutzer.',
  helpLine2: 'Vollkunden erhalten ihren persönlichen Zugangs-Link per Email.',
  noAccess: 'Noch kein Zugang?',
  bookAudit: 'Audit buchen →',
  privacy: 'Datenschutz',
  imprint: 'Impressum',
  agb: 'AGB',

  // Verify
  verifying: 'Verifiziere…',
  verifyingHint: 'Wir prüfen deinen Magic-Link',
  loggedIn: 'Eingeloggt',
  loggedInAs: 'Eingeloggt als {{name}}',
  redirecting: 'Leite weiter zum Dashboard…',
  account: 'Account:',
  loginFailed: 'Login fehlgeschlagen',
  backToLogin: 'Zurück zum Login',
  errNoToken: 'Kein Token in der URL',
  errInvalidToken: 'Token ungültig oder abgelaufen',
  errUnknown: 'unbekannter Fehler',

  // Token redirect
  signingIn: 'Einloggen…',
} as const;
