"use client";
import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import PlusIcon from "./plus-icon";

export type Card1Type = {
  className?: string;
  labelSpacer?: string;
  scheduleMeetings?: string;
  createAndOrganizeMeetingsWith?: string;
  property1?: string;

  /** Style props */
  cardBackgroundColor?: CSSProperties["backgroundColor"];
  cardPadding?: CSSProperties["padding"];
  createAndOrganizeWidth?: CSSProperties["width"];
};

const Card1: NextPage<Card1Type> = ({
  className = "",
  cardBackgroundColor,
  cardPadding,
  labelSpacer,
  scheduleMeetings,
  createAndOrganizeMeetingsWith,
  createAndOrganizeWidth,
  property1,
}) => {
  const card1Style: CSSProperties = useMemo(() => {
    return {
      backgroundColor: cardBackgroundColor,
      padding: cardPadding,
    };
  }, [cardBackgroundColor, cardPadding]);

  const createAndOrganizeStyle: CSSProperties = useMemo(() => {
    return {
      width: createAndOrganizeWidth,
    };
  }, [createAndOrganizeWidth]);

  return (
    <section
      className={`self-stretch flex-1 shadow-[0_8px_30px_rgb(15,23,42,0.02)] border-slate-200/60 border-solid border rounded-[24px] box-border overflow-hidden flex flex-col items-start pt-[39px] pb-[33px] pl-[60px] pr-[53px] gap-[30px] max-w-full text-left text-6xl text-slate-800 font-['Space_Grotesk'] hover:shadow-[0_8px_30px_rgba(71,85,105,0.06)] hover:-translate-y-0.5 transition-all duration-300 mq800:gap-[15px] mq1350:pl-[30px] mq1350:pr-[26px] mq1350:box-border ${className}`}
      style={card1Style}
    >
      <div className="w-full overflow-hidden flex items-center justify-between gap-5 max-w-full">
        <div className="flex items-center gap-[25px] max-w-full mq800:flex-wrap">
          <h1 className="m-0 relative text-[length:inherit] font-extrabold text-[#475569] mq450:text-4xl mq800:text-5xl">
            {labelSpacer}
          </h1>
          <h2 className="m-0 w-[612px] relative text-2xl font-bold text-slate-800 inline-block shrink-0 max-w-full mq450:text-lg mq800:text-2xl">
            {scheduleMeetings}
          </h2>
        </div>
        <PlusIcon property1={property1} />
      </div>
      <div className="w-full h-px relative border-slate-200/40 border-solid border-t-[1px] box-border" />
      <div
        className="w-full relative text-lg text-slate-600 font-['DM_Sans'] leading-7 max-w-full"
        style={createAndOrganizeStyle}
      >
        {createAndOrganizeMeetingsWith}
      </div>
    </section>
  );
};

export default Card1;
