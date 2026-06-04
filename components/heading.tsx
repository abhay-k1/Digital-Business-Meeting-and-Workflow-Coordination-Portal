"use client";
import type { NextPage } from "next";

export type HeadingType = {
  className?: string;
  label?: string;
  label1?: string;
  showLabel?: boolean;
  label2?: string;
  labelVisible?: boolean;
};

const Heading: NextPage<HeadingType> = ({
  className = "",
  label,
  label1,
  showLabel,
  label2,
  labelVisible,
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 font-['Space_Grotesk'] ${className}`}>
      {label && (
        <span className="bg-slate-100 border border-solid border-slate-200/60 text-[#475569] text-base font-semibold rounded-full px-4 py-1.5 shadow-sm">
          {label.trim()}
        </span>
      )}
      {showLabel && label1 && (
        <span className="text-3xl font-extrabold text-[#0f172a]">
          {label1.trim()}
        </span>
      )}
      {labelVisible && label2 && (
        <span className="text-3xl font-bold text-slate-500">
          {label2.trim()}
        </span>
      )}
    </div>
  );
};

export default Heading;
