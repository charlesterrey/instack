import type { UserRole } from '../types/user.types';

export const USER_ROLES = ['admin', 'creator', 'viewer'] as const satisfies readonly UserRole[];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  creator: 'Createur',
  viewer: 'Lecteur',
};
