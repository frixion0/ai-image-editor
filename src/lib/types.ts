import type { LucideIcon } from "lucide-react";

export type Tool =
  | "enhance"
  | "ai-manipulation";

export interface ToolDefinition {
  id: Tool;
  name: string;
  icon: LucideIcon;
}
