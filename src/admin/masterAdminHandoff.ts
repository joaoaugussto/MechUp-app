import { Platform } from "react-native";

const STORAGE_KEY = "mechup_admin_master_handoff";

/** Senha master validada no login; lida após carregar o painel (compatível com React Strict Mode). */
let memoryHandoff: string | null = null;

export function setMasterAdminSecretHandoff(secret: string) {
  memoryHandoff = secret;
  if (Platform.OS === "web") {
    try {
      sessionStorage.setItem(STORAGE_KEY, secret);
    } catch {
      /* ignore */
    }
  }
}

function peekHandoff(): string | null {
  if (memoryHandoff) return memoryHandoff;
  if (Platform.OS === "web") {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearMasterAdminSecretHandoff() {
  memoryHandoff = null;
  if (Platform.OS === "web") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Lê o handoff sem limpar; use clear após validar na tela admin. */
export function peekMasterAdminSecretHandoff(): string | null {
  return peekHandoff();
}
