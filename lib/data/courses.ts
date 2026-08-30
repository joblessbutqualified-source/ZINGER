import type { Course, CourseCategory, Lesson } from "@/lib/types";

const CATEGORY_META: Record<
  CourseCategory,
  { instructors: string[]; tags: string[]; thumbs: string[] }
> = {
  "Web Dev": {
    instructors: ["Ananya Rao", "Karthik Menon", "Priya Nair"],
    tags: ["React", "Next.js", "TypeScript", "Node", "GraphQL"],
    thumbs: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
      "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80",
    ],
  },
  "AI/ML": {
    instructors: ["Dr. Meera Iyer", "Arjun Kapoor", "Sana Qureshi"],
    tags: ["Python", "PyTorch", "LLMs", "NLP", "Computer Vision"],
    thumbs: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80",
    ],
  },
  "Data Science": {
    instructors: ["Rohit Sharma", "Neha Kulkarni", "Vikram Joshi"],
    tags: ["SQL", "Pandas", "Tableau", "Statistics", "Spark"],
    thumbs: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80",
    ],
  },
  DevOps: {
    instructors: ["Aisha Khan", "Nikhil Verma", "Pooja Reddy"],
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
    thumbs: [
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
      "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    ],
  },
  "UI/UX": {
    instructors: ["Ishita Bose", "Daniel Cruz", "Rhea Malhotra"],
    tags: ["Figma", "Design Systems", "Research", "Prototyping", "Motion"],
    thumbs: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80",
      "https://images.unsplash.com/photo-1613909207039-6b173b755cc1?w=800&q=80",
    ],
  },
  "Mobile Dev": {
    instructors: ["Harsh Patel", "Lisa Wong", "Aditya Sen"],
    tags: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
    thumbs: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&q=80",
    ],
  },
};

const TITLES: Record<CourseCategory, string[]> = {
  "Web Dev": [
    "Full-Stack JavaScript Bootcamp",
    "Next.js 14 Production Apps",
    "TypeScript for Serious Engineers",
    "React Performance Masterclass",
    "Node.js APIs at Scale",
    "GraphQL from Zero to Production",
    "Tailwind & Design Systems",
    "Web Security Essentials",
    "Prisma & PostgreSQL Deep Dive",
    "Frontend System Design",
    "Build a SaaS in 30 Days",
    "Advanced CSS Animations",
  ],
  "AI/ML": [
    "Machine Learning Foundations",
    "Deep Learning with PyTorch",
    "LLM Engineering & RAG",
    "Computer Vision in Practice",
    "NLP for Product Teams",
    "MLOps: Models to Production",
    "Generative AI for Developers",
    "Prompt Engineering Studio",
    "Applied Reinforcement Learning",
    "AI Agents & Tool Use",
    "Fine-tuning Open Models",
    "Responsible AI & Evaluation",
  ],
  "Data Science": [
    "Python for Data Science",
    "SQL Analytics Academy",
    "Statistics that Actually Matter",
    "Power BI Storytelling",
    "Tableau for Analysts",
    "Spark & Big Data Pipelines",
    "A/B Testing Playbook",
    "Feature Engineering Lab",
    "Time Series Forecasting",
    "Data Engineering with dbt",
    "Excel to Python Transition",
    "Business Intelligence Career Track",
  ],
  DevOps: [
    "Docker & Kubernetes Path",
    "AWS Solutions Architect Prep",
    "GitHub Actions CI/CD",
    "Terraform Infrastructure as Code",
    "Linux for Cloud Engineers",
    "Observability with Grafana",
    "Site Reliability Engineering",
    "GitOps with Argo CD",
    "Secure Cloud Networking",
    "Helm & Cluster Ops",
    "Platform Engineering 101",
    "Incident Response Drills",
  ],
  "UI/UX": [
    "Product Design from Brief to Ship",
    "Figma to Production Handoff",
    "UX Research Field Guide",
    "Mobile Interface Patterns",
    "Motion Design for Product",
    "Accessible Interfaces",
    "Design Systems at Scale",
    "Conversion-focused UX",
    "Visual Hierarchy Mastery",
    "Interaction Design Studio",
    "Portfolio that Gets Hired",
    "Service Design Workshops",
  ],
  "Mobile Dev": [
    "React Native Career Track",
    "Flutter from Zero",
    "iOS with SwiftUI",
    "Android with Kotlin",
    "Mobile Architecture Patterns",
    "Offline-first Apps",
    "App Store Launch Lab",
    "Firebase for Mobile",
    "Animations in React Native",
    "Cross-platform Performance",
    "Push, Payments & Deep Links",
    "Wearables & Companion Apps",
  ],
};

const LEVELS: Course["level"][] = ["Beginner", "Intermediate", "Advanced"];
const PRICES = [499, 799, 999, 1299, 1499, 1999, 2499, 2999, 3499, 3999];

function seeded(n: number): number {
  const x = Math.sin(n * 999) * 10000;
  return x - Math.floor(x);
}

function buildCourses(): Course[] {
  const list: Course[] = [];
  (Object.keys(TITLES) as CourseCategory[]).forEach((category, catIndex) => {
    TITLES[category].forEach((title, i) => {
      const seed = catIndex * 20 + i + 1;
      const meta = CATEGORY_META[category];
      const price = PRICES[Math.floor(seeded(seed) * PRICES.length)];
      const lessons = 8 + Math.floor(seeded(seed + 3) * 16);
      list.push({
        id: `crs_${category.slice(0, 2).toLowerCase()}_${String(i + 1).padStart(2, "0")}`,
        title,
        description: `A production-grade ${category} programme covering ${meta.tags.slice(0, 3).join(", ")} with hands-on projects, mentor reviews, and a hiring-ready capstone. Built for working professionals targeting India's top product companies.`,
        category,
        priceInr: price,
        thumbnailUrl: meta.thumbs[i % meta.thumbs.length],
        totalLessons: lessons,
        instructor: meta.instructors[i % meta.instructors.length],
        rating: Number((4.4 + seeded(seed + 7) * 0.55).toFixed(1)),
        students: 1200 + Math.floor(seeded(seed + 9) * 18000),
        level: LEVELS[i % LEVELS.length],
        durationHours: 12 + Math.floor(seeded(seed + 11) * 40),
        tags: meta.tags.slice(0, 3 + (i % 2)),
        createdAt: new Date(2025, (i + catIndex) % 12, 4 + (i % 20)).toISOString(),
      });
    });
  });
  return list;
}

export const COURSES: Course[] = buildCourses();

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getLessonsForCourse(course: Course): Lesson[] {
  return Array.from({ length: course.totalLessons }, (_, i) => ({
    id: `${course.id}_l${i + 1}`,
    courseId: course.id,
    title:
      i === 0
        ? "Orientation & tool setup"
        : i === course.totalLessons - 1
          ? "Capstone review & next steps"
          : `Module ${i}: ${course.tags[i % course.tags.length]} workshop`,
    duration: `${6 + ((i * 3) % 12)}:${i % 2 === 0 ? "00" : "30"}`,
    order: i + 1,
  }));
}

export const POPULAR_STREAMS: { category: CourseCategory; fromInr: number; blurb: string }[] = [
  { category: "Web Dev", fromInr: 799, blurb: "Ship production Next.js products." },
  { category: "AI/ML", fromInr: 999, blurb: "Build RAG systems and agents." },
  { category: "Data Science", fromInr: 499, blurb: "Turn messy data into decisions." },
  { category: "DevOps", fromInr: 1299, blurb: "Cloud, containers, and reliability." },
];
