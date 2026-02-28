"use client";

export function FlowArrow({
  className = "",
  direction = "right",
}: {
  className?: string;
  direction?: "right" | "down";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center text-amber-500/50 ${className} ${
        direction === "down" ? "[&>svg]:rotate-90" : ""
      }`}
      aria-hidden
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 sm:h-6 sm:w-6"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}
