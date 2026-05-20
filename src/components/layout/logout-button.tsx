"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // The local session should still be cleared by returning to login.
    }

    window.location.href = "/login";
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Sair" onClick={logout}>
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
