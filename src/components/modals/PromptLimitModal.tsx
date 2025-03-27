
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PromptLimitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyLimit: number;
};

const PromptLimitModal: React.FC<PromptLimitModalProps> = ({
  open,
  onOpenChange,
  monthlyLimit,
}) => {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly Limit Reached</DialogTitle>
          <DialogDescription>
            You've used all {monthlyLimit} prompts available for this month.
            Your limit will reset at the beginning of next month.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>I understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptLimitModal;
