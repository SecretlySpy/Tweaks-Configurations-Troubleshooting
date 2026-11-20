export const STORAGE_KEY = 'fieldnotes:reading-state:v1';
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

export function readState(storage = globalThis.localStorage) {
  try {
    return parseState(storage?.getItem(STORAGE_KEY));
  } catch {
    return emptyState();
  }
}

export function writeState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
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

