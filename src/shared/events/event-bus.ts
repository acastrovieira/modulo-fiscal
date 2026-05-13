import type { DomainEvent } from "@/shared/events/domain-event";

type EventHandler<TEvent extends DomainEvent = DomainEvent> = (event: TEvent) => Promise<void> | void;

const handlers = new Map<string, EventHandler[]>();

export function subscribe<TEvent extends DomainEvent>(type: TEvent["type"], handler: EventHandler<TEvent>) {
  const currentHandlers = handlers.get(type) ?? [];
  handlers.set(type, [...currentHandlers, handler as EventHandler]);
}

export async function publish(event: DomainEvent): Promise<void> {
  const currentHandlers = handlers.get(event.type) ?? [];
  await Promise.all(currentHandlers.map((handler) => handler(event)));
}
