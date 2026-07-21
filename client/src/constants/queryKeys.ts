import type { ResourceParameters } from '@/types/api.types';

// TanStack Query key factories.
//
// Keys are structured hierarchically so that invalidation is precise:
//   bookKeys.all          → invalidates everything related to books
//   bookKeys.lists()      → invalidates all book lists
//   bookKeys.list(params) → invalidates one specific list with those params
//   bookKeys.detail(id)   → invalidates one specific book
//
// This pattern prevents stale cache issues and avoids over-invalidation.

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params: ResourceParameters) => [...bookKeys.lists(), params] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookKeys.details(), id] as const,
};

export const authorKeys = {
  all: ['authors'] as const,
  lists: () => [...authorKeys.all, 'list'] as const,
  details: () => [...authorKeys.all, 'detail'] as const,
  detail: (id: number) => [...authorKeys.details(), id] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

export const borrowingKeys = {
  all: ['borrowings'] as const,
  lists: () => [...borrowingKeys.all, 'list'] as const,
  list: (params: ResourceParameters) =>
    [...borrowingKeys.lists(), params] as const,
  mine: () => [...borrowingKeys.all, 'my-borrowings'] as const,
  details: () => [...borrowingKeys.all, 'detail'] as const,
  detail: (id: number) => [...borrowingKeys.details(), id] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  statistics: () => [...dashboardKeys.all, 'statistics'] as const,
};

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'me'] as const,
};
