import { SetupStep } from "@/components/bill-tracker/setup-step";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default async function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.08),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.08),transparent)] dark:bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.12),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.12),transparent)]" />
      <Header />
      <main className="mx-auto max-w-3xl px-4 lg:px-6">
        <SetupStep />
      </main>
      <Footer />
    </div>
  );
}
