import * as React from "react";

import { Input } from "./input";

interface OtpInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
}

function OtpInput({ className, onChange, ...props }: OtpInputProps) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="000000"
      className={`text-center text-lg tracking-[0.5em] ${className ?? ""}`}
      onChange={(e) => {
        // keep only digits, cap at 6 — a single wide input is simpler and
        // just as usable as 6 separate auto-advancing boxes
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
        e.target.value = digitsOnly;
        onChange(e);
      }}
      {...props}
    />
  );
}

export { OtpInput };