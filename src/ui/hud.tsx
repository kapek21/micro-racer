import { useEffect, type ReactNode, useState } from 'react';
import { isGameMuted, toggleGameMute } from '../audio/audio-bind.js';
import { useHudStore } from './hud-store.js';
import { VEHICLE_SPRITE_URLS } from '../config/asset-paths.js';
import { VEHICLES } from '../config/vehicles.js';
import { GAME_MODES } from '../config/game-modes.js';
import { TRACKS } from '../config/tracks/index.js';
import { COSMETICS, buyCosmetic, isTrackUnlocked } from '../meta/profile.js';
import { TouchControls } from './touch-controls.js';

interface HudProps {
  onStart(): void;
  onRestart(): void;
  onMenu(): void;
  racing: boolean;
}

export function Hud({ onStart, onRestart, onMenu, racing }: HudProps): JSX.Element {
  const snap = useHudStore((s) => s.snapshot);
  const profile = useHudStore((s) => s.profile);
  const setSnapshot = useHudStore((s) => s.setSnapshot);
  const reloadProfile = useHudStore((s) => s.reloadProfile);
  const [muted, setMuted] = useState(isGameMuted());

  useEffect(() => {
    if (!racing) reloadProfile();
  }, [racing, reloadProfile]);

  if (!racing && snap.phase === 'menu') {
    return (
      <div className="menu-overlay absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-4">
        <div className="panel pointer-events-auto my-auto w-full max-w-lg p-5">
          <header className="mb-4 text-center">
            <p className="text-xs tracking-[0.3em] text-cyan-400">MICRO CIRCUIT</p>
            <h1 className="font-display text-xl text-white">Smart Rush</h1>
            <p className="mt-1 text-xs text-white/50">
              Lvl {profile.driverLevel} · {profile.coins} monet · {profile.totalWins} wygranych
            </p>
          </header>

          <nav className="mb-4 flex gap-2">
            {(['race', 'progress', 'shop'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn flex-1 ${snap.menuScreen === tab ? 'tab-btn-on' : ''}`}
                onClick={() => setSnapshot({ menuScreen: tab })}
              >
                {tab === 'race' ? 'WYŚCIG' : tab === 'progress' ? 'POSTĘP' : 'SKLEP'}
              </button>
            ))}
          </nav>

          {snap.menuScreen === 'race' && (
            <>
              <Section title="Pojazd">
                <div className="grid grid-cols-2 gap-2">
                  {VEHICLES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`vehicle-btn ${snap.selectedVehicleId === v.id ? 'vehicle-btn-on' : ''}`}
                      onClick={() => setSnapshot({ selectedVehicleId: v.id })}
                    >
                      <div className="vehicle-preview">
                        <img
                          src={VEHICLE_SPRITE_URLS[v.id]}
                          alt=""
                          className="vehicle-preview-img"
                          draggable={false}
                        />
                      </div>
                      <span className="font-display text-[10px]">{v.namePl}</span>
                      <span className="text-white/50">{v.class}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Trasa">
                <div className="max-h-36 space-y-1 overflow-y-auto">
                  {TRACKS.map((t) => {
                    const locked = !isTrackUnlocked(profile, t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={locked}
                        className={`track-btn w-full ${snap.selectedTrackId === t.id ? 'track-btn-on' : ''} ${locked ? 'opacity-40' : ''}`}
                        onClick={() => setSnapshot({ selectedTrackId: t.id })}
                      >
                        <span>{t.namePl}</span>
                        <span className="text-white/40">{locked ? '🔒' : t.biome}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Tryb">
                <div className="grid grid-cols-2 gap-2">
                  {GAME_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mode-btn ${snap.selectedModeId === m.id ? 'mode-btn-on' : ''}`}
                      onClick={() => setSnapshot({ selectedModeId: m.id })}
                      title={m.descriptionPl}
                    >
                      {m.namePl}
                    </button>
                  ))}
                </div>
              </Section>

          <p className="mb-3 text-[10px] text-white/45">
            A/D lub ←→ skręt · auto-gaz · S hamulec · Shift drift · Space boost · E power-up
          </p>
              <button
                type="button"
                className="btn-primary w-full disabled:opacity-40"
                disabled={!snap.assetsReady}
                onClick={onStart}
              >
                {snap.assetsReady ? 'START' : 'ŁADOWANIE…'}
              </button>
            </>
          )}

          {snap.menuScreen === 'progress' && (
            <div className="space-y-3 text-xs">
              <Stat label="Poziom kierowcy" value={`${profile.driverLevel} (${profile.driverXp} XP)`} />
              <Stat label="Wyścigi" value={`${profile.totalRaces} (${profile.totalWins} wygranych)`} />
              <Stat label="Odblokowane trasy" value={`${profile.unlockedTracks.length}/10`} />
              <div>
                <p className="mb-1 text-white/50">Cele dzienne</p>
                {profile.dailyGoals.map((g) => (
                  <GoalRow key={g.id} label={g.labelPl} current={g.current} target={g.target} />
                ))}
              </div>
              <div>
                <p className="mb-1 text-white/50">Cele tygodniowe</p>
                {profile.weeklyGoals.map((g) => (
                  <GoalRow key={g.id} label={g.labelPl} current={g.current} target={g.target} />
                ))}
              </div>
            </div>
          )}

          {snap.menuScreen === 'shop' && (
            <div className="max-h-80 space-y-2 overflow-y-auto text-xs">
              {COSMETICS.map((c) => {
                const owned = profile.ownedCosmetics.includes(c.id);
                return (
                  <div key={c.id} className="shop-row flex items-center justify-between gap-2">
                    <div>
                      <div>{c.namePl}</div>
                      <div className="text-white/40">{c.kind}</div>
                    </div>
                    {owned ? (
                      <span className="text-green-400">Posiadane</span>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1"
                        onClick={() => {
                          buyCosmetic(profile, c.id);
                          reloadProfile();
                        }}
                      >
                        {c.price} 🪙
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between p-3">
        <div className="panel text-xs">
          <div className="text-white/50">POZYCJA</div>
          <div className="font-display text-lg">
            {snap.position}/{snap.racerCount}
          </div>
        </div>
        <div className="panel text-center text-xs">
          <div className="text-white/50">
            {snap.checkpointTotal > 0 ? 'CHECKPOINT' : 'OKRĄŻENIE'}
          </div>
          <div className="font-display text-lg">
            {snap.checkpointTotal > 0
              ? `${snap.checkpointIndex}/${snap.checkpointTotal}`
              : `${snap.lap}/${snap.lapCount}`}
          </div>
        </div>
        <div className="panel text-right text-xs">
          <div className="text-white/50">KM/H*</div>
          <div className="font-display text-lg">{Math.round(snap.speed * 0.45)}</div>
        </div>
      </div>

      {snap.phase === 'countdown' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="font-display text-5xl text-cyan-300">
            {Math.ceil(snap.countdownMs / 1000)}
          </span>
        </div>
      )}

      {snap.message && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-10 flex justify-center">
          <span className="banner">{snap.message}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-between p-3">
        <div className="panel text-[10px]">
          <div className="text-white/40">{snap.trackLabel} · {snap.modeLabel}</div>
          {snap.boostActive && <span className="text-orange-400">BOOST </span>}
          {snap.shieldActive && <span className="text-cyan-300">SHIELD </span>}
          {snap.heldPowerUp && <span className="text-pink-400">PWR: {snap.heldPowerUp}</span>}
          {snap.eliminationStrikes > 0 && (
            <span className="text-red-400"> POZA KADREM: {snap.eliminationStrikes}</span>
          )}
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="pointer-events-auto panel px-2 py-1 text-[10px]"
            onClick={() => setMuted(toggleGameMute())}
            aria-label={muted ? 'Włącz dźwięk' : 'Wycisz'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <div className="panel text-[10px] text-white/60">
            {(snap.timeMs / 1000).toFixed(1)}s · 🪙{snap.tokensCollected}
          </div>
        </div>
      </div>

      {snap.phase === 'racing' && <TouchControls />}

      {snap.phase === 'finished' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75">
          <div className="panel pointer-events-auto p-6 text-center">
            <h2 className="mb-2 font-display text-lg">
              {snap.position === 1 ? 'WYGRANA!' : `MIEJSCE ${snap.position}`}
            </h2>
            <p className="mb-1 text-sm text-white/70">+{snap.coinsEarned} monet · styl +{snap.stylePoints}</p>
            <button type="button" className="btn-primary mb-2 w-full" onClick={onRestart}>
              JESZCZE RAZ
            </button>
            <button type="button" className="btn-secondary w-full" onClick={onMenu}>
              MENU
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <div className="mb-3">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-white/45">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex justify-between border-b border-white/10 py-1">
      <span className="text-white/50">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function GoalRow({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}): JSX.Element {
  return (
    <div className="mb-1 flex justify-between">
      <span>{label}</span>
      <span className={current >= target ? 'text-green-400' : 'text-white/60'}>
        {current}/{target}
      </span>
    </div>
  );
}
