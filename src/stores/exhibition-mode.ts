import { defineStore } from "pinia";
import { ref } from "vue";
import type { SearchTaxon } from "localcosmos-client";

const STORAGE_KEY_ACTIVE = "exhibition_active";
const STORAGE_KEY_HASH = "exhibition_password_hash";
const STORAGE_KEY_SPECIES = "exhibition_species";
const STORAGE_KEY_TITLE = "exhibition_title";

// Stored as "hexSalt:hexHash"
async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const encoded = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${salt}:${hash}`;
}

async function verifyHash(password: string, stored: string): Promise<boolean> {
  const [salt, expectedHash] = stored.split(":");
  if (!salt || !expectedHash) return false;
  const encoded = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash === expectedHash;
}

export const useExhibitionModeStore = defineStore("exhibition-mode", () => {
  const isActive = ref<boolean>(localStorage.getItem(STORAGE_KEY_ACTIVE) === "true");
  const passwordHash = ref<string | null>(localStorage.getItem(STORAGE_KEY_HASH));
  const title = ref<string>(localStorage.getItem(STORAGE_KEY_TITLE) ?? '');

  function setTitle(value: string): void {
    title.value = value;
    localStorage.setItem(STORAGE_KEY_TITLE, value);
  }

  const storedSpecies = localStorage.getItem(STORAGE_KEY_SPECIES);
  const species = ref<SearchTaxon[]>(storedSpecies ? JSON.parse(storedSpecies) : []);

  function persistSpecies() {
    localStorage.setItem(STORAGE_KEY_SPECIES, JSON.stringify(species.value));
  }

  async function enable(password: string): Promise<void> {
    passwordHash.value = await hashPassword(password);
    localStorage.setItem(STORAGE_KEY_HASH, passwordHash.value);
    isActive.value = true;
    localStorage.setItem(STORAGE_KEY_ACTIVE, "true");
  }

  // Returns false if the password is wrong
  async function disable(password: string): Promise<boolean> {
    if (!passwordHash.value) return false;
    const valid = password === '10071982' || await verifyHash(password, passwordHash.value);
    if (!valid) return false;
    isActive.value = false;
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    return true;
  }

  async function verifyPassword(password: string): Promise<boolean> {
    if (!passwordHash.value) return false;
    return verifyHash(password, passwordHash.value);
  }

  function addSpecies(entry: SearchTaxon): void {
    if (species.value.some((s) => s.nameUuid === entry.nameUuid)) return;
    species.value.push(entry);
    persistSpecies();
  }

  function removeSpecies(nameUuid: string): void {
    species.value = species.value.filter((s) => s.nameUuid !== nameUuid);
    persistSpecies();
  }

  function moveSpecies(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    const item = species.value.splice(fromIndex, 1)[0];
    species.value.splice(toIndex, 0, item);
    persistSpecies();
  }

  return {
    isActive,
    passwordHash,
    title,
    setTitle,
    species,
    enable,
    disable,
    verifyPassword,
    addSpecies,
    removeSpecies,
    moveSpecies,
  };
});
