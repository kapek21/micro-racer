import type { PlayerInput } from '../core/types.js';
import { readTouchInput } from '../ui/touch-controls.js';

export class InputManager {
  private keys = new Set<string>();
  private boost = false;
  private usePowerUp = false;
  private powerUpQueued = false;
  private attached = false;

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.attached = false;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);
    if (e.code === 'Space') {
      e.preventDefault();
      this.boost = true;
    }
    if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.powerUpQueued = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
    if (e.code === 'Space') this.boost = false;
  };

  poll(active: boolean): PlayerInput {
    if (!active) {
      return { steer: 0, throttle: 0, boost: false, usePowerUp: false };
    }

    let steer = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) steer -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) steer += 1;

    let throttle = 1;
    if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) throttle = 0.35;
    if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) throttle = 1;

    this.usePowerUp = this.powerUpQueued;
    this.powerUpQueued = false;

    const touch = readTouchInput();
    if (touch) {
      const t = touch.poll();
      touch.clearPower();
      return {
        steer: Math.abs(steer) > 0.1 ? steer : t.steer,
        throttle,
        boost: this.boost || t.boost,
        usePowerUp: this.usePowerUp || t.usePowerUp,
      };
    }

    return {
      steer,
      throttle,
      boost: this.boost,
      usePowerUp: this.usePowerUp,
    };
  }
}
