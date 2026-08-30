export interface BotReply {
  keywords: string[];
  reply: string;
}

export const BOT_RULES: BotReply[] = [
  {
    keywords: ["hello", "hi", "hey", "namaste"],
    reply:
      "Hey! I'm Zing, Zinger's support copilot. Ask me about courses, payments, dashboards, or how to talk to a human.",
  },
  {
    keywords: ["price", "pricing", "cost", "₹", "inr", "plan", "subscription"],
    reply:
      "Plans start at ₹999/month, ₹2,499/quarter, or ₹4,999/year with lifetime access after. Individual courses are listed in INR on the catalog.",
  },
  {
    keywords: ["refund", "cancel", "money back"],
    reply:
      "Monthly plans can be cancelled anytime from Profile → Billing. Course purchases have a 7-day no-questions refund if progress is under 20%.",
  },
  {
    keywords: ["login", "signup", "sign up", "password", "google", "auth"],
    reply:
      "Use email/password on /login or /signup. Google OAuth is wired as a placeholder — enable it in your Supabase project under Authentication → Providers.",
  },
  {
    keywords: ["course", "catalog", "learn", "video"],
    reply:
      "Head to Dashboard → Courses. Filter by Web Dev, AI/ML, Data Science, DevOps, UI/UX, or Mobile Dev. Enroll to unlock the player.",
  },
  {
    keywords: ["admin", "whitelist"],
    reply:
      "Admin portal is at /admin and is limited to whitelisted emails such as admin@zinger.com (see NEXT_PUBLIC_ADMIN_EMAILS).",
  },
  {
    keywords: ["chat", "peer", "message", "realtime"],
    reply:
      "Open Dashboard → Peer Chat. Two logged-in learners can message in realtime via Supabase. In demo mode, open two browsers to simulate.",
  },
  {
    keywords: ["ticket", "support", "help", "issue", "bug"],
    reply:
      "File a ticket from Dashboard → Support. Our team (and admins) can mark it in progress or resolved. You can also keep chatting with me here.",
  },
  {
    keywords: ["certificate", "placement", "job", "hire"],
    reply:
      "Complete 100% of a course to unlock a certificate. Ignite and Lifetime plans include mock interviews and hiring-partner referrals.",
  },
  {
    keywords: ["payment", "razorpay", "upi", "card"],
    reply:
      "Checkout is a simulated INR payment modal (UPI / card / netbanking). Connect Razorpay when you go live — no charges are taken in this build.",
  },
];

export const BOT_FALLBACK =
  "I didn't quite catch that. Try asking about pricing, refunds, courses, login, peer chat, or support tickets. A human can pick up anything I miss.";

export function getBotReply(input: string): string {
  const text = input.toLowerCase();
  const hit = BOT_RULES.find((rule) =>
    rule.keywords.some((k) => text.includes(k))
  );
  return hit?.reply ?? BOT_FALLBACK;
}
