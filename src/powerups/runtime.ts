import type {
  ActivePowerUp,
  FoamPatch,
  MineState,
  PickupState,
  RacerState,
  TokenState,
} from '../core/types.js';
import { isOffensivePowerUp, powerUpById } from '../config/powerups.js';

export function activatePowerUp(
  racer: RacerState,
  id: string,
  all: RacerState[],
  mines: MineState[],
  foam: FoamPatch[],
): void {
  const def = powerUpById(id);
  switch (def.id) {
    case 'turbo_cell':
      racer.boostMs = Math.max(racer.boostMs, def.durationMs ?? 2000);
      break;
    case 'overcharge_boost':
      racer.overchargeMs = def.durationMs ?? 2800;
      racer.boostMs = Math.max(racer.boostMs, def.durationMs ?? 2800);
      break;
    case 'side_dash': {
      const nx = -Math.sin(racer.angle);
      const ny = Math.cos(racer.angle);
      racer.vx += nx * 280;
      racer.vy += ny * 280;
      racer.sideDashCooldownMs = 1200;
      break;
    }
    case 'smart_grip':
      racer.gripMs = def.durationMs ?? 3500;
      break;
    case 'emp_pulse':
      applyEmp(racer, all);
      break;
    case 'nano_mine':
      mines.push({
        id: `mine_${racer.id}_${Date.now()}`,
        ownerId: racer.id,
        x: racer.x - Math.cos(racer.angle) * 24,
        y: racer.y - Math.sin(racer.angle) * 24,
        lifeMs: 12000,
      });
      break;
    case 'drone_zap': {
      let nearest: RacerState | null = null;
      let best = Infinity;
      for (const o of all) {
        if (o.id === racer.id || o.eliminated) continue;
        const d = Math.hypot(o.x - racer.x, o.y - racer.y);
        if (d < best && d < 200) {
          best = d;
          nearest = o;
        }
      }
      if (nearest) {
        racer.droneZapTargetId = nearest.id;
        racer.droneZapTimerMs = def.durationMs ?? 2500;
      }
      break;
    }
    case 'paint_foam':
      racer.paintFoamMs = def.durationMs ?? 4000;
      foam.push({ x: racer.x, y: racer.y, lifeMs: 5000 });
      break;
    case 'shield_bubble':
      racer.shieldMs = def.durationMs ?? 4000;
      break;
    case 'auto_correct':
      racer.autoCorrectMs = def.durationMs ?? 5000;
      break;
    case 'jam_blocker':
      racer.jamBlockerMs = def.durationMs ?? 6000;
      break;
    case 'camera_cloak':
      racer.cameraCloakMs = def.durationMs ?? 4500;
      break;
    case 'gate_hack':
      racer.gateHackMs = def.durationMs ?? 5000;
      break;
    case 'charge_link':
      racer.chargeLinkMs = def.durationMs ?? 6000;
      break;
    case 'magnet_pull':
      racer.magnetMs = def.durationMs ?? 3500;
      break;
  }
  racer.heldPowerUp = null;
}

function applyEmp(racer: RacerState, all: RacerState[]): void {
  for (const other of all) {
    if (other.id === racer.id || other.eliminated) continue;
    if (Math.hypot(other.x - racer.x, other.y - racer.y) > 120) continue;
    if (other.jamBlockerMs > 0) {
      other.jamBlockerMs = 0;
      continue;
    }
    if (other.shieldMs > 0) {
      other.shieldMs = 0;
      continue;
    }
    other.empSlowMs = 1800;
    other.boostMs = 0;
  }
}

export function tryCollectPickup(racer: RacerState, pickup: PickupState, offensiveAllowed: boolean): boolean {
  if (!pickup.active || racer.eliminated) return false;
  if (Math.hypot(racer.x - pickup.x, racer.y - pickup.y) > 36) return false;
  if (racer.heldPowerUp) return false;
  if (!offensiveAllowed && isOffensivePowerUp(pickup.powerUpId)) return false;
  const def = powerUpById(pickup.powerUpId);
  racer.heldPowerUp = {
    id: def.id,
    remainingMs: def.durationMs ?? 0,
    charges: def.charges ?? 1,
  };
  pickup.active = false;
  pickup.respawnTimerMs = pickup.respawnMs;
  return true;
}

export function tickPowerUpTimers(racer: RacerState, dtMs: number): void {
  const dec = (field: keyof RacerState) => {
    const v = racer[field];
    if (typeof v === 'number' && v > 0) (racer[field] as number) = Math.max(0, v - dtMs);
  };
  dec('boostMs');
  dec('boostCooldownMs');
  dec('shieldMs');
  dec('gripMs');
  dec('empSlowMs');
  dec('overchargeMs');
  dec('jamBlockerMs');
  dec('cameraCloakMs');
  dec('autoCorrectMs');
  dec('magnetMs');
  dec('chargeLinkMs');
  dec('gateHackMs');
  dec('paintFoamMs');
  dec('sideDashCooldownMs');

  if (racer.droneZapTimerMs > 0) {
    racer.droneZapTimerMs -= dtMs;
    if (racer.droneZapTimerMs <= 0) racer.droneZapTargetId = null;
  }
}

