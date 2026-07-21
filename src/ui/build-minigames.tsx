import { useEffect, useRef, useState, type JSX } from 'react';
import type { SurfaceId } from '../core/types.js';
import { PART_SPRITE_URLS } from '../config/asset-paths.js';
import {
  greenZoneHalfWidth,
  partsForSlot,
  skillQuality,
  SURFACE_LABELS,
  type PartDef,
  type PartSlot,
  type SkillScores,
} from '../config/parts.js';

const SLOTS: PartSlot[] = ['wheels', 'body', 'engine'];
const SLOT_LABEL: Record<PartSlot, string> = {
  wheels: 'KOŁA',
  body: 'NADWOZIE',
  engine: 'SILNIK',
};

export interface BuildResult {
  wheelsId: string;
  bodyId: string;
  engineId: string;
  skill: SkillScores;
}

interface BuildMinigamesProps {
  surface: SurfaceId;
  onComplete(result: BuildResult): void;
  onCancel(): void;
}

export function BuildMinigames({ surface, onComplete, onCancel }: BuildMinigamesProps): JSX.Element {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Partial<Record<PartSlot, string>>>({});
  const [skills, setSkills] = useState<Partial<SkillScores>>({});
  const [needle, setNeedle] = useState(0);
  const [locked, setLocked] = useState(false);
  const dirRef = useRef(1);
  const rafRef = useRef(0);

  const summary = step >= 3;
  const slot = summary ? 'wheels' : SLOTS[step]!;
  const options = partsForSlot(slot);
  const selectedId = picked[slot] ?? options[0]!.id;
  const selected = options.find((p) => p.id === selectedId) ?? options[0]!;
  const half = greenZoneHalfWidth(selected, surface);

  useEffect(() => {
    if (locked || summary) return;
    let last = performance.now();
    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setNeedle((n) => {
        let next = n + dirRef.current * dt * 1.35;
        if (next > 1) {
          next = 1;
          dirRef.current = -1;
        } else if (next < -1) {
          next = -1;
          dirRef.current = 1;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [locked, step, summary, selectedId]);

  const lockShot = (): void => {
    if (locked) return;
    setLocked(true);
    const score = needle;
    const nextSkills = { ...skills, [slot]: score } as Partial<SkillScores>;
    const nextPicked = { ...picked, [slot]: selectedId };
    setSkills(nextSkills);
    setPicked(nextPicked);
    window.setTimeout(() => {
      if (step < 2) {
        setStep(step + 1);
        setNeedle(0);
        dirRef.current = 1;
        setLocked(false);
      } else {
        setStep(3);
      }
    }, 450);
  };

  if (step >= 3) {
    const skill: SkillScores = {
      wheels: skills.wheels ?? 0,
      body: skills.body ?? 0,
      engine: skills.engine ?? 0,
    };
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
        <div className="panel pointer-events-auto w-full max-w-md p-5 text-center">
          <h2 className="mb-2 font-display text-lg text-cyan-300">BUILD GOTOWY</h2>
          <p className="mb-3 text-xs text-white/60">Nawierzchnia: {SURFACE_LABELS[surface]}</p>
          <div className="mb-4 space-y-1 text-left text-xs">
            {SLOTS.map((s) => {
              const id = picked[s]!;
              const part = optionsFor(s).find((p) => p.id === id)!;
              const q = skillQuality(skill[s], greenZoneHalfWidth(part, surface));
              const src = PART_SPRITE_URLS[part.id];
              return (
                <div key={s} className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-1">
                  <span className="flex items-center gap-2">
                    {src && <img src={src} alt="" className="h-8 w-8 object-contain" draggable={false} />}
                    {SLOT_LABEL[s]}: {part.namePl}
                  </span>
                  <span className={q > 0.85 ? 'text-green-400' : q > 0.5 ? 'text-yellow-400' : 'text-red-400'}>
                    {(q * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="btn-primary mb-2 w-full"
            onClick={() =>
              onComplete({
                wheelsId: picked.wheels!,
                bodyId: picked.body!,
                engineId: picked.engine!,
                skill,
              })
            }
          >
            START WYŚCIGU
          </button>
          <button type="button" className="btn-secondary w-full" onClick={onCancel}>
            WRÓĆ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
      <div className="panel pointer-events-auto w-full max-w-md p-5">
        <p className="text-center text-[10px] tracking-[0.3em] text-cyan-400">
          BUDOWA {step + 1}/3 · {SURFACE_LABELS[surface]}
        </p>
        <h2 className="mb-3 text-center font-display text-lg text-white">{SLOT_LABEL[slot]}</h2>

        <div className="mb-3 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {options.map((p) => (
            <PartChoice
              key={p.id}
              part={p}
              selected={p.id === selectedId}
              onSelect={() => {
                if (!locked) setPicked({ ...picked, [slot]: p.id });
              }}
            />
          ))}
        </div>

        <p className="mb-1 text-center text-[10px] text-white/50">
          Kliknij USTAW gdy igła jest w zielonej strefie (− … +)
        </p>
        <SkillMeter needle={needle} halfWidth={half} locked={locked} />

        <button
          type="button"
          className="btn-primary mt-4 w-full"
          disabled={locked}
          onClick={lockShot}
        >
          {locked ? 'OK!' : 'USTAW'}
        </button>
        <button type="button" className="btn-secondary mt-2 w-full" onClick={onCancel}>
          ANULUJ
        </button>
      </div>
    </div>
  );
}

function optionsFor(slot: PartSlot): PartDef[] {
  return partsForSlot(slot);
}

function PartChoice({
  part,
  selected,
  onSelect,
}: {
  part: PartDef;
  selected: boolean;
  onSelect(): void;
}): JSX.Element {
  const src = PART_SPRITE_URLS[part.id];
  return (
    <button
      type="button"
      className={`flex items-center gap-3 rounded border px-3 py-2 text-left text-xs ${selected ? 'border-cyan-400 bg-cyan-400/15' : 'border-white/15 bg-white/5'}`}
      onClick={onSelect}
    >
      {src && (
        <img
          src={src}
          alt=""
          className="h-12 w-12 shrink-0 object-contain"
          draggable={false}
        />
      )}
      <div className="min-w-0 flex-1">
        <span className="font-display text-[11px]">{part.namePl}</span>
      </div>
    </button>
  );
}

function SkillMeter({
  needle,
  halfWidth,
  locked,
}: {
  needle: number;
  halfWidth: number;
  locked: boolean;
}): JSX.Element {
  const pct = ((needle + 1) / 2) * 100;
  const greenLeft = ((1 - halfWidth) / 2) * 100;
  const greenWidth = halfWidth * 100;
  return (
    <div className={`relative h-10 w-full rounded bg-black/50 ${locked ? 'opacity-70' : ''}`}>
      <div
        className="absolute top-1 bottom-1 rounded bg-green-500/35"
        style={{ left: `${greenLeft}%`, width: `${greenWidth}%` }}
      />
      <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between text-[9px] text-white/40">
        <span>−</span>
        <span>0</span>
        <span>+</span>
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
        style={{ left: `calc(${pct}% - 1px)` }}
      />
    </div>
  );
}
