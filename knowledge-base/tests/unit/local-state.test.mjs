import assert from 'node:assert/strict';
import test from 'node:test';

import {
  STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  emptyState,
  guideState,
  parseState,
  readState,
  updateGuideState,
  writeState,
} from '../../src/lib/local-state.mjs';

class MemoryStorage {
  constructor({ failReads = false, failWrites = false } = {}) {
    this.failReads = failReads;
    this.failWrites = failWrites;
    this.values = new Map();
  }

  getItem(key) {
    if (this.failReads) throw new Error('storage denied');
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.failWrites) throw new Error('quota exceeded');
    this.values.set(key, value);
  }
}

test('corrupt and incompatible state safely reset to an empty schema', () => {
  assert.deepEqual(parseState('{broken'), emptyState());
  assert.deepEqual(parseState(JSON.stringify({ schemaVersion: 999, guides: { stale: true } })), emptyState());
});

test('storage denial returns an empty state and write failure is reported', () => {
  assert.deepEqual(readState(new MemoryStorage({ failReads: true })), emptyState());
  assert.equal(writeState(emptyState(), new MemoryStorage({ failWrites: true })), false);
});

test('bookmarks and progress survive serialization', () => {
  const storage = new MemoryStorage();
  const updated = updateGuideState(emptyState(), 'guide-a', 'version-1', {
    bookmarked: true,
    completedSteps: ['step-1'],
    progress: 50,
  });
  assert.equal(writeState(updated, storage), true);
  const storedGuide = guideState(readState(storage), 'guide-a');
  assert.equal(storedGuide.bookmarked, true);
  assert.deepEqual(storedGuide.completedSteps, ['step-1']);
  assert.equal(storedGuide.progress, 50);
  assert.equal(JSON.parse(storage.values.get(STORAGE_KEY)).schemaVersion, STATE_SCHEMA_VERSION);
});

test('a source-version change resets step completion but preserves the bookmark', () => {
  const original = updateGuideState(emptyState(), 'guide-a', 'version-1', {
    bookmarked: true,
    completedSteps: ['step-1'],
    progress: 100,
  });
  const refreshed = updateGuideState(original, 'guide-a', 'version-2', {});
  const state = guideState(refreshed, 'guide-a');
  assert.equal(state.bookmarked, true);
  assert.deepEqual(state.completedSteps, []);
  assert.equal(state.progress, 0);
});


test('previous branding storage key migrates bookmarks without deleting the original', () => {
  const storage = new MemoryStorage();
  const previous = updateGuideState(emptyState(), 'guide-before-rename', 'version-1', {
    bookmarked: true, completedSteps: ['one'], progress: 60,
  });
  storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(previous));
  assert.equal(guideState(readState(storage), 'guide-before-rename').bookmarked, true);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), previous);
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), JSON.stringify(previous));
});

test('absence of accessible storage returns failure without claiming persistence', () => {
  assert.deepEqual(readState(null), emptyState());
  assert.equal(writeState(emptyState(), null), false);
});
