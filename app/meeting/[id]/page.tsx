import { getMeetingAction } from "@/app/actions/meetings";
import { SummaryStep } from "@/components/bill-tracker/summary-step";
import { TrackingStep } from "@/components/bill-tracker/tracking-step";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { notFound } from "next/navigation";

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const meeting = await getMeetingAction(id);

  if (!meeting) {
    return notFound();
  }

  // Check if the token matches - if so, user has control
  const hasControl = token === meeting.controlToken;
  const readonly = !hasControl;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.08),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.08),transparent)] dark:bg-[radial-gradient(1000px_600px_at_20%_-10%,rgba(59,130,246,0.12),transparent),radial-gradient(800px_500px_at_80%_10%,rgba(251,113,133,0.12),transparent)]" />
      <Header />
      <main className="container mx-auto w-full max-w-3xl py-8 md:py-12">
        {meeting.status === "finished" ? (
          <SummaryStep
            name={meeting.name}
            meetingId={meeting.id}
            participants={meeting.participants}
            currency={meeting.currency}
            hourlyWage={meeting.hourlyWage}
            finalElapsedSeconds={meeting.finalElapsedSeconds ?? 0}
            finalTotal={meeting.finalTotal ?? 0}
            readonly={readonly}
          />
        ) : (
          <TrackingStep
            name={meeting.name}
            meetingId={meeting.id}
            participants={meeting.participants}
            currency={meeting.currency}
            hourlyWage={meeting.hourlyWage}
            status={meeting.status}
            startedAt={meeting.startedAt}
            accumulatedSeconds={meeting.accumulatedSeconds}
            readonly={readonly}
            controlToken={hasControl ? token : undefined}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
