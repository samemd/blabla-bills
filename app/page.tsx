import { BillTracker } from "@/components/bill-tracker/bill-tracker";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default async function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.08),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.08),transparent)] dark:bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.12),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.12),transparent)]" />
      <Header />
      <main className="mx-auto max-w-5xl px-6">
        <section className="mb-10 mt-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl text-balance font-extrabold tracking-tight text-foreground md:text-5xl">
              How much is this meeting really costing you?
            </h1>
            <p className="text-balance mt-4 text-lg text-muted-foreground">
              BlablaBills makes the hidden cost of endless discussions obvious.
            </p>
            <p className="text-balance text-lg text-muted-foreground">
              Add participants, set an hourly wage, pick a currency, and start
              the clock.
            </p>
            <p className="text-balance mt-2 text-lg text-muted-foreground">
              Watch the bill climb — and what you could’ve bought instead.
            </p>
          </div>
        </section>
        <BillTracker />
      </main>
      <Footer />
    </div>
  );
}
