import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Salesforce Tool",
  description:
    "Submit your Salesforce CLI plugin, LWC component, Apex utility, or Agentforce tool to the SFDX Hub community registry.",
  alternates: { canonical: "/submit" },
  robots: { index: false, follow: true },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
