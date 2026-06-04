import type { NextPage } from "next";

export type ButtonType = {
  className?: string;
  label?: string;
  property1?: string;
  onClick?: () => void;
};

const Button: NextPage<ButtonType> = ({
  className = "",
  property1 = "Button primary",
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer border-none py-3.5 px-6 bg-[#097C87] hover:bg-[#097C87]/95 text-white font-bold rounded-xl flex items-center justify-center transition duration-200 shadow-sm hover:shadow-md font-['Space_Grotesk'] ${className}`}
    >
      <span className="relative text-base font-bold text-white text-center">
        {label}
      </span>
    </button>
  );
};

export default Button;
