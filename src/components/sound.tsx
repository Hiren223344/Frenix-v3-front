import * as React from 'react';
import { ensureReady, setMasterVolume, sine, square, triangle } from '@web-kits/audio';
import { cn } from '@/lib/utils';

/**
 * The cues this project ships out of the box, keyed to the DOM slots/
 * events they answer (see SLOT_SOUND below). Extend SOUND_CATALOG — and
 * this union — to add more; nothing else needs to change, since
 * SoundEffects looks sounds up by name at press time.
 */
export type SoundName = 'press' | 'toggle-on' | 'toggle-off' | 'open' | 'close' | 'error';

type PlayFn = () => void;

// Quiet, short cues — this is a UI acknowledgement, not a chime. Frequencies
// and decays are this project's own choice (no reference implementation was
// available to match — see the conversation this shipped from).
const SOUND_CATALOG: Record<SoundName, PlayFn> = {
  press: sine(720, 0.05, 0.18),
  'toggle-on': sine({ start: 660, end: 880 }, 0.07, 0.2),
  'toggle-off': sine({ start: 880, end: 500 }, 0.07, 0.2),
  open: triangle({ start: 480, end: 640 }, 0.08, 0.16),
  close: triangle({ start: 640, end: 420 }, 0.08, 0.16),
  error: square(180, 0.12, 0.14),
};

/**
 * Maps a shadcn `data-slot` value to the cue it plays on press. A caller
 * can always override this per-element with `data-sound="<name>"`, or opt
 * an element out entirely with `data-sound="none"`, without touching this
 * map.
 */
const SLOT_SOUND: Partial<Record<string, SoundName>> = {
  button: 'press',
  'dropdown-menu-item': 'press',
  'dropdown-menu-trigger': 'open',
  'accordion-trigger': 'toggle-on',
  'sidebar-menu-button': 'press',
  switch: 'toggle-on',
  checkbox: 'toggle-on',
  'tabs-trigger': 'press',
};

// ---------------------------------------------------------------------------
// Mute / volume — a tiny external store so setSoundMuted/setSoundVolume work
// from anywhere (not just inside a component), while useSoundMuted/
// useSoundVolume stay reactive via useSyncExternalStore. Persisted so a
// visitor's preference survives a reload.
// ---------------------------------------------------------------------------

const MUTE_STORAGE_KEY = 'frenix_sound_muted';
const VOLUME_STORAGE_KEY = 'frenix_sound_volume';

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function readStoredMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function readStoredVolume(): number {
  try {
    const raw = Number(localStorage.getItem(VOLUME_STORAGE_KEY));
    return Number.isFinite(raw) ? clamp01(raw) : 1;
  } catch {
    return 1;
  }
}

let mutedState = readStoredMuted();
let volumeState = readStoredVolume();
// Nothing plays (and the master bus isn't touched) until a real press —
// browsers hold audio output until the page has been interacted with, and
// SoundEffects' handlePress is the only place that flips this to true.
let audioReady = false;

const muteListeners = new Set<() => void>();
const volumeListeners = new Set<() => void>();

/** Applies the current mute/volume state to the audio engine's master bus.
 * A no-op until the first real press has initialized the AudioContext —
 * the state it would have applied is still saved and takes effect then. */
function syncMasterVolume() {
  if (!audioReady) return;
  try {
    setMasterVolume(mutedState ? 0 : volumeState);
  } catch {
    // Audio engine unavailable in this environment — nothing to sync.
  }
}

export function setSoundMuted(muted: boolean) {
  mutedState = muted;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // Private browsing / storage disabled — mute still applies for this
    // page load, it just won't be remembered next time.
  }
  syncMasterVolume();
  muteListeners.forEach((listener) => listener());
}

export function useSoundMuted(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      muteListeners.add(onChange);
      return () => muteListeners.delete(onChange);
    },
    () => mutedState,
  );
}

export function setSoundVolume(volume: number) {
  volumeState = clamp01(volume);
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volumeState));
  } catch {
    // See setSoundMuted.
  }
  syncMasterVolume();
  volumeListeners.forEach((listener) => listener());
}

export function useSoundVolume(): number {
  return React.useSyncExternalStore(
    (onChange) => {
      volumeListeners.add(onChange);
      return () => volumeListeners.delete(onChange);
    },
    () => volumeState,
  );
}

// ---------------------------------------------------------------------------
// SoundEffects — the voice. One capture-phase listener on the document,
// wrapped once around the whole app, that reads data-sound/data-slot off
// whatever was actually pressed and plays the matching cue.
// ---------------------------------------------------------------------------

function resolveSoundName(target: EventTarget | null): SoundName | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>('[data-sound], [data-slot]');
  if (!el) return null;

  const explicit = el.getAttribute('data-sound');
  if (explicit === 'none') return null;
  if (explicit && explicit in SOUND_CATALOG) return explicit as SoundName;

  const slot = el.getAttribute('data-slot');
  return (slot && SLOT_SOUND[slot]) || null;
}

export function SoundEffects({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handlePress = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      const name = resolveSoundName(event.target);
      if (!name || mutedState) return;

      // The AudioContext can only start from a real user gesture — this
      // listener only ever fires from one, so it's always a valid place
      // to do it. ensureReady() is cheap on every subsequent call (it just
      // awaits the already-running context).
      void ensureReady()
        .then(() => {
          if (!audioReady) {
            audioReady = true;
            syncMasterVolume();
          }
          SOUND_CATALOG[name]();
        })
        .catch(() => {
          // Audio blocked/unavailable — fail silently, never break the
          // press itself over a missing sound cue.
        });
    };

    document.addEventListener('pointerdown', handlePress, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePress, { capture: true });
  }, []);

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// SoundToggle — plain mute/unmute button. No headless primitive underneath
// it, just an <svg>-in-<button>.
// ---------------------------------------------------------------------------

export function SoundToggle({ className, ...props }: React.ComponentProps<'button'>) {
  const muted = useSoundMuted();
  const [flourish, setFlourish] = React.useState(false);

  const handleClick = () => {
    setSoundMuted(!muted);
    setFlourish(true);
    window.setTimeout(() => setFlourish(false), 220);
  };

  return (
    <button
      type="button"
      data-slot="sound-toggle"
      data-sound="none"
      aria-label={muted ? 'Unmute interface sounds' : 'Mute interface sounds'}
      aria-pressed={muted}
      onClick={handleClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-sound-toggle-fg transition-colors',
        'hover:bg-sound-toggle-hover-bg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sound-toggle-ring',
        flourish && 'sound-toggle-flourish',
        className,
      )}
      {...props}
    >
      <SoundIcon muted={muted} />
    </button>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <polygon points="4 8 8 8 12 4 12 20 8 16 4 16 4 8" />
      {!muted && <path d="M16.5 8.5a5 5 0 0 1 0 7" />}
      {muted && <path d="m18 9 4 6M22 9l-4 6" />}
    </svg>
  );
}
