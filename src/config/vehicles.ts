import type { VehicleConfig } from '../core/types.js';

export const VEHICLES: VehicleConfig[] = [
  {
    id: 'volt_mini_gt',
    name: 'Volt Mini GT',
    namePl: 'Volt Mini GT',
    class: 'balanced',
    color: 0x20c8e8,
    accent: 0x0a6080,
    acceleration: 520,
    topSpeed: 420,
    traction: 0.92,
    turnRate: 3.8,
    collisionResistance: 0.85,
    boostEfficiency: 1,
    recoverySpeed: 1,
  },
  {
    id: 'sweep_x_buggy',
    name: 'Sweep-X Drone Buggy',
    namePl: 'Sweep-X Buggy',
    class: 'agile',
    color: 0x40e878,
    accent: 0x188840,
    acceleration: 480,
    topSpeed: 390,
    traction: 0.98,
    turnRate: 4.6,
    collisionResistance: 0.65,
    boostEfficiency: 0.95,
    recoverySpeed: 1.15,
  },
  {
    id: 'charge_van',
    name: 'Charge Van E-Micro',
    namePl: 'Charge Van',
    class: 'heavy',
    color: 0xffa030,
    accent: 0x904010,
    acceleration: 440,
    topSpeed: 400,
    traction: 0.88,
    turnRate: 3.2,
    collisionResistance: 1.25,
    boostEfficiency: 0.9,
    recoverySpeed: 0.85,
  },
  {
    id: 'photon_racer',
    name: 'Photon Racer R',
    namePl: 'Photon Racer R',
    class: 'speed',
    color: 0xff4080,
    accent: 0x901040,
    acceleration: 500,
    topSpeed: 470,
    traction: 0.78,
    turnRate: 3.5,
    collisionResistance: 0.7,
    boostEfficiency: 1.2,
    recoverySpeed: 0.9,
  },
];

export function vehicleById(id: string): VehicleConfig {
  const v = VEHICLES.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown vehicle: ${id}`);
  return v;
}
