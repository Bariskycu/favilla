import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number; // 0 to 5
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 14, 
  interactive = false, 
  onRate,
  className = ""
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = displayRating >= star;
        const isHalf = !isFull && displayRating >= star - 0.5;
        
        return (
          <motion.button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            whileTap={interactive ? { scale: 0.8 } : {}}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} relative`}
          >
            {/* Background Empty Star */}
            <Star 
              size={size} 
              className="text-neutral-200 fill-neutral-200" 
              strokeWidth={0}
            />
            
            {/* Foreground Full Star */}
            {isFull && (
              <div className="absolute inset-0">
                 <Star 
                    size={size} 
                    className="text-softBlack fill-softBlack" 
                    strokeWidth={0}
                />
              </div>
            )}

            {/* Foreground Half Star */}
            {isHalf && (
               <div className="absolute inset-0">
                  <StarHalf 
                    size={size} 
                    className="text-softBlack fill-softBlack" 
                    strokeWidth={0}
                  />
               </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};