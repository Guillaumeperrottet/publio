"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function CreateTenderButton({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const href = isAuthenticated ? "/dashboard/tenders/new" : "/auth/signup";

  return (
    <Link href={href}>
      <Button size="lg">
        <Plus className="w-4 h-4 mr-2" />
        Créer un appel d&apos;offres
      </Button>
    </Link>
  );
}
