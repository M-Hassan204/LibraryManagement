// Role name constants matching the backend's AppRoles class exactly.

export const APP_ROLES = {
  Admin: 'Admin',
  Student: 'Student', // Legacy
  Librarian: 'Librarian',
  User: 'User',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
