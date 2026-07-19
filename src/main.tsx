import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GameLoop } from './core/game-loop.js';
import { trackById } from './config/tracks/index.js';
import { gameModeById } from './config/game-modes.js';
import { composeVehicle, SURFACE_LABELS } from './config/parts.js';
import { InputManager } from './input/input-manager.js';
import { PixiApp } from './render/pixi-app.js';
import { RaceRenderer } from './render/race-renderer.js';
import { createRaceState, playerRacer, tickRace } from './race/race-sim.js';
import type { RaceState } from './core/types.js';
import { heldLabel } from './powerups/runtime.js';
import { Hud } from './ui/hud.js';
import { useHudStore } from './ui/hud-store.js';
import { applyRaceResult, equippedTrailId } from './meta/profile.js';
import { GameAudio, RaceAudioController } from './audio/game-audio.js';
import { bindGameAudio, unbindGameAudio } from './audio/audio-bind.js';
import { MetabotBridge } from './platform/metabot.js';
import './index.css';

function syncHud(state: RaceState, trackName: string, modeName: string, surfaceLabel: string): void {
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
    coinsEarned: state.coinsEarned,
    stylePoints: state.stylePoints,
    buildPoints: state.buildPoints,
    timePoints: state.timePoints,
    raceScore: state.raceScore,
    tokensCollected: player.tokensCollected,
    trackLabel: trackName,
    modeLabel: modeName,
    surfaceLabel,
    eliminationStrikes: player.eliminationStrikes,
    checkpointIndex: 0,
    checkpointTotal: 0,
  });
}

function App(): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<RaceState | null>(null);
  const trackRef = useRef(trackById('kitchen_8'));
  const inputRef = useRef(new InputManager());
  const finishedRef = useRef(false);
  const rendererRef = useRef<RaceRenderer | null>(null);
  const bridgeRef = useRef<MetabotBridge | null>(null);

  const selectedTrack = useHudStore((s) => s.snapshot.selectedTrackId);
  const phase = useHudStore((s) => s.snapshot.phase);
  const assetsReady = useHudStore((s) => s.snapshot.assetsReady);
  const buildOpen = useHudStore((s) => s.snapshot.buildOpen);

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
    const bridge = new MetabotBridge();
    bridgeRef.current = bridge;
    bridge.start();
    input.attach();

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
      const renderer = await RaceRenderer.create(pixi);
      rendererRef.current = renderer;
      renderer.setPlayerTrail(equippedTrailId(useHudStore.getState().profile));
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
              won: player.position === 1,
              coinsEarned: state.coinsEarned,
              tokensCollected: player.tokensCollected,
              finishTimeMs: player.finishTimeMs,
              buildPoints: state.buildPoints,
              timePoints: state.timePoints,
              raceScore: state.raceScore,
            });
            useHudStore.getState().reloadProfile();
            bridge.reportRaceFinished(state.raceScore, {
              position: player.position,
              buildPoints: state.buildPoints,
              timePoints: state.timePoints,
              finishTimeMs: player.finishTimeMs,
              trackId: track.id,
            });
          }

          syncHud(state, track.namePl, modeCfg.namePl, SURFACE_LABELS[track.surface]);
        },
        () => {
          const state = stateRef.current;
          const track = trackRef.current;
          if (state && rendererRef.current) rendererRef.current.sync(state, track, 1000 / 60);
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
      bridge.stop();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      pixi.destroy();
      rendererRef.current = null;
    };
  }, []);

  const startRace = (): void => {
    const track = trackById(selectedTrack);
    const build = useHudStore.getState().snapshot.pendingBuild;
    if (!build) {
      useHudStore.getState().setSnapshot({ buildOpen: true });
      return;
    }
    const composed = composeVehicle(
      build.wheelsId,
      build.bodyId,
      build.engineId,
      track.surface,
      build.skill,
      'player_build',
    );
    trackRef.current = track;
    finishedRef.current = false;
    rendererRef.current?.setPlayerTrail(equippedTrailId(useHudStore.getState().profile));
    stateRef.current = createRaceState(
      track,
      composed.vehicle.id,
      'standard_race',
      composed.buildPoints,
    );
    const modeCfg = gameModeById('standard_race');
    syncHud(stateRef.current, track.namePl, modeCfg.namePl, SURFACE_LABELS[track.surface]);
  };

  const backToMenu = (): void => {
    stateRef.current = null;
    finishedRef.current = false;
    useHudStore.getState().setSnapshot({
      phase: 'menu',
      message: '',
      pendingBuild: null,
      buildOpen: false,
    });
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
        onRestart={() => {
          useHudStore.getState().setSnapshot({ buildOpen: true, pendingBuild: null });
        }}
        onMenu={backToMenu}
        racing={phase !== 'menu' && !buildOpen}
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
