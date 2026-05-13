import type { Permissions, PermissionsState } from "@/types";
import { useCallback } from "react";

const STORAGE_KEY = "rawy-permissions";

function readPermissions(): PermissionsState {
  if (typeof window === "undefined") {
    return {
      notificationsAccepted: false,
      photoAccessAccepted: false,
      privacyAccepted: false,
      permissionsGranted: false,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PermissionsState>;
      return {
        notificationsAccepted: parsed.notificationsAccepted ?? false,
        photoAccessAccepted: parsed.photoAccessAccepted ?? false,
        privacyAccepted: parsed.privacyAccepted ?? false,
        permissionsGranted: parsed.permissionsGranted ?? false,
      };
    }
  } catch {}
  return {
    notificationsAccepted: false,
    photoAccessAccepted: false,
    privacyAccepted: false,
    permissionsGranted: false,
  };
}

function writePermissions(state: PermissionsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function usePermissions() {
  const getPermissions = useCallback((): PermissionsState => readPermissions(), []);
  const savePermissions = useCallback((perms: Permissions): void => {
    const permissionsGranted = perms.privacyAccepted;
    writePermissions({ ...perms, permissionsGranted });
    if (permissionsGranted) {
      try {
        localStorage.setItem("rawy-permissions-granted", "true");
      } catch {}
    }
  }, []);
  const hasGrantedPermissions = useCallback((): boolean => readPermissions().permissionsGranted, []);
  const resetPermissions = useCallback((): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("rawy-permissions-granted");
    } catch {}
  }, []);

  return { getPermissions, savePermissions, hasGrantedPermissions, resetPermissions };
}
