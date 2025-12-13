import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MeetingView } from "./meeting-view";
import { Id } from "@/convex/_generated/dataModel";

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: Id<"meetings"> }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const id = (await params).id;
  const token = (await searchParams).token ?? undefined;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.08),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.08),transparent)] dark:bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.12),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.12),transparent)]" />
      <Header />
      <main className="container mx-auto w-full max-w-3xl py-8 md:py-12">
        <MeetingView meetingId={id} token={token} />
      </main>
      <Footer />
    </div>
  );
}
