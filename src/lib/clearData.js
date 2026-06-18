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
