export type ProfileStatus = "ACTIVE" | "INVITED" | "DISABLED";

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  status: ProfileStatus;
};
