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
      className={`cursor-pointer border-none py-3 px-6 bg-dark hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center transition duration-200 shadow-sm ${getButtonStyle(variantKey)} ${className}`}
    >
      <span
        className={`relative text-base font-semibold font-['Space_Grotesk'] text-[#fff] text-center ${getLabelText28Style(variantKey)}`}
      >
        {label}
      </span>
    </button>
  );
};

export default Button;
