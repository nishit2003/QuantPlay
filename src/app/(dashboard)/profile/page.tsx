import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { SignOutButton } from "./sign-out-button";

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

      {/* Sign Out */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Sign Out</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Sign out of your QuantPlay account on this device.</p>
        <SignOutButton />
      </div>
    </div>
  );
}
