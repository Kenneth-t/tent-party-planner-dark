
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

// Placeholder images for tent gallery
const tentImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1624135600050-5d1cd86f2772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Party tent exterior view',
    caption: 'Standard Party Tent'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1571579639195-5dbf1ad851ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Party tent with lighting setup',
    caption: 'Party Tent with Lights'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1628153792464-21bffac488d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Party tent interior with disco setup',
    caption: 'Full Option Setup'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Party tent night view',
    caption: 'Night Event Setup'
  }
];

interface TentGalleryProps {
  tentType: 'basic' | 'full';
  className?: string;
}

const TentGallery: React.FC<TentGalleryProps> = ({ tentType, className }) => {
  const [activeImage, setActiveImage] = useState(tentImages[0]);

  // Display different sets of images based on tent type
  const displayImages = tentType === 'basic' 
    ? tentImages.slice(0, 2) 
    : tentImages;

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Main image display */}
      <div className="relative overflow-hidden rounded-lg h-96">
        <img 
          src={activeImage.src} 
          alt={activeImage.alt} 
          className="object-cover w-full h-full transition-all duration-500"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{activeImage.caption}</p>
        </div>
      </div>
      
      {/* Thumbnail gallery */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {displayImages.map((image) => (
          <button
            key={image.id}
            onClick={() => setActiveImage(image)}
            className={cn(
              "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border-2",
              activeImage.id === image.id 
                ? "border-party glow-border"
                : "border-gray-700"
            )}
          >
            <img 
              src={image.src} 
              alt={image.alt} 
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TentGallery;
