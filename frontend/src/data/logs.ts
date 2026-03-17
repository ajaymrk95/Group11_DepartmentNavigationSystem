import { LogEntry } from '../types';

export const INITIAL_LOGS: LogEntry[] = [
  { id: 'log-1', timestamp: '2024-03-10T08:30:00Z', admin: 'admin@nitc.ac.in', action: 'LOGIN', entity: 'Auth', details: 'Admin logged in' },
  { id: 'log-2', timestamp: '2024-03-10T09:00:00Z', admin: 'admin@nitc.ac.in', action: 'CREATE', entity: 'Building', entityId: 'elhc', entityName: 'ELHC', details: 'Created building Electronics & Hardware Complex' },
  { id: 'log-3', timestamp: '2024-03-10T09:15:00Z', admin: 'admin@nitc.ac.in', action: 'CREATE', entity: 'Floor', entityId: 'elhc-f1', entityName: 'ELHC Ground Floor', details: 'Added Ground Floor to ELHC building' },
  { id: 'log-4', timestamp: '2024-03-10T09:30:00Z', admin: 'admin@nitc.ac.in', action: 'CREATE', entity: 'Room', entityId: 'elhc-101', entityName: 'ELHC 101', details: 'Assigned room 101 as Classroom in ELHC Ground Floor' },
  { id: 'log-5', timestamp: '2024-03-10T10:00:00Z', admin: 'admin@nitc.ac.in', action: 'UPDATE', entity: 'Path', entityId: 'elhc-f1', entityName: 'ELHC Floor 1 Paths', details: 'Updated navigation paths for ELHC Ground Floor, toggled path id:5' },
];
