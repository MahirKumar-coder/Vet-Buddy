"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

type ImageWithSkeletonProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ImageWithSkeleton({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${fill ? "h-full w-full" : ""}`}>
      {!loaded && (
        <div
          className="skeleton absolute inset-0 z-10 rounded-[inherit]"
          aria-hidden
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className={fill ? "h-full w-full" : ""}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={className}
            sizes={sizes}
            priority={priority}
            onLoadingComplete={() => setLoaded(true)}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            sizes={sizes}
            priority={priority}
            onLoadingComplete={() => setLoaded(true)}
          />
        )}
      </motion.div>
    </div>
  );
}
