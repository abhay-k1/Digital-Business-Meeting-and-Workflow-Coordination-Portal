"use client";
import type { NextPage } from "next";
import { useCallback } from "react";
import FrameComponent from "../components/frame-component";
import Heading from "../components/heading";
import ServicesBlock from "../components/services-block";
import FrameComponent1 from "../components/frame-component1";
import FrameComponent2 from "../components/frame-component2";
import FrameComponent3 from "../components/frame-component3";
import { getSession } from "./lib/auth";

const Homepage: NextPage = () => {
  const onGetStartedTextClick = useCallback(() => {
    const session = getSession();
    if (session) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="w-full h-[5673px] relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left text-lg text-grays-black font-['Space_Grotesk'] mq1125:h-auto mq450:gap-5 mq800:gap-10">
      <FrameComponent />
      <section className="w-[886px] h-[478px] flex items-start pt-0 px-14 pb-[8.5px] box-border max-w-full shrink-0 text-left text-[56.6px] text-grays-black font-[Inter] mq1125:pl-7 mq1125:pr-7 mq1125:box-border">
        <div className="self-stretch flex-1 flex items-start max-w-full">
          <div className="flex flex-col items-start gap-[1.4px]">
            <div
              className="w-[707.1px] h-[172.2px] relative inline-block mq450:text-[34px] mq800:text-[45px]"
              data-scroll-to="smarterMeetingsSmoother"
            >
              Smarter Meetings. Smoother Workflows.
            </div>
            <div className="w-[655.9px] h-[179.3px] relative text-[23.8px] font-['DM_Sans'] inline-block mq450:text-[19px]">
              {" "}
              A unified platform for modern teams to schedule meetings, manage
              tasks, and coordinate work — powered by AI to keep everyone
              aligned and every deadline on track.
            </div>
            <button
              className="cursor-pointer border-none bg-green text-white rounded-[14px] px-10 py-5 font-bold text-xl hover:bg-blue-700 transition duration-200 shadow-[0px_3px_0px_#0f172a] flex items-center justify-center font-['Space_Grotesk']"
              onClick={onGetStartedTextClick}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
      <div className="ml-[-28px] w-[1440px] flex items-start py-0 px-[100px] box-border gap-10 max-w-full z-[1] shrink-0 mq1125:flex-wrap mq1125:pl-[50px] mq1125:pr-[50px] mq1125:box-border mq800:gap-5 mq800:pl-[25px] mq800:pr-[25px] mq800:box-border">
        <Heading
          property1="Green"
          label="Services"
          label1="Label"
          showLabel
          label2="Label"
          labelVisible
        />
        <div className="w-[580px] relative inline-block shrink-0 max-w-full">
          At our digital marketing agency, we offer a range of services to help
          businesses grow and succeed online. These services include:
        </div>
      </div>
      <ServicesBlock />
      <FrameComponent1 />
      <FrameComponent2 />
      <FrameComponent3 />
    </div>
  );
};

export default Homepage;
