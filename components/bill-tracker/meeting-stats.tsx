import { CurrencyCode, formatCurrency } from "@/lib/currency";

interface MeetingStatsProps {
  participants: number;
  currency: CurrencyCode;
  hourlyWage: number;
  finalElapsedSeconds: number;
}

export function MeetingStats({
  participants,
  currency,
  hourlyWage,
  finalElapsedSeconds,
}: MeetingStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 justify-items-center">
      <div className="text-center sm:text-start">
        <h3 className="font-semibold text-foreground">Meeting Details</h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div>{participants} participants</div>
          <div>
            {formatCurrency(hourlyWage, currency, 0, 0)} average hourly rate
          </div>
          <div>
            {formatCurrency((participants * hourlyWage) / 60, currency)} cost
            per minute
          </div>
        </div>
      </div>

      <div className="text-center sm:text-start">
        <h3 className="font-semibold text-foreground">Time Investment</h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div>
            {((finalElapsedSeconds * participants) / 60).toFixed(1)} total
            person-minutes
          </div>
          <div>
            {((finalElapsedSeconds * participants) / 3600).toFixed(1)} total
            person-hours
          </div>
          <div>
            {((finalElapsedSeconds * participants) / (8 * 3600)).toFixed(2)}{" "}
            person-days
            {(finalElapsedSeconds * participants) / (8 * 3600) >= 1
              ? " 🤯"
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
