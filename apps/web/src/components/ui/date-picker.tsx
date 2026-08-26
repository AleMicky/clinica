"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  id?: string;
  value?: string; // Format: "YYYY-MM-DD" or ""
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  minDate?: string; // "YYYY-MM-DD"
  maxDate?: string; // "YYYY-MM-DD"
  fromYear?: number;
  toYear?: number;
  allowClear?: boolean;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

// Helper to format ISO "YYYY-MM-DD" to Display "DD/MM/YYYY"
function formatDateToDisplay(isoStr?: string): string {
  if (!isoStr) return "";
  const cleanIso = isoStr.includes("T") ? isoStr.split("T")[0] : isoStr;
  const parts = cleanIso.split("-");
  if (parts.length !== 3) return isoStr;
  const [year, month, day] = parts;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

// Validate day, month, year and return ISO string "YYYY-MM-DD" or null
function validateAndFormatIso(day: number, month: number, year: number): string | null {
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Helper to parse multiple date formats to ISO "YYYY-MM-DD"
// Supports "DD/MM/YYYY", "DD-MM-YYYY", "DD.MM.YYYY", "DDMMYYYY", "YYYY-MM-DD", "YYYYMMDD"
function parseDisplayToIso(displayStr: string): string | null {
  const clean = displayStr.trim();
  if (!clean) return null;

  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map((n) => parseInt(n, 10));
    return validateAndFormatIso(d, m, y);
  }

  // 8 continuous digits: DDMMYYYY or YYYYMMDD
  if (/^\d{8}$/.test(clean)) {
    const firstFour = parseInt(clean.substring(0, 4), 10);
    // If starts with plausible year (e.g. 19xx, 20xx) and middle is plausible month
    if (firstFour >= 1900 && firstFour <= 2100) {
      const year = firstFour;
      const month = parseInt(clean.substring(4, 6), 10);
      const day = parseInt(clean.substring(6, 8), 10);
      const iso = validateAndFormatIso(day, month, year);
      if (iso) return iso;
    }
    // Default: DDMMYYYY
    const day = parseInt(clean.substring(0, 2), 10);
    const month = parseInt(clean.substring(2, 4), 10);
    const year = parseInt(clean.substring(4, 8), 10);
    return validateAndFormatIso(day, month, year);
  }

  // Separator delimited: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const parts = clean.split(/[/.-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return validateAndFormatIso(day, month, year);
  }

  return null;
}

// Smart input formatter for typing DD/MM/YYYY
function formatInputMask(value: string, prevValue: string = ""): string {
  // If deleting, let the user delete freely
  if (value.length < prevValue.length) {
    return value;
  }

  // If already ISO format (e.g. pasted 1993-03-16)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return formatDateToDisplay(value.trim());
  }

  // Extract only digits and slashes
  const clean = value.replace(/[^\d/.-]/g, "").replace(/[-.]/g, "/");
  const digitsOnly = clean.replace(/\D/g, "").slice(0, 8);

  if (digitsOnly.length === 0) return "";

  if (digitsOnly.length <= 2) {
    // If typed 2 digits and no slash yet, auto-add slash for convenience
    if (digitsOnly.length === 2 && !clean.includes("/")) {
      return `${digitsOnly}/`;
    }
    return clean.endsWith("/") ? `${digitsOnly}/` : digitsOnly;
  } else if (digitsOnly.length <= 4) {
    const day = digitsOnly.slice(0, 2);
    const month = digitsOnly.slice(2);
    if (digitsOnly.length === 4 && (clean.length >= 5 || !clean.slice(3).includes("/"))) {
      return `${day}/${month}/`;
    }
    return `${day}/${month}`;
  } else {
    const day = digitsOnly.slice(0, 2);
    const month = digitsOnly.slice(2, 4);
    const year = digitsOnly.slice(4, 8);
    return `${day}/${month}/${year}`;
  }
}

