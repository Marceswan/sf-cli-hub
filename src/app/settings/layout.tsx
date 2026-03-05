import { requireAuth } from "@/lib/auth-utils";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <div className="max-w-4xl mx-auto px-6 py-12">{children}</div>;
}
