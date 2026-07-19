/** Studio host bridge — dices-2048-3d envelope (READY / PING→PONG / ROUND_FINISHED). */

const PROTOCOL = 'dices-2048-3d' as const;
const PROTOCOL_VERSION = '0.1.0';
const GAME_VERSION = '0.2.0';

interface Envelope {
  protocol: typeof PROTOCOL;
  protocolVersion: string;
  id: string;
  timestamp: number;
  correlationId?: string;
  type: string;
  payload: Record<string, unknown>;
}

function trustedOrigins(): string[] {
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
    const raw = env?.VITE_TRUSTED_ORIGINS?.trim();
    if (!raw) return ['*'];
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  } catch {
    return ['*'];
  }
}

export class MetabotBridge {
  private readonly origins = trustedOrigins();
  private parentOrigin: string | null = null;
  private readonly queue: Envelope[] = [];

  start(): void {
    if (typeof window === 'undefined' || window.parent === window) return;
    window.addEventListener('message', this.onMessage);
    // Broadcast READY with * so Studio can discover us before INIT locks origin.
    const ready = this.makeEnvelope('READY', {
      game_version: GAME_VERSION,
      capabilities: ['micro_racer', 'telemetry'],
    });
    window.parent.postMessage(ready, '*');
  }

  stop(): void {
    window.removeEventListener('message', this.onMessage);
  }

  reportRaceFinished(score: number, meta: {
    position: number;
    buildPoints: number;
    timePoints: number;
    finishTimeMs: number;
    trackId: string;
  }): void {
    if (typeof window === 'undefined' || window.parent === window) return;
    this.send('ROUND_FINISHED', {
      final_score: Math.max(0, Math.round(score)),
      position: meta.position,
      build_points: meta.buildPoints,
      time_points: meta.timePoints,
      finish_time_ms: meta.finishTimeMs,
      track_id: meta.trackId,
    });
  }

  private makeEnvelope(
    type: string,
    payload: Record<string, unknown>,
    correlationId?: string,
  ): Envelope {
    return {
      protocol: PROTOCOL,
      protocolVersion: PROTOCOL_VERSION,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      payload,
      ...(correlationId ? { correlationId } : {}),
    };
  }

  private send(type: string, payload: Record<string, unknown>, correlationId?: string): void {
    const env = this.makeEnvelope(type, payload, correlationId);
    if (this.parentOrigin === null) {
      this.queue.push(env);
      return;
    }
    window.parent.postMessage(env, this.parentOrigin);
  }

  private flush(): void {
    if (this.parentOrigin === null) return;
    for (const env of this.queue) window.parent.postMessage(env, this.parentOrigin);
    this.queue.length = 0;
  }

  private readonly onMessage = (ev: MessageEvent): void => {
    if (!this.origins.includes('*') && !this.origins.includes(ev.origin)) return;
    const msg = ev.data as Partial<Envelope> | null;
    if (!msg || msg.protocol !== PROTOCOL || typeof msg.type !== 'string') return;

    if (msg.type === 'INIT') {
      this.parentOrigin = ev.origin;
      this.flush();
    }

    if (msg.type === 'PING') {
      const p = (msg.payload ?? {}) as Record<string, unknown>;
      this.send(
        'PONG',
        { server_time_ms: p['server_time_ms'], received_at_ms: Date.now() },
        msg.id,
      );
    } else if (msg.type !== 'ACK') {
      this.send('ACK', { status: 'ok' }, msg.id);
    }
  };
}
