import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Layers } from "lucide-react";

interface ConfirmTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  recipient: string;
  note?: string;
  isProcessing?: boolean;
}

export function ConfirmTransactionDialog({
  isOpen,
  onClose,
  onConfirm,
  amount,
  recipient,
  note,
  isProcessing = false,
}: ConfirmTransactionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
              <Layers className="text-primary" />
            </div>
            <DialogTitle>Confirm Transaction</DialogTitle>
          </div>
          <DialogDescription>
            You are about to send:
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <p className="text-2xl font-bold text-neutral-800 mt-1 text-center">
            ₹{formatCurrency(amount)}
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold">To:</span> {recipient}
            </p>
            <p className="text-sm text-neutral-600">
              <span className="font-semibold">Note:</span> {note || 'No note provided'}
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
