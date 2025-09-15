import React from "react";
import { Grid3X3, List } from "lucide-react";
import { motion } from "framer-motion";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  className = "",
  size = "sm",
  showLabels = false,
}) => {
  const sizeConfig = {
    sm: {
      container: "h-9 px-1",
      button: "h-7 px-3 text-sm",
      icon: "h-4 w-4",
      gap: "gap-1.5",
    },
    md: {
      container: "h-10 px-1.5",
      button: "h-8 px-4 text-sm",
      icon: "h-4 w-4", 
      gap: "gap-2",
    },
    lg: {
      container: "h-12 px-2",
      button: "h-10 px-5 text-base",
      icon: "h-5 w-5",
      gap: "gap-2",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative inline-flex items-center ${config.container} bg-muted/50 dark:bg-muted/30 rounded-lg border border-border/50 shadow-sm ${className}`}>
      <motion.div
        className="absolute top-1 bottom-1 bg-background border border-border/20 rounded-md shadow-sm"
        initial={false}
        animate={{
          x: viewMode === "list" ? 0 : "100%",
          width: "calc(50% - 2px)",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      />
      
      <button
        onClick={() => onViewModeChange("list")}
        className={`relative z-10 flex items-center justify-center ${config.button} ${config.gap} font-medium transition-colors duration-200 rounded-md font-causten-medium ${
          viewMode === "list"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="List view"
      >
        <List className={config.icon} />
        {showLabels && "List"}
      </button>
      
      <button
        onClick={() => onViewModeChange("grid")}
        className={`relative z-10 flex items-center justify-center ${config.button} ${config.gap} font-medium transition-colors duration-200 rounded-md font-causten-medium ${
          viewMode === "grid"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Grid view"
      >
        <Grid3X3 className={config.icon} />
        {showLabels && "Grid"}
      </button>
    </div>
  );
};

export default ViewToggle;