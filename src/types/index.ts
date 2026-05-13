export type Gender = "male" | "female" | "unspecified";
export type Role = "guest" | "user" | "admin";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: Gender;
  age: number;
  role: Role;
  googleSub?: string;
}

export interface Permissions {
  notificationsAccepted: boolean;
  photoAccessAccepted: boolean;
  privacyAccepted: boolean;
}

export interface PermissionsState extends Permissions {
  permissionsGranted: boolean;
}
