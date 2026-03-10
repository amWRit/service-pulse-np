"use client";

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ rating, interactive = false, onRate, size = "md" }: StarRatingProps) {
  const sizePx = { sm: 18, md: 24, lg: 36 }[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`transition-transform flex-shrink-0 ${interactive ? "cursor-pointer hover:scale-125 active:scale-110" : "cursor-default"}`}
          style={{ width: sizePx, height: sizePx }}
        >
          <svg
            viewBox="0 0 24 24"
            width={sizePx}
            height={sizePx}
            fill={star <= rating ? "#f59e0b" : "none"}
            stroke={star <= rating ? "#f59e0b" : "#d1d5db"}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}
