import type { PlayerInput } from '../core/types.js';
import { readTouchInput } from '../ui/touch-controls.js';

export class InputManager {
  private keys = new Set<string>();
  private boost = false;
  private usePowerUp = false;
  private powerUpQueued = false;
  private attached = false;
  private steerSmooth = 0;

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.attached = false;
  }

  private onBlur = (): void => {
    this.keys.clear();
    this.boost = false;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);
    if (e.code === 'Space') {
      e.preventDefault();
      this.boost = true;
    }
    if (e.code === 'KeyE') {
      this.powerUpQueued = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
    if (e.code === 'Space') this.boost = false;
  };

  poll(active: boolean): PlayerInput {
    if (!active) {
      this.steerSmooth = 0;
      return { steer: 0, throttle: 0, brake: false, handbrake: false, boost: false, usePowerUp: false };
    }

    let steerTarget = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) steerTarget -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) steerTarget += 1;

    this.steerSmooth += (steerTarget - this.steerSmooth) * 0.32;
    const brake = this.keys.has('ArrowDown') || this.keys.has('KeyS');
    const handbrake = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');

    this.usePowerUp = this.powerUpQueued;
    this.powerUpQueued = false;

    const touch = readTouchInput();
    if (touch) {
      const t = touch.poll();
      touch.clearPower();
      const touchSteer = Math.abs(t.steer) > 0.08 ? t.steer : this.steerSmooth;
      return {
        steer: touchSteer,
        throttle: 1,
        brake: t.brake,
        handbrake: t.handbrake,
        boost: this.boost || t.boost,
        usePowerUp: this.usePowerUp || t.usePowerUp,
      };
    }

    return {
      steer: this.steerSmooth,
      throttle: 1,
      brake,
      handbrake,
      boost: this.boost,
      usePowerUp: this.usePowerUp,
    };
  }
}
