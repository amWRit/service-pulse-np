"use client";

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ rating, interactive = false, onRate, size = "md" }: StarRatingProps) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`${sizeClass} w-6 text-center transition-transform ${interactive ? "cursor-pointer hover:scale-125 active:scale-110" : "cursor-default"}`}
        >
          {star <= rating ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}
