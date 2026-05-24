/**
 * maintenance-bus — Tiny event-bus so any onClick anywhere in the tree can
 * `openMaintenanceModal({...})` without prop-drilling. Layout.tsx mounts a
 * single MaintenanceModal that subscribes via useMaintenanceModalState().
 *
 * Wave I7 — Maintenance-Mode Frontend (2026-05-24)
 */

import { useEffect, useState } from 'react';

export interface MaintenancePayload {
  interest?: string;
  source?: string;
  title?: string;
  message?: string;
}

type Listener = (payload: MaintenancePayload | null) => void;

const listeners = new Set<Listener>();
let current: MaintenancePayload | null = null;

export function openMaintenanceModal(payload: MaintenancePayload = {}): void {
  current = payload;
  listeners.forEach((l) => l(current));
}

export function closeMaintenanceModal(): void {
  current = null;
  listeners.forEach((l) => l(null));
}

export function useMaintenanceModalState(): {
  open: boolean;
  payload: MaintenancePayload | null;
} {
  const [state, setState] = useState<MaintenancePayload | null>(current);
  useEffect(() => {
    const l: Listener = (p) => setState(p);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { open: state !== null, payload: state };
}
