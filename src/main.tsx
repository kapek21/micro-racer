import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GameLoop } from './core/game-loop.js';
import { trackById } from './config/tracks/index.js';
import { gameModeById } from './config/game-modes.js';
import { InputManager } from './input/input-manager.js';
import { PixiApp } from './render/pixi-app.js';
import { RaceRenderer } from './render/race-renderer.js';
import { createRaceState, playerRacer, tickRace } from './race/race-sim.js';
import type { RaceState } from './core/types.js';
import { heldLabel } from './powerups/runtime.js';
import { powerUpVisual } from './config/powerup-visuals.js';
import { Hud } from './ui/hud.js';
import { useHudStore } from './ui/hud-store.js';
import { applyRaceResult } from './meta/profile.js';
import { GameAudio, RaceAudioController } from './audio/game-audio.js';
import { bindGameAudio, unbindGameAudio } from './audio/audio-bind.js';
import './index.css';

function syncHud(state: RaceState, trackName: string, modeName: string, checkpointTotal: number): void {
  const player = playerRacer(state);
  useHudStore.getState().setSnapshot({
    phase: state.phase,
    lap: Math.min(player.lap + 1, state.lapCount),
    lapCount: state.lapCount,
    position: player.position,
    racerCount: state.racers.filter((r) => !r.eliminated).length,
    speed: Math.round(player.speed),
    timeMs: state.timeMs,
    countdownMs: state.countdownMs,
    message: state.messageTimerMs > 0 ? state.message : '',
    boostActive: player.boostMs > 0,
    shieldActive: player.shieldMs > 0,
    heldPowerUp: heldLabel(player.heldPowerUp),
    heldPowerUpSymbol: player.heldPowerUp ? powerUpVisual(player.heldPowerUp.id).symbol : '',
    heldPowerUpCharges: player.heldPowerUp?.charges ?? 0,
    coinsEarned: state.coinsEarned,
    stylePoints: state.stylePoints,
    tokensCollected: player.tokensCollected,
    trackLabel: trackName,
    modeLabel: modeName,
    eliminationStrikes: player.eliminationStrikes,
    checkpointIndex: player.checkpointIndex,
    checkpointTotal,
    currentLapMs: state.currentLapMs,
    bestLapMs: state.bestLapMs,
    deltaParMs: state.deltaParMs,
    nextCheckpointLabel: state.nextCheckpointLabel,
    nextCheckpointDeadlineMs: state.nextCheckpointDeadlineMs,
    raceScore: state.raceScore,
    parTimeMs: state.parTimeMs,
    targetLapMs: state.targetLapMs,
  });
}

function App(): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<RaceState | null>(null);
  const trackRef = useRef(trackById('smart_kitchen'));
  const inputRef = useRef(new InputManager());
  const finishedRef = useRef(false);

  const selectedVehicle = useHudStore((s) => s.snapshot.selectedVehicleId);
  const selectedTrack = useHudStore((s) => s.snapshot.selectedTrackId);
  const selectedMode = useHudStore((s) => s.snapshot.selectedModeId);
  const phase = useHudStore((s) => s.snapshot.phase);
  const assetsReady = useHudStore((s) => s.snapshot.assetsReady);

  useEffect(() => {
    let cancelled = false;
    let loop: GameLoop | null = null;
    let ro: ResizeObserver | null = null;
    const host = hostRef.current;
    if (!host) return;

    const pixi = new PixiApp();
    const input = inputRef.current;
    const audio = new GameAudio();
    bindGameAudio(audio);
    const raceAudio = new RaceAudioController(audio);
    input.attach();
    let renderer: RaceRenderer | null = null;

    const unlockAudio = (): void => {
      audio.unlock();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    void pixi.init(host).then(async () => {
      if (cancelled) {
        pixi.destroy();
        return;
      }
      renderer = await RaceRenderer.create(pixi);
      useHudStore.getState().setSnapshot({ assetsReady: true });
      pixi.resize();
      ro = new ResizeObserver(() => pixi.resize());
      ro.observe(host);

      loop = new GameLoop(
        1000 / 60,
        (dtMs) => {
          const state = stateRef.current;
          const track = trackRef.current;
          if (!state || state.phase === 'menu') return;
          const active = state.phase === 'racing' || state.phase === 'countdown';
          tickRace(state, track, input.poll(active), dtMs);
          raceAudio.tick(state, dtMs);
          const modeCfg = gameModeById(state.mode);

          if (state.phase === 'finished' && !finishedRef.current) {
            finishedRef.current = true;
            const player = playerRacer(state);
            applyRaceResult(useHudStore.getState().profile, {
              trackId: track.id,
              vehicleId: player.vehicleId,
              mode: state.mode,
              position: player.position,
              won: player.position === 1 || (state.mode === 'time_trial' && player.finished),
              coinsEarned: state.coinsEarned,
              tokensCollected: player.tokensCollected,
              finishTimeMs: player.finishTimeMs,
              empUses: state.empUsesThisRace,
            });
            useHudStore.getState().reloadProfile();
          }

          syncHud(state, track.namePl, modeCfg.namePl, track.checkpoints.length);
        },
        () => {
          const state = stateRef.current;
          const track = trackRef.current;
          if (state && renderer) renderer.sync(state, track, 1000 / 60);
        },
      );
      loop.start();
    });

    return () => {
      cancelled = true;
      loop?.stop();
      ro?.disconnect();
      input.detach();
      audio.destroy();
      unbindGameAudio();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      pixi.destroy();
    };
  }, []);

  const startRace = (): void => {
    const track = trackById(selectedTrack);
    trackRef.current = track;
    finishedRef.current = false;
    stateRef.current = createRaceState(track, selectedVehicle, selectedMode);
    const modeCfg = gameModeById(selectedMode);
    syncHud(stateRef.current, track.namePl, modeCfg.namePl, track.checkpoints.length);
  };

  const backToMenu = (): void => {
    stateRef.current = null;
    finishedRef.current = false;
    useHudStore.getState().setSnapshot({ phase: 'menu', message: '' });
  };

  return (
    <div className="game-shell relative flex h-full w-full flex-col overflow-hidden">
      <div ref={hostRef} className="relative min-h-0 flex-1" />
      {!assetsReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#060a14]/90 backdrop-blur-sm">
          <div className="text-center">
            <p className="font-display text-sm tracking-[0.35em] text-cyan-400">MICRO CIRCUIT</p>
            <p className="mt-2 text-xs text-white/60">Ładowanie grafik…</p>
            <div className="mx-auto mt-4 h-1 w-32 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400/80" />
            </div>
          </div>
        </div>
      )}
      <Hud
        onStart={startRace}
        onRestart={startRace}
        onMenu={backToMenu}
        racing={phase !== 'menu'}
      />
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

declare global {
  namespace JSX {
    interface Element {}
  }
}
