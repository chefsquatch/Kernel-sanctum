// src/kernelFS.js
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const CHAT_FILE     = 'kernel-chat.json';
const SUBJECTS_FILE = 'kernel-subjects.json';
const VERSION       = 1;

async function readJSON(path, def) {
  try {
    const res = await Filesystem.readFile({
      path: path,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    const obj = JSON.parse(res.data);
    if (obj.__v !== VERSION) throw new Error('old version');
    return obj.payload;
  } catch (e) {
    // If file doesn’t exist or is corrupted, start fresh
    return def;
  }
}

async function writeJSON(path, payload) {
  const toWrite = JSON.stringify({ __v: VERSION, payload });
  // atomic write
  await Filesystem.writeFile({
    path: path,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    data: toWrite
  });
}

export async function loadFile(path, def) {
  return await readJSON(path, def);
}

export async function saveFile(path, payload) {
  await writeJSON(path, payload);
}

export async function removeFile(path) {
  try { await Filesystem.deleteFile({ path, directory: Directory.Data }); }
  catch {}
}

export async function stats() {
  return await Filesystem.stat({ path: '', directory: Directory.Data });
}

export const CHAT_PATH     = CHAT_FILE;
export const SUBJECTS_PATH = SUBJECTS_FILE;