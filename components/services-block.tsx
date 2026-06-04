"use client";
import type { NextPage } from "next";
import { useCallback } from "react";
import Image from "next/image";
import Button from "./button";
import Card from "./card";

import { getSession } from "../app/lib/auth";

export type ServicesBlockType = {
  className?: string;
};

const ServicesBlock: NextPage<ServicesBlockType> = ({ className = "" }) => {
  const onCardContainerClick = useCallback(() => {
    const session = getSession();
    window.location.href = session ? "/meetings" : "/login";
  }, []);

  const onCardContainerClick1 = useCallback(() => {
    const session = getSession();
    window.location.href = session ? "/tasks" : "/login";
  }, []);

  const onCardContainerClick2 = useCallback(() => {
    // Please sync "Team Collaboration" to the project
  }, []);

  const onCardContainerClick3 = useCallback(() => {
    const session = getSession();
    window.location.href = session ? "/dashboard" : "/login";
  }, []);

  return (
    <section
      className={`ml-[-28px] mb-[93px] w-[1440px] flex flex-col items-start relative gap-10 max-w-full z-[1] shrink-0 mq800:gap-5 ${className}`}
    >
      <div className="w-[1440px] flex items-start max-w-full shrink-0">
        <div className="w-[1440px] flex items-center py-0 px-[100px] box-border max-w-full mq800:pl-[25px] mq800:pr-[25px] mq800:box-border mq1350:pl-[50px] mq1350:pr-[50px] mq1350:box-border">
          <section className="h-[347px] w-[1240px] rounded-[45px] bg-grey flex items-center py-0 px-[60px] box-border text-left text-3xl text-grays-black font-['Space_Grotesk'] mq450:gap-[69px] mq800:gap-[137px] mq800:pl-[30px] mq800:pr-[30px] mq800:box-border">
            <div className="flex flex-col items-start py-5 px-0 gap-[26px]">
              <h2 className="m-0 w-[500px] relative text-[length:inherit] font-medium font-[inherit] inline-block mq450:text-lg mq800:text-2xl">
                Let’s make things happen
              </h2>
              <div className="w-[500px] h-[115px] relative text-xl inline-block mq450:text-base">
                Ready to streamline your business operations? Bring your team
                together, automate your meeting workflows, and eliminate
                coordination bottlenecks starting today.
              </div>
              <Button
                property1="Button primary"
                label="Book your meeting schedule"
              />
            </div>
          </section>
          <div className="h-[394px] w-[494px] relative z-[1] ml-[-715px]">
            <Image
              className="absolute top-[0px] left-[0px] w-full h-[394.3px] object-contain"
              width={359}
              height={394.3}
              sizes="100vw"
              alt=""
              src="/Illustration3.svg"
            />
          </div>
        </div>
      </div>
      <section className="flex items-start py-0 px-[100px] box-border gap-10 max-w-full z-[1] shrink-0 mq450:pl-5 mq450:pr-5 mq450:box-border mq800:gap-5 mq800:pl-[50px] mq800:pr-[50px] mq800:box-border mq1350:flex-wrap">
        <Card
          onCardContainerClick={onCardContainerClick}
          illustration="/Illustration4@2x.png"
          property1="Green"
          label="Meeting "
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="Black"
          icon="/Icon.svg"
        />
        <Card
          onCardContainerClick={onCardContainerClick1}
          cardBackgroundColor="#eff6ff"
          cardPadding="48px 50px"
          cardGap="20px"
          headingAndLinkJustifyContent="unset"
          illustration="/Illustration1@2x.png"
          illustrationIconHeight="147.6px"
          property1="White"
          label="Task "
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="Black"
          icon="/Icon.svg"
        />
      </section>
      <section className="flex items-start py-0 px-[100px] box-border gap-10 max-w-full z-[2] shrink-0 mq450:pl-5 mq450:pr-5 mq450:box-border mq800:gap-5 mq800:pl-[50px] mq800:pr-[50px] mq800:box-border mq1350:flex-wrap">
        <Card
          onCardContainerClick={onCardContainerClick2}
          cardBackgroundColor="#f8fafc"
          cardPadding="48px 50px"
          cardGap="20px"
          headingAndLinkJustifyContent="unset"
          illustration="/Illustration2@2x.png"
          illustrationIconHeight="210px"
          property1="White"
          label="Team"
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="White 2"
          icon="/Icon1.svg"
        />
        <Card
          onCardContainerClick={onCardContainerClick3}
          cardBackgroundColor="#f8fafc"
          cardPadding="48px 49px"
          cardGap="11px"
          headingAndLinkJustifyContent="center"
          illustration="/Illustration5@2x.png"
          illustrationIconHeight="195.9px"
          property1="Green"
          label={`Dashboard & `}
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="Black"
          icon="/Icon.svg"
        />
      </section>
    </section>
  );
};

export default ServicesBlock;
