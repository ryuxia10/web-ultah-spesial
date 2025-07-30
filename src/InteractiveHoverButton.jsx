import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const InteractiveHoverButton = React.forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
          // Tampilan Normal: Latar Putih, Border Pink
          "bg-white border-[#FF69B4]",
          // Tampilan Hover: Teks menjadi Putih
          "hover:text-white",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {/* Titik kecil ini akan berwarna pink dan membesar saat hover */}
          <div className="h-2 w-2 rounded-full bg-[#FF69B4] transition-all duration-300 group-hover:scale-[120]"></div>
          {/* Teks Normal: berwarna pink, menghilang saat hover */}
          <span className="inline-block text-[#FF69B4] transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {children}
          </span>
        </div>
        <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
          {/* Teks & Panah Hover: berwarna putih (ikut dari parent) */}
          <span>{children}</span>
          <ArrowRight />
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";