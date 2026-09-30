import { session } from "electron";

import { BUILD_URL } from "./window";

/**
 * Permissions the Stoat web client actually needs:
 * - media / display-capture / speaker-selection: voice, video, screen share
 *   and output device selection
 * - notifications: message notifications
 * - fullscreen: fullscreen video tiles
 * - clipboard-sanitized-write: "copy link / ID" actions
 * - screen-wake-lock: keep the screen awake during calls
 *
 * Everything else (geolocation, MIDI, USB, clipboard read, ...) is denied.
 */
const ALLOWED_PERMISSIONS = new Set<string>([
  "media",
  "display-capture",
  "speaker-selection",
  "notifications",
  "fullscreen",
  "clipboard-sanitized-write",
  "screen-wake-lock",
]);

function isTrustedOrigin(url: string | undefined) {
  if (!url) return false;

  try {
    return new URL(url).origin === BUILD_URL.origin;
  } catch {
    return false;
  }
}

/**
 * Only grant the permissions the web client needs, and only to the app origin
 */
export function initPermissionHandlers() {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback, details) => {
      callback(
        ALLOWED_PERMISSIONS.has(permission) &&
          isTrustedOrigin(details.requestingUrl),
      );
    },
  );

  session.defaultSession.setPermissionCheckHandler(
    (_webContents, permission, requestingOrigin) =>
      ALLOWED_PERMISSIONS.has(permission) && isTrustedOrigin(requestingOrigin),
  );
}
