import type { LucideIcon } from "lucide-react";

export type Tool =
  | "enhance"
  | "object-removal"
  | "style-transfer"
  | "recoloring"
  | "ai-manipulation";

export interface ToolDefinition {
  id: Tool;
  name: string;
  icon: LucideIcon;
}
