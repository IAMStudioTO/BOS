import { cookies } from "next/headers";

const COOKIE_NAME = "bos_admin";

export function isAdminAuthed() {
  const c = cookies().get(COOKIE_NAME);
  return Boolean(c?.value);
}
