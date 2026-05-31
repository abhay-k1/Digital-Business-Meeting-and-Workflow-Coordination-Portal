"use client";
import type { NextPage } from "next";
import { useState } from "react";
import Heading from "./heading";
import Card1 from "./card1";

export type FrameComponent2Type = {
  className?: string;
};

const FrameComponent2: NextPage<FrameComponent2Type> = ({ className = "" }) => {
  const [card1Items] = useState([
    {
      cardBackgroundColor: "#b9ff66" as const,
      cardPadding: "39px 53px 33px 60px" as const,
      labelSpacer: "01",
      scheduleMeetings: "Schedule Meetings",
      createAndOrganizeMeetingsWith:
        "Create and organize meetings with team members, set agendas, choose time slots, and manage schedules efficiently from one centralized platform.",
      createAndOrganizeWidth: "1119px" as const,
      property1: "Minus" as const,
    },
    {
      cardBackgroundColor: "#f3f3f3" as const,
      cardPadding: "39px 55px 36px 60px" as const,
      labelSpacer: "02",
      scheduleMeetings: "Assign & Manage Tasks",
      createAndOrganizeMeetingsWith:
        "Allocate tasks to team members, set deadlines, monitor priorities, and track project progress using an organized workflow system.",
      createAndOrganizeWidth: "1114px" as const,
      property1: "Minus" as const,
    },
    {
      cardBackgroundColor: "#b9ff66" as const,
      cardPadding: "39px 55px 36px 60px" as const,
      labelSpacer: "03",
      scheduleMeetings: "Collaborate with Teams",
      createAndOrganizeMeetingsWith:
        "Enable seamless team communication through shared workspaces, discussions, file sharing, and real-time collaboration tools.",
      createAndOrganizeWidth: "1114px" as const,
      property1: "Minus" as const,
    },
    {
      cardBackgroundColor: "#f3f3f3" as const,
      cardPadding: "39px 55px 36px 60px" as const,
      labelSpacer: "04",
      scheduleMeetings: "Track Workflow Progress",
      createAndOrganizeMeetingsWith:
        "Monitor ongoing projects, analyze task completion rates, and visualize workflow progress through interactive dashboards and analytics.",
      createAndOrganizeWidth: "1114px" as const,
      property1: "Minus" as const,
    },
  ]);
  return (
    <main
      className={`self-stretch h-[1553px] flex flex-col items-end pt-0 pb-[149px] pl-0 pr-5 box-border gap-[74px] max-w-full shrink-0 text-left text-xl text-grays-black font-['Space_Grotesk'] mq1125:h-auto mq450:gap-[18px] mq450:pb-[41px] mq450:box-border mq800:gap-[37px] mq800:pb-[63px] mq800:box-border mq1350:pb-[97px] mq1350:box-border relative z-[5] bg-[#fff] ${className}`}
    >
      <div className="w-[1440px] h-[52px] flex items-start py-0 px-[100px] box-border gap-10 max-w-[102%] shrink-0 mq1125:flex-wrap mq1125:pl-[50px] mq1125:pr-[50px] mq1125:box-border mq800:gap-5 mq800:pl-[25px] mq800:pr-[25px] mq800:box-border">
        <Heading
          property1="Green"
          label="Our Working Process "
          labelWidth="unset"
          labelHeight="unset"
          label1="Label"
          showLabel
          labelWidth1="unset"
          labelHeight1="unset"
          label2="Label"
          labelVisible
        />
        <b className="w-[292px] relative inline-block whitespace-pre-wrap shrink-0 mq450:text-base">
          Step-by-Step Guide to Achieving Your Goals
        </b>
      </div>
      <div className="w-[1400px] flex items-start justify-center py-0 px-5 box-border max-w-full shrink-0">
        <div className="flex flex-col items-start gap-[55px] max-w-full mq800:gap-[27px]">
          {card1Items.map((item, index) => (
            <Card1
              key={index}
              cardBackgroundColor={item.cardBackgroundColor}
              cardPadding={item.cardPadding}
              labelSpacer={item.labelSpacer}
              scheduleMeetings={item.scheduleMeetings}
              createAndOrganizeMeetingsWith={item.createAndOrganizeMeetingsWith}
              createAndOrganizeWidth={item.createAndOrganizeWidth}
              property1={item.property1}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default FrameComponent2;
