import MemoryStorage from 'memorystorage';

/**
 * This function sets up a browser-local memory DB, accessible via `window.memoryDB`.  It
 * first determines if `localStorage` is available and properly functional, and if so, sets
 * the `memoryDB` to be a reference to `localStorage`.  If `localStorage` is broken (for
 * example, in Safari Private Browsing mode), then it sets `memoryDB` to refer to an instance
 * if `MemoryStorage`, which supports the same API as `localStorage`, but does not persist
 * its keys/values across full page refresh.
 */
export default function initLocalStorage() {
  let actualStorage = localStorage;
  try {
    const x = `test-localstorage-${Date.now()}`;
    actualStorage.setItem(x, x);
    const y = actualStorage.getItem(x);
    actualStorage.removeItem(x);
    if (y !== x) {
      throw new Error();
    }
  } catch (e) {
    // fall back to a memory-based implementation
    const memoryStorageName = process.env.PLATFORM === 'cannabs' ? 'CANNABS-MEMORY' : 'Mercador-MEMORY';
    actualStorage = new MemoryStorage(memoryStorageName);
  }
  window.memoryDB = actualStorage;
  return actualStorage;
}

initLocalStorage();
