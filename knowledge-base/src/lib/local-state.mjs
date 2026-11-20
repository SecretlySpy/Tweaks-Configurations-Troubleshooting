export const STORAGE_KEY = 'technical-resources:reading-state:v1';
// Read-only fallback preserves bookmarks saved before the public branding change.
export const LEGACY_STORAGE_KEY = 'fieldnotes:reading-state:v1';
export const STATE_SCHEMA_VERSION = 1;

export function emptyState() {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    guides: {},
  };
}

export function normalizeState(candidate) {
  if (!candidate || typeof candidate !== 'object' || candidate.schemaVersion !== STATE_SCHEMA_VERSION) {
    return emptyState();
  }
  const guides = candidate.guides && typeof candidate.guides === 'object' ? candidate.guides : {};
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    guides,
  };
}

export function parseState(serializedState) {
  if (typeof serializedState !== 'string' || serializedState.length === 0) return emptyState();
  try {
    return normalizeState(JSON.parse(serializedState));
  } catch {
    return emptyState();
  }
}

export function readState(storage) {
  try {
    // Resolve localStorage inside the try block: even reading its property can throw.
    const targetStorage = storage === undefined ? globalThis.localStorage : storage;
    const current = targetStorage?.getItem(STORAGE_KEY);
    if (current) return parseState(current);
    const legacy = targetStorage?.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return emptyState();
    const restored = parseState(legacy);
    // Never delete the previous key; browser owners retain a recoverable copy.
    try {
      targetStorage?.setItem(STORAGE_KEY, JSON.stringify(restored));
    } catch {
      // A read-only session can still display saved bookmarks.
    }
    return restored;
  } catch {
    return emptyState();
  }
}

export function writeState(state, storage) {
  try {
    const targetStorage = storage === undefined ? globalThis.localStorage : storage;
    if (!targetStorage) return false;
    targetStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    return true;
  } catch {
    return false;
  }
}

export function guideState(state, guideId) {
  return state.guides[guideId] ?? {
    bookmarked: false,
    completedSteps: [],
    progress: 0,
    readingVersion: null,
    updatedAt: null,
  };
}

export function updateGuideState(state, guideId, readingVersion, patch) {
  const normalized = normalizeState(state);
  const previous = guideState(normalized, guideId);
  const versionChanged = previous.readingVersion && previous.readingVersion !== readingVersion;
  const next = {
    ...previous,
    ...(versionChanged ? { completedSteps: [], progress: 0 } : {}),
    ...patch,
    readingVersion,
    updatedAt: new Date().toISOString(),
  };
  return {
    ...normalized,
    guides: {
      ...normalized.guides,
      [guideId]: next,
    },
  };
}

