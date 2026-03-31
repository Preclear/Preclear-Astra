/**
 * Canonical client routes — use these for Link/NavLink/navigate so paths stay in sync with App.tsx.
 */
export const paths = {
  home: '/',
  product: '/product',
  howItWorks: '/how-it-works',
  features: '/features',
  pricing: '/pricing',
  guides: '/guides',
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;