export function DatePicker({
  id,
  value = "",
  onChange,
  placeholder = "DD/MM/AAAA",
  disabled = false,
  error = false,
  className,
  minDate,
  maxDate,
  fromYear = 1920,
  toYear = new Date().getFullYear() + 5,
  allowClear = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState(() => formatDateToDisplay(value));

  // Calendar view state (current month & year in view)
  const initialDate = React.useMemo(() => {
    if (value) {
      const cleanIso = value.includes("T") ? value.split("T")[0] : value;
      const d = new Date(cleanIso + "T00:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = React.useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState<number>(initialDate.getMonth());

  // Sync internal display when external value changes
  React.useEffect(() => {
    setInputText(formatDateToDisplay(value));
    if (value) {
      const cleanIso = value.includes("T") ? value.split("T")[0] : value;
      const d = new Date(cleanIso + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Generate Year options
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = toYear; y >= fromYear; y--) {
      list.push(y);
    }
    return list;
  }, [fromYear, toYear]);

  // Calendar matrix calculation
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      iso: string;
      isDisabled: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const todayIso = new Date().toISOString().split("T")[0];
    const selectedIso = value ? (value.includes("T") ? value.split("T")[0] : value) : "";

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isDisabled =
        (Boolean(minDate) && iso < minDate!) ||
        (Boolean(maxDate) && iso > maxDate!);

      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        iso,
        isDisabled,
        isSelected: iso === selectedIso,
        isToday: iso === todayIso,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isDisabled =
        (Boolean(minDate) && iso < minDate!) ||
        (Boolean(maxDate) && iso > maxDate!);

      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        iso,
        isDisabled,
        isSelected: iso === selectedIso,
        isToday: iso === todayIso,
      });
    }

    // Next month padding days to fill 35 or 42 grid items
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isDisabled =
        (Boolean(minDate) && iso < minDate!) ||
        (Boolean(maxDate) && iso > maxDate!);

      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        iso,
        isDisabled,
        isSelected: iso === selectedIso,
        isToday: iso === todayIso,
      });
    }

    return days;
  }, [viewYear, viewMonth, value, minDate, maxDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (iso: string) => {
    onChange?.(iso);
    setInputText(formatDateToDisplay(iso));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
    setInputText("");
  };

  const handleToday = () => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    handleSelectDate(todayIso);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatInputMask(rawVal, inputText);
    setInputText(formatted);

    if (!formatted.trim()) {
      onChange?.("");
      return;
    }

    const iso = parseDisplayToIso(formatted);
    if (iso) {
      onChange?.(iso);
      const d = new Date(iso + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputText.trim()) {
      onChange?.("");
      setInputText("");
      return;
    }
    const iso = parseDisplayToIso(inputText);
    if (iso) {
      onChange?.(iso);
      setInputText(formatDateToDisplay(iso));
      const d = new Date(iso + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    } else if (value) {
      setInputText(formatDateToDisplay(value));
    } else {
      setInputText("");
      onChange?.("");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const iso = parseDisplayToIso(pasted);
    if (iso) {
      e.preventDefault();
      const display = formatDateToDisplay(iso);
      setInputText(display);
      onChange?.(iso);
      const d = new Date(iso + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("relative flex items-center w-full", className)}>
        <Input
          id={id}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleInputBlur();
            }
          }}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className={cn(
            "w-full h-8 text-xs font-mono pr-14 pl-2.5",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />

        <div className="absolute right-1 flex items-center gap-0.5">
          {allowClear && !disabled && Boolean(value) && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className="p-1 text-muted-foreground/60 hover:text-foreground rounded-sm transition-colors cursor-pointer"
              title="Borrar fecha"
            >
              <X className="size-3" />
            </button>
          )}

          <PopoverTrigger
            type="button"
            disabled={disabled}
            className={cn(
              "p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
              isOpen && "text-primary bg-primary/10"
            )}
            title="Seleccionar fecha en calendario"
          >
            <CalendarIcon className="size-3.5" />
          </PopoverTrigger>
        </div>
      </div>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[280px] p-3 shadow-lg border border-border/80 rounded-xl bg-popover"
      >
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between gap-1 pb-2 border-b border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="size-7 h-7 w-7 rounded-md cursor-pointer hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Mes anterior</span>
          </Button>

          <div className="flex items-center gap-1.5">
            {/* Month selector */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="h-7 text-xs font-medium bg-transparent rounded-md border border-input px-1.5 py-0.5 cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx} className="bg-popover text-popover-foreground">
                  {name}
                </option>
              ))}
            </select>

            {/* Year selector */}
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="h-7 text-xs font-medium font-mono bg-transparent rounded-md border border-input px-1.5 py-0.5 cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-popover text-popover-foreground">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="size-7 h-7 w-7 rounded-md cursor-pointer hover:bg-muted"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Mes siguiente</span>
          </Button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
          {DAY_NAMES.map((d, index) => (
            <span
              key={d}
              className={cn(
                "text-[10px] font-semibold text-muted-foreground",
                index === 0 && "text-rose-500/80"
              )}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, idx) => {
            return (
              <button
                key={idx}
                type="button"
                disabled={item.isDisabled}
                onClick={() => handleSelectDate(item.iso)}
                className={cn(
                  "size-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center cursor-pointer select-none",
                  !item.isCurrentMonth && "text-muted-foreground/30",
                  item.isCurrentMonth && "text-foreground hover:bg-muted",
                  item.isToday && !item.isSelected && "border border-primary/40 font-bold text-primary",
                  item.isSelected &&
                    "bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90",
                  item.isDisabled &&
                    "opacity-30 cursor-not-allowed pointer-events-none hover:bg-transparent"
                )}
              >
                {item.day}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Actions */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/50 text-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="h-6 px-2 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Hoy</span>
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              Limpiar
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
