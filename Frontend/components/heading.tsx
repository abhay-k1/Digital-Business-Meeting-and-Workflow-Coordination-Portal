"use client";
import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";

export type HeadingType = {
  className?: string;
  label?: string;
  label1?: string;
  showLabel?: boolean;
  label2?: string;
  labelVisible?: boolean;

  /** Variant props */
  property1?: string;

  /** Style props */
  labelWidth?: CSSProperties["width"];
  labelHeight?: CSSProperties["height"];
  labelWidth1?: CSSProperties["width"];
  labelHeight1?: CSSProperties["height"];
};

const getHeadingStyle = (styleKey: string) => {
  switch (styleKey) {
    case "White":
      return "[&]:[border:unset] [&]:p-[unset] [&]:bg-[unset]";
  }
};
const getLabelContainerStyle = (styleKey: string) => {
  switch (styleKey) {
    case "White":
      return "[&]:bg-[#fff]";
  }
};
const getLabelTextStyle = (styleKey: string) => {
  switch (styleKey) {
    case "White":
      return "[&]:text-3xl [&]:m-0";
  }
};
const getLabelContainer1Style = (styleKey: string) => {
  switch (styleKey) {
    case "White":
      return "[&]:bg-[#fff] [&]:flex";
  }
};
const getLabelText1Style = (styleKey: string) => {
  switch (styleKey) {
    case "White":
      return "[&]:text-3xl [&]:m-0";
  }
};
const getLabelContainer2Style = (styleKey: string) => {
  switch (styleKey) {
    case "White":
      return "[&]:bg-[#fff]";
  }
};

const Heading: NextPage<HeadingType> = ({
  className = "",
  property1 = "Green",
  label,
  labelWidth,
  labelHeight,
  label1,
  showLabel,
  labelWidth1,
  labelHeight1,
  label2,
  labelVisible,
}) => {
  const variantKey = `${property1}`;

  const labelStyle: CSSProperties = useMemo(() => {
    return {
      width: labelWidth,
      height: labelHeight,
    };
  }, [labelWidth, labelHeight]);

  const label1Style: CSSProperties = useMemo(() => {
    return {
      width: labelWidth1,
      height: labelHeight1,
    };
  }, [labelWidth1, labelHeight1]);

  return (
    <button
      className={`cursor-pointer [border:none] p-0 bg-[transparent] flex flex-col items-start ${getHeadingStyle(variantKey)} ${className}`}
    >
      <div
        className={`rounded-[7px] bg-green flex flex-col items-start py-0 px-[7px] shrink-0 ${getLabelContainerStyle(variantKey)}`}
      >
        <div
          className={`relative text-[40px] font-medium font-['Space_Grotesk'] text-grays-black text-left ${getLabelTextStyle(variantKey)}`}
        >
          {label}
        </div>
      </div>
      <div
        className={`rounded-[7px] bg-green hidden flex-col items-start py-0 px-[7px] shrink-0 ${getLabelContainer1Style(variantKey)}`}
        style={labelStyle}
      >
        {!!showLabel && (
          <div
            className={`relative text-[40px] font-medium font-['Space_Grotesk'] text-grays-black text-left ${getLabelText1Style(variantKey)}`}
          >
            {label1}
          </div>
        )}
      </div>
      <div
        className={`rounded-[7px] bg-green hidden flex-col items-start py-0 px-[7px] shrink-0 ${getLabelContainer2Style(variantKey)}`}
        style={label1Style}
      >
        {!!labelVisible && (
          <div className="relative text-[40px] font-medium font-['Space_Grotesk'] text-grays-black text-left">
            {label2}
          </div>
        )}
      </div>
    </button>
  );
};

export default Heading;
