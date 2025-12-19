"use client";

import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";

export function LogoutButton({ label }: { label: string }) {
  const params = useParams();
  const locale = params?.locale as string;

  const handleLogout = async () => {
    await signOut({
      callbackUrl: `/${locale}/login`,
    });
  };

  return (
    <Button type="button" variant="outline" onClick={handleLogout}>
      {label}
    </Button>
  );
}
