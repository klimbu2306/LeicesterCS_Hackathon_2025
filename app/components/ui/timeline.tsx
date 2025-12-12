import { ReactNode, Children, isValidElement, cloneElement } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TimelineItemProps {
    children: ReactNode;
    isActive?: boolean;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
    position?: "left" | "right";
    className?: string;
}

export function TimelineItem({ children, isActive = false, position = "left", className, difficulty }: TimelineItemProps) {
    const childrenWithProps = Children.map(children, (child) => {
        if (isValidElement(child) && child.type === TimelineHeader) {
            return cloneElement(child, { position } as any);
        }
        return child;
    });

    return (
        <div
            className={cn(
                "relative pb-10 last:pb-0",
                // Force 50% split regardless of screen size
                position === "left" ? "pr-[calc(50%+1.5rem)]" : "pl-[calc(50%+1.5rem)]",
                className
            )}
        >
            {/* Timeline connector line - Always centered */}
            <div
                className={cn(
                    "absolute top-1 bottom-0 w-px left-1/2 -translate-x-1/2 bg-gray-200 dark:bg-neutral-800",
                    difficulty === "Beginner" ? "bg-green-500" : difficulty === "Intermediate" ? "bg-yellow-500" : difficulty === "Advanced" ? "bg-red-500" : "bg-gray-200 dark:bg-neutral-800"
                )}
            />

            {/* Timeline dot/icon - Always centered */}
            <div
                className={cn(
                    "absolute top-1 left-1/2 -translate-x-1/2 size-3 rounded-full border-2 border-background",
                    difficulty === "Beginner" ? "bg-green-500" : difficulty === "Intermediate" ? "bg-yellow-500" : difficulty === "Advanced" ? "bg-red-500" : "bg-gray-400"
                )}
            />

            {/* Content container - Align text based on position */}
            <div className={cn("space-y-2", position === "left" ? "text-right" : "text-left")}>{childrenWithProps}</div>
        </div>
    );
}

interface TimelineNameProps {
    children: ReactNode;
    className?: string;
}

export function TimelineName({ children, className }: TimelineNameProps) {
    return <h3 className={cn("font-bold leading-none text-gray-900 dark:text-gray-100", className)}>{children}</h3>;
}

interface TimelineTimeProps {
    children: ReactNode;
    className?: string;
}

export function TimelineTime({ children, className }: TimelineTimeProps) {
    return <time className={cn("text-xs font-semibold uppercase text-muted-foreground text-gray-500", className)}>{children}</time>;
}

interface TimelineContentProps {
    children: ReactNode;
    className?: string;
}

export function TimelineContent({ children, className }: TimelineContentProps) {
    return <div className={cn("text-sm text-gray-600 dark:text-gray-400", className)}>{children}</div>;
}

interface TimelineHeaderProps {
    children: ReactNode;
    position?: "left" | "right";
    className?: string;
}

export function TimelineHeader({ children, position = "left", className }: TimelineHeaderProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-2",
                // Always align direction based on position, no mobile breakpoint
                position === "left" ? "flex-row-reverse justify-start" : "flex-row justify-start",
                className
            )}
        >
            {children}
        </div>
    );
}

interface TimelineProps {
    children: ReactNode;
    className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
    const childrenWithProps = Children.map(children, (child, index) => {
        if (isValidElement(child) && child.type === TimelineItem) {
            const position = (child as React.ReactElement<{ position?: string }>).props.position || (index % 2 === 0 ? "left" : "right");
            return cloneElement(child, { position } as any);
        }
        return child;
    });

    return <div className={cn("relative", className)}>{childrenWithProps}</div>;
}
