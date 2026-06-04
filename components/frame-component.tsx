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
      <header className="flex-1 bg-[#fff] flex items-center justify-between py-2.5 pl-2.5 pr-[25px] box-border gap-5 top-[0] z-[99] sticky max-w-full">
        <Image
          className="w-[457px] relative max-h-full object-cover cursor-pointer"
          loading="lazy"
          width={457}
          height={123}
          sizes="100vw"
          alt=""
          src="/image-1@2x.png"
          onClick={() => window.location.href = "/"}
        />
        <nav className="m-0 h-[45px] overflow-hidden shrink-0 flex items-center justify-center py-3 px-[15px] box-border gap-[35px] text-left text-[20.2px] text-grays-black font-['Inria_Serif'] mq1125:hidden mq800:gap-[20px]">
          <h3
            className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#2563eb]"
            onClick={onHomeTextClick}
          >
            Home
          </h3>
          {isLoggedIn ? (
            <>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#2563eb]"
                onClick={() => window.location.href = "/dashboard"}
              >
                Dashboard
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#2563eb]"
                onClick={() => window.location.href = "/meetings"}
              >
                Meetings
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#2563eb]"
                onClick={() => window.location.href = "/tasks"}
              >
                Tasks
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-bold font-[inherit] inline-block cursor-pointer text-[#ff5555] hover:text-[#ff2222]"
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
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#2563eb]"
                onClick={onFeaturesTextClick}
              >
                Features
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-normal font-[inherit] inline-block cursor-pointer hover:text-[#2563eb]"
                onClick={onAboutUsTextClick}
              >
                About Us
              </h3>
              <h3
                className="m-0 relative text-[length:inherit] font-bold font-[inherit] inline-block cursor-pointer text-white hover:text-white bg-[#2563eb] px-5 py-1.5 rounded-[10px] border border-solid border-dark shadow-[0px_2.5px_0px_#0f172a]"
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
