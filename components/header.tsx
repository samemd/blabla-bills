import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 font-bold w-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-fuchsia-500 text-white shadow"
        >
          BB
        </Link>
        <Link href="/" className="text-xl font-semibold text-foreground">
          BlablaBills
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-sm  dark:text-slate-400 sm:block">
          Track the cost of your meetings in real time.
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
