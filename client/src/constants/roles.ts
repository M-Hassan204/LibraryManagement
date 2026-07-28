// Role name constants matching the backend's AppRoles class exactly.

export const APP_ROLES = {
  Admin: 'Admin',
  Librarian: 'Librarian',
  Member: 'Member',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
