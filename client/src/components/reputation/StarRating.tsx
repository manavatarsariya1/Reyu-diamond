import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
    rating: number; // 0-5
    maxRating?: number;
    interactive?: boolean;
    hideEmpty?: boolean; // If true, only show filled stars (for compact views) - though usually we show gray stars
    size?: "sm" | "md" | "lg";
    onChange?: (rating: number) => void;
    className?: string;
}

export function StarRating({
    rating,
    maxRating = 5,
    interactive = false,
    size = "md",
    onChange,
    className
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-5 h-5",
        lg: "w-8 h-8"
    };

    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const starValue = index + 1;
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange?.(starValue)}
                        onMouseEnter={() => interactive && setHoverRating(starValue)}
                        onMouseLeave={() => interactive && setHoverRating(null)}
                        className={cn(
                            "transition-all duration-200 focus:outline-none",
                            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled
                                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                    : "fill-gray-100 text-gray-200"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
