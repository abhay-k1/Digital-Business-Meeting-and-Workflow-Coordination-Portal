import type { NextPage } from "next";
import { type CSSProperties } from "react";

export type ButtonType = {
  className?: string;
  label?: string;

  /** Variant props */
  property1?: string;
};

const getButtonStyle = (styleKey: string) => {
  switch (styleKey) {
    case "Button tertiary":
      return "[&]:bg-green";
  }
};
const getLabelText28Style = (styleKey: string) => {
  switch (styleKey) {
    case "Button tertiary":
      return "[&]:text-grays-black";
  }
};

const Button: NextPage<ButtonType> = ({
  className = "",
  property1 = "Button primary",
  label,
}) => {
  const variantKey = `${property1}`;

  return (
    <button
      className={`cursor-pointer [border:none] py-5 px-[35px] bg-dark rounded-[14px] flex items-start ${getButtonStyle(variantKey)} ${className}`}
    >
      <div
        className={`relative text-xl leading-7 font-['Space_Grotesk'] text-[#fff] text-center ${getLabelText28Style(variantKey)}`}
      >
        {label}
      </div>
    </button>
  );
};

export default Button;
