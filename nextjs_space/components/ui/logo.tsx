"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { img: 28, text: "text-lg" },
  md: { img: 36, text: "text-xl" },
  lg: { img: 48, text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, href = "/", className }: LogoProps) {
  const { img, text } = sizeMap[size];
  
  const content = (
    <div className={cn("flex items-center gap-2 transition-transform hover:scale-[1.02]", className)}>
      <div className="relative flex-shrink-0">
        <Image
          src="/logo.png"
          alt="RecruitAI"
          width={img}
          height={img}
          className="rounded-lg"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-stone-800", text)}>
          Recruit<span className="text-amber-600">AI</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
