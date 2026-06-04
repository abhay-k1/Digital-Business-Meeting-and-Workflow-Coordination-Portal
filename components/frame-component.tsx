"use client";
import type { NextPage } from "next";
import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { getSession, clearSession } from "../app/lib/auth";

export type FrameComponentType = {
  className?: string;
};

const FrameComponent: NextPage<FrameComponentType> = ({ className = "" }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getSession());
  }, []);

  const onHomeTextClick = useCallback(() => {
    const anchor = document.querySelector(
      "[data-scroll-to='smarterMeetingsSmoother']",
    );
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  }, []);

  const onFeaturesTextClick = useCallback(() => {
    const anchor = document.querySelector(
      "[data-scroll-to='headingContainer']",
    );
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onAboutUsTextClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='footerContainer']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  return (
    <section
      className={`self-stretch flex items-start pt-0 px-0 pb-[66px] box-border max-w-full shrink-0 ${className}`}
    >
      <header className="flex-1 bg-white/80 backdrop-blur-md border-b border-solid border-slate-200/50 flex items-center justify-between py-4 pl-6 pr-8 gap-5 top-[0] z-[99] sticky max-w-full">
        <Image
          className="w-[380px] h-[102px] relative object-cover cursor-pointer"
          loading="lazy"
          width={380}
          height={102}
          sizes="100vw"
          alt=""
          src="/image-1@2x.png"
          onClick={() => window.location.href = "/"}
        />
        <nav className="m-0 h-[45px] overflow-hidden shrink-0 flex items-center justify-center py-3 px-[15px] box-border gap-[35px] text-left text-[20px] text-grays-black font-['Inria_Serif'] mq1125:hidden mq800:gap-[20px]">
          <h3
            className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#475569] transition duration-150"
            onClick={onHomeTextClick}
          >
            Home
          </h3>
          {isLoggedIn ? (
            <>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#475569] transition duration-150"
                onClick={() => window.location.href = "/dashboard"}
              >
                Dashboard
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#475569] transition duration-150"
                onClick={() => window.location.href = "/meetings"}
              >
                Meetings
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#475569] transition duration-150"
                onClick={() => window.location.href = "/tasks"}
              >
                Tasks
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-bold font-[inherit] inline-block cursor-pointer text-[#ff5555] hover:text-[#ff2222] transition duration-150"
                onClick={() => {
                  clearSession();
                  window.location.href = "/";
                }}
              >
                Logout
              </h3>
            </>
          ) : (
            <>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#475569] transition duration-150"
                onClick={onFeaturesTextClick}
              >
                Features
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#475569] transition duration-150"
                onClick={onAboutUsTextClick}
              >
                About Us
              </h3>
              <h3
                className="m-0 relative text-base font-bold font-['Space_Grotesk'] inline-block cursor-pointer text-white hover:text-white bg-dark hover:bg-slate-800 px-5 py-2.5 rounded-xl border-none shadow-sm transition duration-200"
                onClick={() => window.location.href = "/login"}
              >
                Login
              </h3>
            </>
          )}
        </nav>
      </header>
    </section>
  );
};

export default FrameComponent;