export function useHeldPowerUp(
  racer: RacerState,
  all: RacerState[],
  mines: MineState[],
  foam: FoamPatch[],
): void {
  if (!racer.heldPowerUp || racer.eliminated) return;
  activatePowerUp(racer, racer.heldPowerUp.id, all, mines, foam);
}

export function tickPickups(pickups: PickupState[], dtMs: number): void {
  for (const p of pickups) {
    if (p.active) continue;
    p.respawnTimerMs -= dtMs;
    if (p.respawnTimerMs <= 0) p.active = true;
  }
}

export function tickMines(mines: MineState[], racers: RacerState[], dtMs: number): void {
  for (let i = mines.length - 1; i >= 0; i--) {
    const m = mines[i]!;
    m.lifeMs -= dtMs;
    if (m.lifeMs <= 0) {
      mines.splice(i, 1);
      continue;
    }
    for (const r of racers) {
      if (r.eliminated || r.id === m.ownerId) continue;
      if (Math.hypot(r.x - m.x, r.y - m.y) > 22) continue;
      if (r.shieldMs > 0 || r.jamBlockerMs > 0) {
        mines.splice(i, 1);
        break;
      }
      r.empSlowMs = 1200;
      r.vx *= 0.4;
      r.vy *= 0.4;
      mines.splice(i, 1);
      break;
    }
  }
}

export function tickFoam(foam: FoamPatch[], racers: RacerState[], dtMs: number): void {
  for (let i = foam.length - 1; i >= 0; i--) {
    const f = foam[i]!;
    f.lifeMs -= dtMs;
    if (f.lifeMs <= 0) foam.splice(i, 1);
  }
  for (const r of racers) {
    if (r.eliminated) continue;
    for (const f of foam) {
      if (Math.hypot(r.x - f.x, r.y - f.y) < 30) {
        r.gripMs = 0;
        r.vx *= 0.92;
        r.vy *= 0.92;
      }
    }
    if (r.paintFoamMs > 0 && Math.random() < 0.08) {
      foam.push({ x: r.x, y: r.y, lifeMs: 4000 });
    }
  }
}

export function tickDroneZap(racers: RacerState[]): void {
  for (const r of racers) {
    if (!r.droneZapTargetId || r.droneZapTimerMs <= 0) continue;
    const target = racers.find((x) => x.id === r.droneZapTargetId);
    if (!target || target.eliminated) continue;
    if (r.droneZapTimerMs < 800) {
      if (target.jamBlockerMs > 0) {
        target.jamBlockerMs = 0;
      } else if (target.shieldMs > 0) {
        target.shieldMs = 0;
      } else {
        target.empSlowMs = 1500;
      }
      r.droneZapTargetId = null;
      r.droneZapTimerMs = 0;
    }
  }
}

export function magnetPull(racer: RacerState, pickups: PickupState[], tokens: TokenState[]): void {
  if (racer.magnetMs <= 0) return;
  for (const p of pickups) {
    if (!p.active) continue;
    const d = Math.hypot(p.x - racer.x, p.y - racer.y);
    if (d > 180 || d < 8) continue;
    const pull = 120 / d;
    p.x += (racer.x - p.x) * pull * 0.016;
    p.y += (racer.y - p.y) * pull * 0.016;
  }
  for (const t of tokens) {
    if (!t.active) continue;
    const d = Math.hypot(t.x - racer.x, t.y - racer.y);
    if (d > 180 || d < 8) continue;
    const pull = 120 / d;
    t.x += (racer.x - t.x) * pull * 0.016;
    t.y += (racer.y - t.y) * pull * 0.016;
  }
}

export function initPickups(
  spawns: { id: string; powerUpId: string; x: number; y: number; respawnMs: number }[],
): PickupState[] {
  return spawns.map((s) => ({
    spawnId: s.id,
    powerUpId: s.powerUpId,
    x: s.x,
    y: s.y,
    active: true,
    respawnTimerMs: 0,
    respawnMs: s.respawnMs,
  }));
}

export function initTokens(spawns: { id: string; x: number; y: number }[]): TokenState[] {
  return spawns.map((s) => ({ id: s.id, x: s.x, y: s.y, active: true }));
}

export function tryCollectToken(racer: RacerState, tokens: TokenState[]): void {
  for (const t of tokens) {
    if (!t.active) continue;
    if (Math.hypot(racer.x - t.x, racer.y - t.y) > 28) continue;
    t.active = false;
    racer.tokensCollected += 1;
  }
}

export function heldLabel(p: ActivePowerUp | null): string {
  if (!p) return '';
  return powerUpById(p.id).namePl;
}

/** Battle lap: replace pickups with offensive pool. */
export function battleLapPickups(
  pickups: PickupState[],
): void {
  const pool = ['emp_pulse', 'nano_mine', 'drone_zap', 'paint_foam', 'turbo_cell', 'shield_bubble'];
  pickups.forEach((p, i) => {
    p.powerUpId = pool[i % pool.length]!;
  });
}
