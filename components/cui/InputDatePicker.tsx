"use client";
import { Input } from "@/components/ui/input";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  selectedDate?: Date;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
  className?: string;
}

const toValue = (d?: Date) =>
  d && !Number.isNaN(d.getTime())
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";

/** Plain date input that talks in `Date` objects. */
export default function InputDatePicker({ selectedDate, setSelectedDate, className }: Props) {
  return (
    <Input
      type="date"
      className={className ?? "h-8 w-36"}
      value={toValue(selectedDate)}
      onChange={(e) => {
        const v = e.target.value;
        setSelectedDate(v ? new Date(`${v}T00:00:00`) : undefined);
      }}
    />
  );
}
