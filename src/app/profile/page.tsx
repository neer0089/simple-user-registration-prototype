import { redirect } from "next/navigation";
import { getAuthenticatedUserFromCookieStore } from "@/lib/auth";
import { toPublicUser } from "@/repositories/user.repository";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const user = await getAuthenticatedUserFromCookieStore();
  if (!user) {
    redirect("/login");
  }

  return <ProfileClient initialUser={toPublicUser(user)} />;
}
