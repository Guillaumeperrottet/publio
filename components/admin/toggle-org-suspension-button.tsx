"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle } from "lucide-react";
import { toggleOrganizationSuspension } from "@/features/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ToggleOrganizationSuspensionButtonProps {
  organizationId: string;
  isActive: boolean;
}

export function ToggleOrganizationSuspensionButton({
  organizationId,
  isActive,
}: ToggleOrganizationSuspensionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleToggle = async () => {
    if (!reason.trim() && !isActive) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    try {
      setLoading(true);
      const result = await toggleOrganizationSuspension(
        organizationId,
        reason || undefined
      );
      toast.success(
        result.isActive ? "Organization reactivated" : "Organization suspended"
      );
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update organization");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={isActive ? "destructive" : "default"}
        onClick={() => setOpen(true)}
        className={isActive ? "bg-red-600 hover:bg-red-700 text-white" : ""}
      >
        {isActive ? (
          <>
            <Ban className="w-4 h-4 mr-2" />
            Suspend
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Reactivate
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {isActive ? "Suspend Organization" : "Reactivate Organization"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isActive
                ? "This will prevent all members from accessing their organization."
                : "This will restore full access to the organization."}
            </DialogDescription>
          </DialogHeader>

          {!isActive || (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-900">
                Reason (required)
              </Label>
              <Input
                id="reason"
                placeholder="e.g., Non-payment, Terms violation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={isActive ? "destructive" : "default"}
              onClick={handleToggle}
              disabled={loading || (!isActive && !reason.trim())}
            >
              {loading ? "..." : isActive ? "Suspend" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
