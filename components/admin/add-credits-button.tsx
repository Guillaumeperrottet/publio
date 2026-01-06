"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { addManualCredits } from "@/features/admin/actions";
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

interface AddCreditsButtonProps {
  organizationId: string;
  organizationName: string;
}

export function AddCreditsButton({
  organizationId,
  organizationName,
}: AddCreditsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAddCredits = async () => {
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setLoading(true);
      await addManualCredits({
        organizationId,
        amount: parsedAmount,
        reason,
      });
      toast.success(`CHF ${parsedAmount} credit added to ${organizationName}`);
      setOpen(false);
      setAmount("");
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add credits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Credits
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Add Manual Credits
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add credits to {organizationName}&apos;s account. This will create
              a negative invoice entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-900">
                Amount (CHF)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits-reason" className="text-gray-900">
                Reason (required)
              </Label>
              <Input
                id="credits-reason"
                placeholder="e.g., Promotional credit, Compensation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={loading || !amount || !reason.trim()}
            >
              {loading ? "Adding..." : "Add Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
