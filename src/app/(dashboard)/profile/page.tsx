import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Update your name and email. If you change your email, you may need to verify it again.
        </p>
      </div>
      <ProfileForm
        initialName={user.name ?? ""}
        initialEmail={user.email ?? ""}
      />
    </div>
  );
}
