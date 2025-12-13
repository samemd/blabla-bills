"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputBase,
  InputBaseAdornment,
  InputBaseControl,
  InputBaseInput,
} from "@/components/ui/input-base";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CURRENCIES, CurrencyCode, formatCurrency } from "@/lib/currency";
import { useMutation } from "convex/react";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MeetingSettingsDropdownProps {
  meetingId: Id<"meetings">;
  controlToken: string;
  participants: number;
  hourlyWage: number;
  currency: CurrencyCode;
}

export function MeetingSettingsDropdown({
  meetingId,
  controlToken,
  participants,
  hourlyWage,
  currency,
}: MeetingSettingsDropdownProps) {
  const updateMeeting = useMutation(api.meetings.update);

  const [open, setOpen] = useState(false);
  const [localParticipants, setLocalParticipants] = useState(participants);
  const [localHourlyWage, setLocalHourlyWage] = useState(hourlyWage);
  const [isSaving, setIsSaving] = useState(false);

  const symbol =
    CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;

  const hasChanges =
    localParticipants !== participants || localHourlyWage !== hourlyWage;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset to current props when opening
      setLocalParticipants(participants);
      setLocalHourlyWage(hourlyWage);
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await updateMeeting({
      id: meetingId,
      token: controlToken,
      participants: localParticipants,
      hourlyWage: localHourlyWage,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Settings updated");
      setOpen(false);
    } else {
      toast.error("Failed to update settings");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="iconSm" aria-label="Meeting settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-4">
        <DropdownMenuLabel className="px-0 pb-3">
          Meeting Settings
        </DropdownMenuLabel>

        {/* Participants */}
        <div className="space-y-2">
          <Label htmlFor="settings-participants">Participants</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() =>
                setLocalParticipants(Math.max(1, localParticipants - 1))
              }
              aria-label="Decrease participants"
            >
              -
            </Button>
            <Input
              id="settings-participants"
              type="number"
              inputMode="numeric"
              min={1}
              value={localParticipants}
              onChange={(e) =>
                setLocalParticipants(Math.max(1, Number(e.target.value) || 1))
              }
              className="h-8 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setLocalParticipants(localParticipants + 1)}
              aria-label="Increase participants"
            >
              +
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator className="my-4" />

        {/* Hourly Wage */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="settings-wage">Hourly wage</Label>
            <InputBase className="w-24">
              <InputBaseAdornment>{symbol}</InputBaseAdornment>
              <InputBaseControl>
                <InputBaseInput
                  id="settings-wage"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="1"
                  max={300}
                  value={localHourlyWage}
                  onChange={(e) =>
                    setLocalHourlyWage(Math.max(0, +e.target.value || 0))
                  }
                  className="w-14 text-end"
                />
              </InputBaseControl>
            </InputBase>
          </div>
          <Slider
            value={[localHourlyWage]}
            min={0}
            max={300}
            step={1}
            onValueChange={([v]) => setLocalHourlyWage(v)}
            aria-label="Hourly wage slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{formatCurrency(150, currency, 0, 0)}</span>
            <span>{formatCurrency(300, currency, 0, 0)}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-4" />

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
