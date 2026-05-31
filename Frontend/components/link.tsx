import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";

export type LinkType = {
  className?: string;
  icon: string;

  /** Variant props */
  property1?: string;
};

const getLabelText24Style = (styleKey: string) => {
  switch (styleKey) {
    case "White 2":
      return "[&]:text-[#fff]";
  }
};

const Link: NextPage<LinkType> = ({
  className = "",
  property1 = "White",
  icon,
}) => {
  const variantKey = `${property1}`;

  return (
    <button
      className={`cursor-pointer [border:none] p-0 bg-[transparent] flex items-center gap-[15px] ${className}`}
    >
      <Image
        className="h-[41px] w-[41px] relative"
        loading="lazy"
        width={41}
        height={41}
        sizes="100vw"
        alt=""
        src={icon}
      />
      <h3
        className={`m-0 relative text-xl leading-7 font-normal font-['Space_Grotesk'] text-grays-black text-left ${getLabelText24Style(variantKey)}`}
      >
        Learn more
      </h3>
    </button>
  );
};

export default Link;
