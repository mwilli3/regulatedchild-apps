// Local data eraser for the paid TRC apps. Wipes this device's saved app data
// (tracker, signature, reflections, worked-scripts, etc.) and the purchase
// access token, from BOTH localStorage and the window.storage bridge when one
// is present — otherwise the bridge copy would repopulate on reload.
//
// Server-side purchase records are erased separately by the operator via the
// delete-purchase function; this only clears the current device.

export async function clearLocalData(keys) {
  for (const k of keys) {
    try { localStorage.removeItem(k); } catch {}
    try {
      if (window.storage?.delete) await window.storage.delete(k);
      else if (window.storage?.remove) await window.storage.remove(k);
      else if (window.storage?.set) await window.storage.set(k, ""); // app loaders treat "" as absent
    } catch {}
  }
}

// Reads + JSON-parses a key from the window.storage bridge (preferred) or
// localStorage. Used by the "Manage my data" modal to show live counts of what
// will be deleted. Returns null when absent or unparseable.
export async function readLocal(key) {
  try {
    if (window.storage?.get) {
      const r = await window.storage.get(key);
      if (r?.value) return JSON.parse(r.value);
    }
  } catch {}
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}
