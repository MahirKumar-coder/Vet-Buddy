"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
} & Omit<HTMLMotionProps<"div">, "children">;

export function GlassCard({
  children,
  className = "",
  hover = true,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? { y: -4, transition: { type: "spring", stiffness: 400, damping: 24 } }
          : undefined
      }
      className={`glass rounded-3xl p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
