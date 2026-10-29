import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { StarRating } from './StarRating';
import { Heart } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist, isAuthenticated, addToast, language } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const isWishlisted = isInWishlist(product.id);

  const hasDiscount = !!product.discountPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast(t.wishlist.loginRequired, 'info');
      // Return to current page after login
      navigate('/login', { state: { from: location } });
      return;
    }

    toggleWishlist(product.id);
  };

  // Helper to strip existing params from constant URLs to apply our own responsive ones
  const getBaseUrl = (url: string) => url.split('?')[0];
  const baseImg = getBaseUrl(product.image);
  const baseHoverImg = getBaseUrl(product.hoverImage);

  return (
    <Link to={`/product/${product.slug || product.id}`} className="group block h-full flex flex-col relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 rounded-sm mb-4">
        {/* Base Image with responsive optimization */}
        <img
          src={`${baseImg}?q=80&w=800&auto=format&fit=crop`}
          srcSet={`
            ${baseImg}?q=80&w=400&auto=format&fit=crop 400w,
            ${baseImg}?q=80&w=800&auto=format&fit=crop 800w
          `}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={product.name}
          width="800"
          height="1000" // Enforce aspect ratio 4:5
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-10"
        />

        {/* Hover Image - Now using an actual IMG tag for accessibility and SEO */}
        <img
          src={`${baseHoverImg}?q=80&w=800&auto=format&fit=crop`}
          srcSet={`
            ${baseHoverImg}?q=80&w=400&auto=format&fit=crop 400w,
            ${baseHoverImg}?q=80&w=800&auto=format&fit=crop 800w
          `}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={`${product.name} alternate view`}
          width="800"
          height="1000"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out z-20 group-hover:scale-105"
        />

        {/* Dynamic Light Glow Overlay */}
        <div className="absolute inset-0 bg-yellow-100/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl z-30 pointer-events-none" />

        {/* Wishlist Button - Always Visible */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-white/60 backdrop-blur-md hover:bg-white text-softBlack transition-all duration-300 shadow-sm"
          title={isWishlisted ? t.product.wishlistRemove : t.product.wishlistAdd}
          aria-label={isWishlisted ? t.product.wishlistRemove : t.product.wishlistAdd}
        >
          <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-softBlack'} />
        </button>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-40">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-softBlack w-fit">
            {product.type}
          </span>
          {hasDiscount && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-softBlack/90 backdrop-blur-md px-3 py-1 rounded-full text-white w-fit">
              -{discountPercentage}%
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-start px-1 flex-1">
        <div className="flex-1 pr-4">
          <h3 className="font-serif text-xl text-softBlack group-hover:text-softBlack/70 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-softBlack/50 mt-1 line-clamp-1">{product.tagline}</p>

          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={product.rating} size={12} />
            <span className="text-[10px] text-softBlack/40 font-medium tracking-wide">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {hasDiscount ? (
            <div className="flex flex-col items-end">
              <span className="font-sans text-xs line-through text-softBlack/40">${product.price}</span>
              <span className="font-sans text-sm font-medium text-red-800/80">${product.discountPrice}</span>
            </div>
          ) : (
            <span className="font-sans text-sm font-medium text-softBlack">${product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
};