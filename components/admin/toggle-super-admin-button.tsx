"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { toggleSuperAdmin } from "@/features/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ToggleSuperAdminButtonProps {
  userId: string;
  isSuperAdmin: boolean;
}

export function ToggleSuperAdminButton({
  userId,
  isSuperAdmin,
}: ToggleSuperAdminButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (
      !confirm(
        isSuperAdmin
          ? "Revoke super admin privileges?"
          : "Grant super admin privileges?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const result = await toggleSuperAdmin(userId);
      toast.success(
        result.isSuperAdmin ? "Super admin granted" : "Super admin revoked"
      );
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSuperAdmin ? "destructive" : "default"}
      onClick={handleToggle}
      disabled={loading}
    >
      <Shield className="w-4 h-4 mr-2" />
      {loading ? "..." : isSuperAdmin ? "Revoke Admin" : "Make Admin"}
    </Button>
  );
}
