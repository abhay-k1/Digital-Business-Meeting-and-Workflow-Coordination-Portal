import type { NextPage } from "next";
import { type CSSProperties } from "react";
import Image from "next/image";

export type PlusIconType = {
  className?: string;

  /** Variant props */
  property1?: string;
};

const PlusIcon: NextPage<PlusIconType> = ({
  className = "",
  property1 = "Plus",
}) => {
  return (
    <div className={`h-[58px] w-[58px] relative ${className}`}>
      <button className="cursor-pointer border-dark border-solid border-[0px] p-0 bg-grey absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] rounded-[50%] box-border" />
      <Image
        className="absolute h-[9.66%] w-[30.69%] top-[44.83%] right-[34.83%] bottom-[45.52%] left-[34.48%] max-w-full overflow-hidden max-h-full z-[1]"
        loading="lazy"
        width={17.8}
        height={5.6}
        sizes="100vw"
        alt=""
        src="/Icon-Spacer.svg"
      />
    </div>
  );
};

export default PlusIcon;
