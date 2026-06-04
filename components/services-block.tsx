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
    if (!session) {
      window.location.href = "/login?redirect=" + encodeURIComponent("/dashboard?redirect=/meetings");
    } else {
      const activeGroup = localStorage.getItem("active_group_id");
      if (!activeGroup) {
        window.location.href = "/dashboard?redirect=/meetings";
      } else {
        window.location.href = "/meetings";
      }
    }
  }, []);

  const onCardContainerClick1 = useCallback(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login?redirect=" + encodeURIComponent("/dashboard?redirect=/tasks");
    } else {
      const activeGroup = localStorage.getItem("active_group_id");
      if (!activeGroup) {
        window.location.href = "/dashboard?redirect=/tasks";
      } else {
        window.location.href = "/tasks";
      }
    }
  }, []);

  const onCardContainerClick2 = useCallback(() => {
    const session = getSession();
    window.location.href = session ? "/dashboard" : "/login";
  }, []);

  const onCardContainerClick3 = useCallback(() => {
    const session = getSession();
    window.location.href = session ? "/dashboard" : "/login";
  }, []);

  const onBookSyncClick = useCallback(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login?redirect=" + encodeURIComponent("/dashboard?redirect=/meetings");
    } else {
      const activeGroup = localStorage.getItem("active_group_id");
      if (!activeGroup) {
        window.location.href = "/dashboard?redirect=/meetings";
      } else {
        window.location.href = "/meetings";
      }
    }
  }, []);

  return (
    <section
      className={`w-full max-w-7xl mx-auto px-16 box-border flex flex-col items-start gap-12 shrink-0 mq1125:px-8 mq450:gap-6 pb-20 bg-white ${className}`}
    >
      {/* Banner CTA section - Redesigned into responsive side-by-side flex layout */}
      <div className="w-full flex items-start max-w-full shrink-0">
        <div className="w-full flex items-center box-border max-w-full">
          <section className="w-full rounded-[28px] bg-slate-50 border border-solid border-slate-200/80 flex items-center justify-between p-12 box-border text-left text-grays-black font-['Space_Grotesk'] max-w-full flex-wrap gap-8 mq800:p-8">
            <div className="flex flex-col items-start gap-5 max-w-[550px] flex-1 min-w-[280px]">
              <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-900 mq450:text-xl mq800:text-2xl">
                Let’s make things happen
              </h2>
              <div className="text-lg text-slate-500 font-['DM_Sans'] leading-relaxed">
                Ready to streamline your business operations? Bring your team
                together, automate your meeting workflows, and eliminate
                coordination bottlenecks starting today.
              </div>
              <Button
                label="Book your meeting schedule"
                onClick={onBookSyncClick}
              />
            </div>
            
            <div className="w-[380px] h-[280px] flex items-center justify-center relative flex-1 min-w-[260px] max-w-[400px] shrink-0">
              <Image
                className="w-full h-full object-contain"
                width={359}
                height={280}
                alt="Productive team coordination"
                src="/Illustration3.svg"
              />
            </div>
          </section>
        </div>
      </div>

      {/* Grid container for modern service cards */}
      <div className="w-full grid grid-cols-2 gap-8 max-w-full z-[1] shrink-0 mq1125:grid-cols-1">
        <Card
          onCardContainerClick={onCardContainerClick}
          illustration="/Illustration4@2x.png"
          property1="Green"
          label="Meeting Coordination"
          label1="Sync"
          label2="Meetings"
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="Black"
          icon="/Icon.svg"
        />
        <Card
          onCardContainerClick={onCardContainerClick1}
          cardBackgroundColor="#f0fdfa"
          cardPadding="48px 50px"
          cardGap="20px"
          headingAndLinkJustifyContent="unset"
          illustration="/Illustration1@2x.png"
          illustrationIconHeight="147.6px"
          property1="White"
          label="Task Allocation"
          label1="Allocate"
          label2="Workloads"
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="Black"
          icon="/Icon.svg"
        />
        <Card
          onCardContainerClick={onCardContainerClick2}
          cardBackgroundColor="#f8fafc"
          cardPadding="48px 50px"
          cardGap="20px"
          headingAndLinkJustifyContent="unset"
          illustration="/Illustration2@2x.png"
          illustrationIconHeight="210px"
          property1="White"
          label="Team Workspace"
          label1="Manage"
          label2="Collaboration"
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="White 2"
          icon="/Icon1.svg"
        />
        <Card
          onCardContainerClick={onCardContainerClick3}
          cardBackgroundColor="#f0fdfa"
          cardPadding="48px 49px"
          cardGap="11px"
          headingAndLinkJustifyContent="center"
          illustration="/Illustration5@2x.png"
          illustrationIconHeight="195.9px"
          property1="Green"
          label="Metrics Dashboard"
          label1="Monitor"
          label2="Analytics"
          showLabel
          labelVisible
          labelWidth="unset"
          labelHeight="unset"
          property11="Black"
          icon="/Icon.svg"
        />
      </div>
    </section>
  );
};

export default ServicesBlock;
