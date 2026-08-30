"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "@/lib/store/toast-store";
import type { Course } from "@/lib/types";
import { formatINR, sleep } from "@/lib/utils";

export function PaymentModal({
  course,
  open,
  onOpenChange,
}: {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const enroll = useAuthStore((s) => s.enroll);
  const user = useAuthStore((s) => s.user);
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const pay = async () => {
    if (!user) {
      toast({ title: "Please sign in first", variant: "error" });
      return;
    }
    setBusy(true);
    await sleep(900);
    enroll(course.id);
    setBusy(false);
    setDone(true);
    toast({
      title: "Payment simulated",
      description: `${course.title} is now in your library.`,
      variant: "success",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setDone(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout · {formatINR(course.priceInr)}</DialogTitle>
          <DialogDescription>
            Simulated INR payment. No real charge is made in this environment.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="mt-3 font-display text-lg">You&apos;re enrolled</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={method === "upi" ? "default" : "outline"}
                onClick={() => setMethod("upi")}
              >
                <Smartphone className="mr-2 h-4 w-4" /> UPI
              </Button>
              <Button
                type="button"
                variant={method === "card" ? "default" : "outline"}
                onClick={() => setMethod("card")}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Card
              </Button>
            </div>
            {method === "upi" ? (
              <div className="space-y-2">
                <Label htmlFor="upi">UPI ID</Label>
                <Input id="upi" placeholder="name@okaxis" defaultValue="learner@okicici" />
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="card">Card number</Label>
                  <Input id="card" placeholder="ACCT-000015" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/YY" />
                  <Input placeholder="CVV" />
                </div>
              </div>
            )}
            <Button className="w-full" disabled={busy} onClick={() => void pay()}>
              {busy ? "Authorising…" : `Pay ${formatINR(course.priceInr)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
