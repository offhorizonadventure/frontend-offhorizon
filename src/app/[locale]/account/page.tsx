import { DeleteAccount } from "@/components/account/DeleteAccount";
import { PasswordPanel } from "@/components/account/PasswordPanel";
import { SocialAccountNote } from "@/components/account/SocialAccountNote";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getProfile } from "@/lib/profile";
import { getUser } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  /**
   * An account signed in through Google or Facebook has no password here to
   * change, and offering to reset one would send a mail that cannot help. The
   * provider owns the credentials; we only hold the session.
   */
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const hasPassword = providers.includes("email");
  const social = providers.filter((provider) => provider !== "email");

  return (
    <div className="space-y-8">
      <ProfileForm
        email={profile?.email ?? user?.email ?? ""}
        name={profile?.full_name ?? ""}
        phone={profile?.phone ?? ""}
      />

      {hasPassword ? (
        <PasswordPanel />
      ) : (
        social.length > 0 && <SocialAccountNote providers={social} />
      )}

      <DeleteAccount />
    </div>
  );
}
