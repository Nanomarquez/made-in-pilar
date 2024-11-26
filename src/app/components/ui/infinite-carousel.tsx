"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";
interface VerticalInfiniteCarouselProps {
  images: StaticImageData[];
  speed?: number;
  className?: string;
}

export default function VerticalInfiniteCarousel({
  images,
  speed = 5000, // Default speed of 5 seconds per image
  className,
}: Readonly<VerticalInfiniteCarouselProps>) {
  const [duplicatedImages, setDuplicatedImages] = useState<StaticImageData[]>(
    []
  );

  useEffect(() => {
    // Duplicate the images to create a seamless loop
    setDuplicatedImages([...images, ...images]);
  }, [images]);

  const containerHeight = images.length * 100; // 100vh per image

  return (
    <div className={cn("relative w-full h-screen", className)}>
      <div
        className="absolute w-full animate-vertical-scroll flex flex-col gap-6 h-full"
        style={{
          height: `${containerHeight}vh`,
          animationDuration: `${images.length * speed}ms`,
        }}
      >
        {duplicatedImages.map((src, index) => (
          <Image
            key={`${index}-${src.src}`}
            className="w-full h-screen object-cover rounded-lg hover:scale-105 duration-200 hover:z-50 hover:brightness-125"
            src={src}
            height={500}
            width={500}
            alt="Carousel Image"
          />
        ))}
      </div>

      <style>{`
        @keyframes verticalScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .animate-vertical-scroll {
          animation: verticalScroll ${images.length * speed}ms alternate-reverse infinite;
        }
      `}</style>
    </div>
  );
}
