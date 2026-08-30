import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <h1 className="font-display text-4xl">Privacy policy</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Zinger stores profile, enrollment, chat, and support data in Supabase (PostgreSQL)
          when configured. Demo mode keeps a session cookie and local storage on your device only.
          We do not sell learner data. Contact privacy@zinger.com or write to Zinger Edutech HQ,
          Helios Tech Park, Outer Ring Road, Bengaluru, KA 560103.
        </p>
      </main>
      <Footer />
    </>
  );
}
