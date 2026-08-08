import * as RadioGroup from "@radix-ui/react-radio-group";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-ui text-sm text-ink-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "tap w-full rounded-key border border-line bg-felt px-4",
        "font-ui text-ink placeholder:text-ink-faint",
        "focus:border-line-strong",
        className
      )}
      {...props}
    />
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/**
 * Radios con forma de tarjeta: en móvil un radio de 20px no es un target
 * aceptable, la tarjeta entera sí.
 */
export function RadioCards<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  ariaLabel: string;
}) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={ariaLabel}
      className="grid gap-2 sm:grid-cols-2"
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "flex min-h-12 flex-col justify-center rounded-key border px-4 py-2 text-left",
            "border-line transition-colors hover:border-line-strong",
            "data-[state=checked]:border-chalk data-[state=checked]:bg-felt-overlay"
          )}
        >
          <span className="font-ui text-[0.95rem] text-ink">{option.label}</span>
          {option.hint && (
            <span className="text-xs text-ink-faint">{option.hint}</span>
          )}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4">
      <span className="font-ui text-[0.95rem] text-ink">{label}</span>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border border-line transition-colors",
          "bg-felt data-[state=checked]:border-chalk data-[state=checked]:bg-chalk"
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block size-5 rounded-full bg-ink-faint transition-transform",
            "translate-x-1 data-[state=checked]:translate-x-6 data-[state=checked]:bg-felt"
          )}
        />
      </SwitchPrimitive.Root>
    </label>
  );
}
