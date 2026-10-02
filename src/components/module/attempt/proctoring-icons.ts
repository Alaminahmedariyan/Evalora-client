import {
  Camera,
  Clipboard,
  ClipboardPaste,
  Eye,
  EyeOff,
  Maximize,
  Mic,
  MonitorX,
  type LucideIcon,
} from "lucide-react";

import type { ProctoringEventType } from "@/types";

export const PROCTORING_ICON: Record<ProctoringEventType, LucideIcon> = {
  TAB_SWITCH: EyeOff,
  FULLSCREEN_EXIT: Maximize,
  COPY: Clipboard,
  PASTE: ClipboardPaste,
  DEVTOOLS_DETECTED: MonitorX,
  CAMERA_BLOCKED: Camera,
  MICROPHONE_BLOCKED: Mic,
  WINDOW_BLUR: EyeOff,
  WINDOW_FOCUS: Eye,
  OTHER: Eye,
};

// Matches globals.css's .proctor-warning / .proctor-danger split — these
// two classes exist specifically for proctoring severity, distinct from
// generic status colors (see design-system.md §1).
export const PROCTORING_SEVERITY: Record<ProctoringEventType, "warning" | "danger"> = {
  TAB_SWITCH: "warning",
  FULLSCREEN_EXIT: "danger",
  COPY: "warning",
  PASTE: "warning",
  DEVTOOLS_DETECTED: "danger",
  CAMERA_BLOCKED: "danger",
  MICROPHONE_BLOCKED: "danger",
  WINDOW_BLUR: "warning",
  WINDOW_FOCUS: "warning",
  OTHER: "warning",
};

export const PROCTORING_LABEL: Record<ProctoringEventType, string> = {
  TAB_SWITCH: "Switched tabs",
  FULLSCREEN_EXIT: "Exited fullscreen",
  COPY: "Copied text",
  PASTE: "Pasted text",
  DEVTOOLS_DETECTED: "Developer tools opened",
  CAMERA_BLOCKED: "Camera blocked",
  MICROPHONE_BLOCKED: "Microphone blocked",
  WINDOW_BLUR: "Left the window",
  WINDOW_FOCUS: "Returned to window",
  OTHER: "Other event",
};