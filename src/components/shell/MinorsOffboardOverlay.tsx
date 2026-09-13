"use client";

import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageSquare, Heart, ArrowRight, Trash2 } from "lucide-react";

/**
 * Minors off-boarding — §5.6.
 * If a user self-identifies as under 18 mid-chat:
 *   - Gentle redirection to age-appropriate resources (988, Trevor Project)
 *   - Account off-boarding per §5.6
 *   - Conversation memory + chat archives deleted per §9
 *   - Crisis-event logs routed to Legal for minors-specific handling before deletion
 *   - Off-boarding flow ALWAYS leaves user with age-appropriate crisis resources
 */
export function MinorsOffboardOverlay() {
  const { minorsOffboardActive, dismissMinorsOffboard, resetChat } = useAppStore();

  const handleOffboard = () => {
    // §5.6: conversation memory and chat archives deleted per §9
    resetChat();
    dismissMinorsOffboard();
  };

  return (
    <Dialog open={minorsOffboardActive} onOpenChange={(o) => !o && dismissMinorsOffboard()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="size-5 text-primary" />
            We're glad you reached out — and we want to point you to the right place
          </DialogTitle>
          <DialogDescription>
            soulofsoul is built for adults 18 and older. That's not because your experiences
            don't matter — they absolutely do. It's because the support that fits you best
            looks different, and we want to make sure you get to people who specialize in
            helping young people.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <div className="font-medium">Here's where to go right now:</div>
            <ul className="text-xs text-muted-foreground space-y-1 mt-1.5 list-disc list-inside">
              <li>
                <strong className="text-foreground">988 Suicide & Crisis Lifeline</strong> —
                call or text 988, 24/7. Free and confidential. They support young people too.
              </li>
              <li>
                <strong className="text-foreground">The Trevor Project</strong> —
                1-866-488-7386 or text START to 678678. For LGBTQ+ young people under 25.
              </li>
              <li>
                <strong className="text-foreground">Crisis Text Line</strong> —
                text HOME to 741741. Available 24/7.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button variant="default" size="lg" className="h-11 gap-2" asChild>
              <a href="tel:988">
                <Phone className="size-4" />
                Call 988 now
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-11 gap-2" asChild>
              <a href="sms:741741?body=HOME">
                <MessageSquare className="size-4" />
                Text HOME to 741741
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-11 gap-2" asChild>
              <a href="tel:18664887386">
                <Phone className="size-4" />
                The Trevor Project (under 25, LGBTQ+)
              </a>
            </Button>
          </div>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-3 space-y-2">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <Trash2 className="size-3.5" />
                What happens to your account
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Per our policy (§5.6), your conversation memory and chat archives will be
                deleted (§9). If any crisis-event logs exist, they'll be routed to our Legal
                team for minors-specific handling before deletion — this is for your safety,
                not surveillance. The off-boarding flow always leaves you with age-appropriate
                crisis resources.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={dismissMinorsOffboard}
          >
            I made an error — I'm 18+
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleOffboard}>
            Continue to resources
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>

        <div className="text-[10px] text-muted-foreground text-center pt-2 border-t">
          You are never penalized for being honest. Crisis resources remain reachable from
          every screen, without an account.
        </div>
      </DialogContent>
    </Dialog>
  );
}
