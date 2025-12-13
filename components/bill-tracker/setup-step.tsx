"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputBase,
  InputBaseAdornment,
  InputBaseControl,
  InputBaseInput,
} from "@/components/ui/input-base";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currency";
import { generateName } from "@/lib/name-generator";
import { Separator } from "@/components/ui/separator";
import { WandSparkles } from "lucide-react";

interface SetupStepProps {
  name: string;
  setName: (value: string) => void;
  participants: number;
  setParticipants: (value: number) => void;
  currency: CurrencyCode;
  setCurrency: (value: CurrencyCode) => void;
  hourlyWage: number;
  setHourlyWage: (value: number) => void;
  onStart: () => void;
}

export function SetupStep({
  name,
  setName,
  participants,
  setParticipants,
  currency,
  setCurrency,
  hourlyWage,
  setHourlyWage,
  onStart,
}: SetupStepProps) {
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "CHF";

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Meeting name */}
          <div className="space-y-3">
            <Label htmlFor="name">Meeting Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="name"
                placeholder="Enter meeting name"
                className="flex-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setName(generateName())}
                aria-label="Generate meeting name"
              >
                <WandSparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-3 row-start-2">
            <Label htmlFor="participants">Participants</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
                aria-label="Decrease participants"
              >
                −
              </Button>
              <Input
                id="participants"
                type="number"
                inputMode="numeric"
                min={1}
                value={participants}
                onChange={(e) =>
                  setParticipants(Math.max(1, Number(e.target.value) || 1))
                }
                className="text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setParticipants(participants + 1)}
                aria-label="Increase participants"
              >
                +
              </Button>
            </div>
            <p className="text-sm text-subtle">
              Include everyone in the room or call.
            </p>
          </div>

          {/* Currency */}
          <div className="space-y-3 row-start-2">
            <Label>Currency</Label>
            <Select
              value={currency}
              onValueChange={(val) => setCurrency(val as CurrencyCode)}
            >
              <SelectTrigger className="w-full" aria-label="Currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-subtle">
              Display currency for wages and totals.
            </p>
          </div>
        </div>

        <Separator className="my-6 dark:bg-slate-800" />

        {/* Hourly wage */}
        <div className="grid gap-3">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <Label htmlFor="wage">Average hourly wage per person</Label>
              <p className="text-sm text-subtle">A rough average is enough.</p>
            </div>
            <div className="flex items-center gap-2">
              <InputBase>
                <InputBaseAdornment>{symbol}</InputBaseAdornment>
                <InputBaseControl>
                  <InputBaseInput
                    id="wage"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    max={300}
                    value={hourlyWage}
                    onChange={(e) =>
                      setHourlyWage(Math.max(0, +e.target.value || 0))
                    }
                    className="w-20 text-end"
                  />
                </InputBaseControl>
              </InputBase>
            </div>
          </div>
          <Slider
            value={[hourlyWage]}
            min={0}
            max={300}
            step={1}
            onValueChange={([v]) => setHourlyWage(v)}
            aria-label="Hourly wage slider"
          />
          <div className="flex justify-between text-xs text-subtle">
            <span>0</span>
            <span>{formatCurrency(150, currency, 0, 0)} (typical)</span>
            <span>{formatCurrency(300, currency, 0, 0)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button size="lg" variant="special" onClick={onStart}>
            Start Tracking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
