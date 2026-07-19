import { useEffect, type ReactNode, useState } from 'react';
import { isGameMuted, toggleGameMute } from '../audio/audio-bind.js';
import { useHudStore, markHowToPlaySeen } from './hud-store.js';
import { SURFACE_LABELS } from '../config/parts.js';
import { TRACK_THUMB_URLS, UI_SPRITE_URLS } from '../config/asset-paths.js';
import { TRACKS, trackById } from '../config/tracks/index.js';
import {
  COSMETICS,
  buyCosmetic,
  equipCosmetic,
  isTrackUnlocked,
  equippedTrailId,
} from '../meta/profile.js';
import { TouchControls } from './touch-controls.js';
import { BuildMinigames } from './build-minigames.js';

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

  const selectedTrack = trackById(snap.selectedTrackId);

  if (snap.buildOpen) {
    return (
      <BuildMinigames
        surface={selectedTrack.surface}
        onCancel={() => setSnapshot({ buildOpen: false, pendingBuild: null })}
        onComplete={(result) => {
          setSnapshot({ buildOpen: false, pendingBuild: result });
          onStart();
        }}
      />
    );
  }

  if (!racing && snap.phase === 'menu') {
    return (
      <div className="menu-overlay absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-4">
        <div className="panel pointer-events-auto my-auto w-full max-w-lg p-5">
          <header className="mb-4 text-center">
            <img
              src={UI_SPRITE_URLS.logo}
              alt="Smart Rush"
              className="mx-auto mb-2 h-16 w-auto max-w-[90%] object-contain"
              draggable={false}
            />
            <p className="text-xs tracking-[0.3em] text-cyan-400">MICRO CIRCUIT</p>
            <p className="mt-1 text-xs text-white/50">
              Lvl {profile.driverLevel} · {profile.coins} monet · {profile.totalWins} wygranych
            </p>
          </header>

          <nav className="mb-4 flex flex-wrap gap-2">
            {(['race', 'how', 'progress', 'shop'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn flex-1 min-w-[4.5rem] ${snap.menuScreen === tab ? 'tab-btn-on' : ''}`}
                onClick={() => {
                  if (tab !== 'how') markHowToPlaySeen();
                  setSnapshot({ menuScreen: tab });
                }}
              >
                {tab === 'race'
                  ? 'WYŚCIG'
                  : tab === 'how'
                    ? 'JAK GRAĆ'
                    : tab === 'progress'
                      ? 'POSTĘP'
                      : 'SKLEP'}
              </button>
            ))}
          </nav>

          {snap.menuScreen === 'race' && (
            <>
              <Section title="Trasa (ósemka · 3 okrążenia)">
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {TRACKS.map((t) => {
                    const locked = !isTrackUnlocked(profile, t.id);
                    const best = profile.trackBests[t.id];
                    const thumb = TRACK_THUMB_URLS[t.id];
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={locked}
                        className={`track-btn flex w-full items-center gap-2 ${snap.selectedTrackId === t.id ? 'track-btn-on' : ''} ${locked ? 'opacity-40' : ''}`}
                        onClick={() => setSnapshot({ selectedTrackId: t.id })}
                      >
                        {thumb && (
                          <img
                            src={thumb}
                            alt=""
                            className="h-10 w-16 shrink-0 rounded object-cover"
                            draggable={false}
                          />
                        )}
                        <span className="flex min-w-0 flex-1 flex-col items-start">
                          <span>{t.namePl}</span>
                          <span className="text-[9px] text-white/40">
                            {SURFACE_LABELS[t.surface]}
                            {best ? ` · best ${best.bestScore}` : ''}
                          </span>
                        </span>
                        <span className="text-white/40">{locked ? '🔒' : t.biome}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <button
                type="button"
                className="mb-2 w-full text-[10px] text-cyan-400/80 underline-offset-2 hover:underline"
                onClick={() => setSnapshot({ menuScreen: 'how' })}
              >
                Nie wiesz od czego zacząć? Otwórz JAK GRAĆ →
              </button>
              <button
                type="button"
                className="btn-primary w-full disabled:opacity-40"
                disabled={!snap.assetsReady}
                onClick={() => setSnapshot({ buildOpen: true })}
              >
                {snap.assetsReady ? 'BUDUJ I ŚCIGAJ' : 'ŁADOWANIE…'}
              </button>
            </>
          )}

          {snap.menuScreen === 'how' && (
            <>
              <HowToPlay />
              <button
                type="button"
                className="btn-primary mt-3 w-full"
                onClick={() => {
                  markHowToPlaySeen();
                  setSnapshot({ menuScreen: 'race' });
                }}
              >
                ROZUMIEM — DO WYŚCIGU
              </button>
            </>
          )}

          {snap.menuScreen === 'progress' && (
            <div className="space-y-3 text-xs">
              <Stat label="Poziom kierowcy" value={`${profile.driverLevel} (${profile.driverXp} XP)`} />
              <Stat label="Wyścigi" value={`${profile.totalRaces} (${profile.totalWins} wygranych)`} />
              <Stat label="Odblokowane trasy" value={`${profile.unlockedTracks.length}/6`} />
              <div>
                <p className="mb-1 text-white/50">Rekordy torów</p>
                {TRACKS.map((t) => {
                  const b = profile.trackBests[t.id];
                  return (
                    <div key={t.id} className="mb-1 flex justify-between text-white/70">
                      <span>{t.namePl}</span>
                      <span>{b ? `${b.bestScore} pkt` : '—'}</span>
                    </div>
                  );
                })}
              </div>
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
              <p className="mb-2 text-[10px] text-white/45">
                Traile zmieniają ślad za autem. Skiny pojazdów wrócą z grafikami.
              </p>
              {COSMETICS.filter((c) => c.kind === 'trail' || c.kind === 'banner').map((c) => {
                const owned = profile.ownedCosmetics.includes(c.id);
                const equipped = c.kind === 'trail' && equippedTrailId(profile) === c.id;
                return (
                  <div key={c.id} className="shop-row flex items-center justify-between gap-2">
                    <div>
                      <div>{c.namePl}</div>
                      <div className="text-white/40">{c.kind}</div>
                    </div>
                    {owned ? (
                      c.kind === 'trail' ? (
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1"
                          onClick={() => {
                            equipCosmetic(profile, c.id);
                            reloadProfile();
                          }}
                        >
                          {equipped ? 'Założone' : 'Załóż'}
                        </button>
                      ) : (
                        <span className="text-green-400">Posiadane</span>
                      )
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
          <div className="text-white/50">OKRĄŻENIE</div>
          <div className="font-display text-lg">
            {snap.lap}/{snap.lapCount}
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
          <div className="text-white/40">
            {snap.trackLabel} · {snap.surfaceLabel}
          </div>
          {snap.boostActive && <span className="text-orange-400">BOOST </span>}
          {snap.shieldActive && <span className="text-cyan-300">SHIELD </span>}
          {snap.heldPowerUp && <span className="text-pink-400">PWR: {snap.heldPowerUp}</span>}
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
          <div className="panel pointer-events-auto max-w-sm p-6 text-center">
            <h2 className="mb-2 font-display text-lg">
              {snap.position === 1 ? 'WYGRANA!' : `MIEJSCE ${snap.position}`}
            </h2>
            <div className="mb-3 space-y-1 text-left text-xs text-white/75">
              <div className="flex justify-between">
                <span>Budowa</span>
                <span className="text-cyan-300">+{snap.buildPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Czas</span>
                <span className="text-yellow-300">+{snap.timePoints}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1 font-display">
                <span>Suma</span>
                <span>{snap.raceScore}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Monety</span>
                <span>+{snap.coinsEarned}</span>
              </div>
              {profile.trackBests[snap.selectedTrackId] && (
                <div className="flex justify-between text-white/45">
                  <span>Rekord toru</span>
                  <span>{profile.trackBests[snap.selectedTrackId]!.bestScore} pkt</span>
                </div>
              )}
            </div>
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

function HowToPlay(): JSX.Element {
  return (
    <div className="how-board max-h-[28rem] space-y-3 overflow-y-auto text-xs text-white/80">
      <div className="rounded border border-cyan-400/25 bg-cyan-400/5 p-3">
        <p className="mb-1 font-display text-[11px] tracking-wider text-cyan-300">CEL</p>
        <p>
          Zbuduj mikro-pojazd dopasowany do nawierzchni toru, potem wygraj wyścig z AI (3 okrążenia na
          ósemce). Ranking = punkty budowy + punkty czasu.
        </p>
      </div>

      <HowStep n="1" title="Wybierz tor">
        Każdy tor ma inną nawierzchnię (dywan, metal, ziemia, asfalt, mokro, żwir). Części mają
        preferowaną nawierzchnię — zielona etykieta „idealne” pomaga wybrać.
      </HowStep>

      <HowStep n="2" title="Zbuduj auto (3 mini-gry)">
        Kolejno: <strong className="text-white">Koła → Nadwozie → Silnik</strong>. Na każdej części
        igła chodzi od − do +. Kliknij <strong className="text-white">USTAW</strong>, gdy igła jest w
        zielonej strefie. Idealne dopasowanie = lepsze stats i więcej punktów budowy.
      </HowStep>

      <HowStep n="3" title="Wyścig z AI">
        Startujesz z 3 przeciwnikami. Auto-gaz jest włączony — Ty skręcasz. Meta: 3 pełne okrążenia.
      </HowStep>

      <HowStep n="4" title="Sterowanie">
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-white/70">
          <li>
            <kbd className="kbd">A</kbd> / <kbd className="kbd">D</kbd> lub strzałki — skręt
          </li>
          <li>
            <kbd className="kbd">Space</kbd> — boost
          </li>
          <li>
            <kbd className="kbd">E</kbd> — użyj power-upa
          </li>
          <li>Na telefonie: touch pad po bokach ekranu</li>
        </ul>
      </HowStep>

      <HowStep n="5" title="Punkty i nagrody">
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-white/70">
          <li>
            <span className="text-cyan-300">Budowa</span> (0–300) — jakość 3 skillów × dopasowanie do
            nawierzchni
          </li>
          <li>
            <span className="text-yellow-300">Czas</span> (0–700) — jak szybko dojechałeś vs par toru +
            bonus miejsca
          </li>
          <li>Suma idzie do rekordu toru, monet i XP kierowcy</li>
        </ul>
      </HowStep>

      <HowStep n="6" title="Na torze">
        Zbieraj skrzynki power-upów i tokeny. Unikaj odkurzaczy / kosiarek / dronów. Boost pady dają
        chwilowy zryw. Trzymaj się asfaltu — zjazd spowalnia.
      </HowStep>
    </div>
  );
}

function HowStep({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="rounded border border-white/10 bg-white/[0.03] p-3">
      <p className="mb-1 font-display text-[11px] text-white">
        <span className="mr-2 text-cyan-400">{n}.</span>
        {title}
      </p>
      <div className="leading-relaxed text-white/70">{children}</div>
    </div>
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
