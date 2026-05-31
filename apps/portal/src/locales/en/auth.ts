// Namespace: auth — login, magic-link verify, token redirect.
export default {
  // Login
  loginEyebrow: 'Customer Portal · Login',
  googleSignIn: 'Sign in with Google',
  orWithEmail: 'or with email',
  emailPlaceholder: 'you@company.com',
  sending: 'Sending…',
  emailLinkBtn: 'Login link via email',
  requestError: 'Could not request the login link. Please try again later.',
  sentTitle: 'Login link on its way',
  sentBodyPrefix: 'If an account with',
  sentBodySuffix: 'exists, we have sent you a login link by email. Check your inbox (and spam).',
  useOtherEmail: 'Use a different email',
  helpLine: 'Google or email login for SaaS and shop users.',
  helpLine2: 'Full customers receive their personal access link by email.',
  noAccess: 'No access yet?',
  bookAudit: 'Book an audit →',
  privacy: 'Privacy',
  imprint: 'Imprint',
  agb: 'Terms',

  // Verify
  verifying: 'Verifying…',
  verifyingHint: 'We are checking your magic link',
  loggedIn: 'Logged in',
  loggedInAs: 'Logged in as {{name}}',
  redirecting: 'Redirecting to the dashboard…',
  account: 'Account:',
  loginFailed: 'Login failed',
  backToLogin: 'Back to login',
  errNoToken: 'No token in the URL',
  errInvalidToken: 'Token invalid or expired',
  errUnknown: 'unknown error',

  // Token redirect
  signingIn: 'Signing in…',
} as const;
