// src/deviceStorage.js

/** Read & parse JSON from Android’s private file */
export function readJSON(name, def) {
  try {
    const txt = KernelFS.readFile(name);
    return txt ? JSON.parse(txt) : def;
  } catch {
    return def;
  }
}

/** Stringify & write JSON to Android’s private file */
export function writeJSON(name, obj) {
  try {
    return KernelFS.writeFile(name, JSON.stringify(obj));
  } catch {
    return false;
  }
}

/** Delete a file */
export function deleteFile(name) {
  try {
    return KernelFS.deleteFile(name);
  } catch {
    return false;
  }
}