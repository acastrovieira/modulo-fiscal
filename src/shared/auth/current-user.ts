import { currentSession } from "@/shared/auth/current-session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

export async function currentUser(): Promise<CurrentUser> {
  return (await currentSession()).user;
}
