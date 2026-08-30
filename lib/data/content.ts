import type { PricingPlan, Testimonial } from "@/lib/types";

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Aditi Sharma",
    role: "Frontend Engineer",
    company: "Razorpay",
    quote:
      "Zinger's Next.js track was the reason I cracked Razorpay. The mock interviews and capstone reviews felt like a real product team.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/160?img=47",
    course: "Next.js 14 Production Apps",
  },
  {
    id: "t2",
    name: "Rahul Mehta",
    role: "ML Engineer",
    company: "Swiggy",
    quote:
      "The RAG and LLM engineering modules are current — not textbook fluff. I shipped an internal copilot in six weeks.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/160?img=12",
    course: "LLM Engineering & RAG",
  },
  {
    id: "t3",
    name: "Sneha Iyer",
    role: "Product Designer",
    company: " CRED",
    quote:
      "From Figma systems to motion, the UI/UX path is the most practical design curriculum I've paid for in India.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/160?img=32",
    course: "Product Design from Brief to Ship",
  },
  {
    id: "t4",
    name: "Mohammed Irfan",
    role: "DevOps Engineer",
    company: "PhonePe",
    quote:
      "Kubernetes finally clicked. The incident drills are brutal in the best way — I walk into on-call without panic now.",
    rating: 4,
    avatarUrl: "https://i.pravatar.cc/160?img=15",
    course: "Docker & Kubernetes Path",
  },
  {
    id: "t5",
    name: "Kavya Reddy",
    role: "Data Analyst",
    company: "Flipkart",
    quote:
      "SQL + storytelling modules got me from support ops into analytics. Mentors actually reviewed my dashboards.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/160?img=20",
    course: "SQL Analytics Academy",
  },
  {
    id: "t6",
    name: "Varun Desai",
    role: "iOS Developer",
    company: "Zoho",
    quote:
      "SwiftUI track plus App Store lab is gold. I published my first indie app while finishing the course.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/160?img=8",
    course: "iOS with SwiftUI",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "monthly",
    name: "Spark",
    priceInr: 999,
    cadence: "/ month",
    description: "Full catalog access billed monthly. Pause anytime.",
    features: [
      "All 70+ live courses",
      "AI support chatbot",
      "Peer chat rooms",
      "Completion certificates",
      "Cancel anytime",
    ],
  },
  {
    id: "quarter",
    name: "Ignite",
    priceInr: 2499,
    cadence: "/ quarter",
    description: "Best for a focused 12-week career sprint.",
    highlighted: true,
    badge: "Most chosen",
    features: [
      "Everything in Spark",
      "Priority mentor reviews",
      "Mock interviews (2)",
      "Hiring partner referrals",
      "Save vs monthly billing",
    ],
  },
  {
    id: "yearly",
    name: "Lifetime",
    priceInr: 4999,
    cadence: "/ year · then lifetime",
    description: "One year of updates, then lifetime access locked in.",
    features: [
      "Everything in Ignite",
      "Lifetime catalog access",
      "Alumni community",
      "Annual capstone showcase",
      "Resume + LinkedIn clinic",
    ],
  },
];

export const STATS = [
  { label: "Students trained", value: 84200, suffix: "+" },
  { label: "Course completion", value: 94, suffix: "%" },
  { label: "Hiring partners", value: 180, suffix: "+" },
  { label: "Avg. salary jump", value: 48, suffix: "%" },
];
