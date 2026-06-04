"use client";
import type { NextPage } from "next";
import { useMemo, type CSSProperties, useCallback } from "react";
import Image from "next/image";
import Heading from "./heading";
import Link from "./link";

export type CardType = {
  className?: string;
  illustration: string;
  property1?: string;
  label?: string;
  showLabel?: boolean;
  labelVisible?: boolean;
  labelWidth?: CSSProperties["width"];
  labelHeight?: CSSProperties["height"];
  property11?: string;
  icon: string;

  /** Style props */
  cardBackgroundColor?: CSSProperties["backgroundColor"];
  cardPadding?: CSSProperties["padding"];
  cardGap?: CSSProperties["gap"];
  headingAndLinkJustifyContent?: CSSProperties["justifyContent"];
  illustrationIconHeight?: CSSProperties["height"];

  /** Action props */
  onCardContainerClick?: () => void;
};

const Card: NextPage<CardType> = ({
  className = "",
  onCardContainerClick,
  cardBackgroundColor,
  cardPadding,
  cardGap,
  headingAndLinkJustifyContent,
  illustration,
  illustrationIconHeight,
  property1 = "Green",
  label,
  showLabel,
  labelVisible,
  labelWidth,
  labelHeight,
  property11 = "Black",
  icon,
}) => {
  const cardStyle: CSSProperties = useMemo(() => {
    return {
      backgroundColor: cardBackgroundColor,
      padding: cardPadding,
      gap: cardGap,
    };
  }, [cardBackgroundColor, cardPadding, cardGap]);

  const headingAndLinkStyle: CSSProperties = useMemo(() => {
    return {
      justifyContent: headingAndLinkJustifyContent,
    };
  }, [headingAndLinkJustifyContent]);

  const illustrationIconStyle: CSSProperties = useMemo(() => {
    return {
      height: illustrationIconHeight,
    };
  }, [illustrationIconHeight]);

  const onCardContainerClick1 = useCallback(() => {
    // Please sync "Meeting Scheduling" to the project
  }, []);

  return (
    <div
      className={`w-[600px] shadow-[0_8px_30px_rgb(15,23,42,0.03)] border-slate-100 border-solid border rounded-[24px] bg-grey box-border overflow-hidden shrink-0 flex items-center justify-between py-12 px-[50px] gap-5 max-w-full cursor-pointer hover:shadow-[0_8px_30px_rgba(71,85,105,0.08)] hover:-translate-y-0.5 transition-all duration-300 mq800:gap-5 mq800:pl-[25px] mq800:pr-[25px] mq800:box-border ${className}`}
      onClick={onCardContainerClick}
      style={cardStyle}
    >
      <div
        className="flex flex-col items-start justify-center gap-[93px]"
        style={headingAndLinkStyle}
      >
        <Heading
          label={label}
          label1="Scheduling"
          showLabel={showLabel}
          label2="(SEO)"
          labelVisible={labelVisible}
        />
        <Link property1={property11} icon={icon} />
      </div>
      <Image
        className="h-[170px] w-[210px] relative object-cover"
        width={210}
        height={170}
        sizes="100vw"
        alt=""
        src={illustration}
        style={illustrationIconStyle}
      />
    </div>
  );
};

export default Card;
