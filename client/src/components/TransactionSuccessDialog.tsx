import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, generateTransactionId } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface TransactionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
  amount: number;
  recipient: string;
}

export function TransactionSuccessDialog({
  isOpen,
  onClose,
  onNewTransaction,
  amount,
  recipient,
}: TransactionSuccessDialogProps) {
  const transactionId = generateTransactionId();
  const date = new Date().toLocaleString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center justify-center">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle>Payment Successful!</DialogTitle>
          <DialogDescription>
            Your transaction has been completed successfully.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-500">Amount</span>
            <span className="text-sm font-medium text-neutral-800">₹{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-500">To</span>
            <span className="text-sm font-medium text-neutral-800">{recipient}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-500">Transaction ID</span>
            <span className="text-sm font-medium text-neutral-800">{transactionId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Date & Time</span>
            <span className="text-sm font-medium text-neutral-800">{date}</span>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onNewTransaction}
          >
            New Payment
          </Button>
          <Button
            type="button"
            onClick={onClose}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
