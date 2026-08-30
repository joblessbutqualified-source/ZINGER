import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <h1 className="font-display text-4xl">Terms of use</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          These terms govern access to Zinger Edutech Pvt. Ltd. (&quot;Zinger&quot;), Helios Tech Park,
          Outer Ring Road, Bengaluru, KA 560103. By creating an account you agree to learn
          in good faith, not redistribute lesson media, and treat peer chat as a professional space.
          Subscriptions billed in INR may be cancelled as described in-product. Simulated payments
          in this deployment do not create a charge unless a live payment provider is connected.
        </p>
      </main>
      <Footer />
    </>
  );
}
