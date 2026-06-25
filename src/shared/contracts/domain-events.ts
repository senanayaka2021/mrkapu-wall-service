export const DOMAIN_EVENT_SOURCE = 'mrkapu.backend';

export const DOMAIN_EVENT_TYPES = {
  userProfileUpdated: 'user.profile.updated',
  wallPostCreated: 'wall.post.created',
  wallPostUpdated: 'wall.post.updated',
  wallPostDeleted: 'wall.post.deleted',
  messageCreated: 'message.created',
  venueUpdated: 'venue.updated',
  serviceCatalogUpdated: 'service.catalog.updated',
  advertisementUpdated: 'advertisement.updated',
  botCommandTick: 'bot.command.tick',
  botCommandBootstrap: 'bot.command.bootstrap',
} as const;

export interface DomainEvent<T = unknown> {
  version: number;
  type: string;
  emittedAt: string;
  detail: T;
}

export function createDomainEvent<T = unknown>(
  type: string,
  detail: T,
): DomainEvent<T> {
  return {
    version: 1,
    type,
    emittedAt: new Date().toISOString(),
    detail,
  };
}
