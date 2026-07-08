import type { Metadata } from "next";
import { User } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <ComingSoon icon={User} title={`@${username}`} description="Public profile and meme grid." />
  );
}
