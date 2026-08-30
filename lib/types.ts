export type UserRole = "student" | "admin";

export type CourseCategory =
  | "Web Dev"
  | "AI/ML"
  | "Data Science"
  | "DevOps"
  | "UI/UX"
  | "Mobile Dev";

export const COURSE_CATEGORIES: CourseCategory[] = [
  "Web Dev",
  "AI/ML",
  "Data Science",
  "DevOps",
  "UI/UX",
  "Mobile Dev",
];

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
  lastSeenAt?: string | null;
}

export interface ChatUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  lastSeenAt?: string | null;
  online: boolean;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  priceInr: number;
  thumbnailUrl: string;
  totalLessons: number;
  instructor: string;
  rating: number;
  students: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationHours: number;
  tags: string[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  order: number;
  completed?: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercentage: number;
  enrolledAt: string;
  completedLessons: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  course: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceInr: number;
  cadence: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const DEMO_AUTH_COOKIE = "zinger-demo-session";
export const AUTH_COOKIE = "zinger-auth";
