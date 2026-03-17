import { Room } from '../types';

export const ROOMS: Room[] = [
  { id: 'elhc-101', buildingId: 'elhc', floorId: 'elhc-f1', roomNo: '101', name: 'ELHC 101', category: 'classroom', level: 1, capacity: 60, description: 'Standard lecture room with projector and whiteboard', accessible: true, featureId: 1 },
  { id: 'elhc-102', buildingId: 'elhc', floorId: 'elhc-f1', roomNo: '102', name: 'ELHC 102', category: 'classroom', level: 1, capacity: 60, description: 'Standard lecture room', accessible: true, featureId: 5 },
  { id: 'elhc-103', buildingId: 'elhc', floorId: 'elhc-f1', roomNo: '103', name: 'ELHC 103', category: 'classroom', level: 1, capacity: 60, description: 'Standard lecture room', accessible: true, featureId: 6 },
  { id: 'elhc-104', buildingId: 'elhc', floorId: 'elhc-f1', roomNo: '104', name: 'ELHC 104', category: 'classroom', level: 1, capacity: 60, description: 'Standard lecture room', accessible: true, featureId: 2 },
  { id: 'elhc-ladies', buildingId: 'elhc', floorId: 'elhc-f1', roomNo: 'T-L', name: 'Ladies Toilet', category: 'toilet', level: 1, accessible: true, featureId: 3 },
  { id: 'elhc-gents', buildingId: 'elhc', floorId: 'elhc-f1', roomNo: 'T-G', name: 'Gents Toilet', category: 'toilet', level: 1, accessible: true, featureId: 4 },
  { id: 'elhc-201', buildingId: 'elhc', floorId: 'elhc-f2', roomNo: '201', name: 'ELHC 201 - EC Lab', category: 'lab', level: 2, capacity: 30, description: 'Electronics & Circuits Laboratory', accessible: false },
  { id: 'elhc-202', buildingId: 'elhc', floorId: 'elhc-f2', roomNo: '202', name: 'ELHC 202 - DSP Lab', category: 'lab', level: 2, capacity: 30, description: 'Digital Signal Processing Lab', accessible: false },
  { id: 'ltc-audi', buildingId: 'ltc', floorId: 'ltc-f1', roomNo: 'A-01', name: 'Main Auditorium', category: 'hall', level: 1, capacity: 500, description: 'Main institute auditorium for convocations and events', accessible: true },
];
