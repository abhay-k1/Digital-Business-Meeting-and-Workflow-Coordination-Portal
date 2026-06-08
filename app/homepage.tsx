"use client";
import type { NextPage } from "next";
import { useCallback, useState, useEffect } from "react";
import FrameComponent from "../components/frame-component";
import Heading from "../components/heading";
import ServicesBlock from "../components/services-block";
import FrameComponent1 from "../components/frame-component1";
import FrameComponent2 from "../components/frame-component2";
import FrameComponent3 from "../components/frame-component3";
import { getSession, UserSession } from "./lib/auth";

const Homepage: NextPage = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const onGetStartedTextClick = useCallback(() => {
    const sessionVal = getSession();
    if (sessionVal) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="w-full h-auto min-h-screen relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left text-lg text-grays-black font-['Space_Grotesk'] mq450:gap-5 mq800:gap-10">
      <FrameComponent />

      {session && (
        <div className="w-full max-w-7xl mx-auto px-16 -mt-10 -mb-10 box-border animate-fade-in-up">
          <h1 className="text-[56.6px] font-extrabold leading-[1.1] tracking-tight font-['Space_Grotesk'] text-grays-black mq450:text-[32px] mq800:text-[44px]">
            Welcome back, <span className="text-[#16A34A]">{session.name}</span>!
          </h1>
        </div>
      )}

      {/* Hero Section - Redesigned into responsive two-column grid to remove empty space */}
      <section className="w-full max-w-7xl mx-auto px-16 box-border flex items-center justify-between gap-12 shrink-0 text-left text-grays-black font-[Inter] mq1125:flex-col mq1125:px-8 mq1125:gap-16">
        {/* Left Column: Core CTA and Info */}
        <div className="flex-1 flex flex-col items-start gap-6 max-w-[650px] mq1125:max-w-full">
          <div
            className="text-[56.6px] font-extrabold leading-[1.1] tracking-tight relative mq450:text-[32px] mq800:text-[44px]"
            data-scroll-to="smarterMeetingsSmoother"
          >
            Smarter Meetings.<br />
            <span className="text-[#097C87]">Smoother Workflows.</span>
          </div>
          <div className="text-[21px] font-['DM_Sans'] text-slate-500 leading-relaxed font-normal">
            A unified platform for modern teams to schedule meetings, manage
            tasks, and coordinate work — keeping everyone aligned and every deadline on track.
          </div>
          <button
            className="cursor-pointer border-none bg-gradient-to-r from-[#097C87] to-[#097C87]/90 hover:from-[#23CED9] hover:to-[#097C87] text-white rounded-xl px-10 py-4.5 font-bold text-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center font-['Space_Grotesk']"
            onClick={onGetStartedTextClick}
          >
            Get Started &rarr;
          </button>
        </div>

        {/* Right Column: High-Fidelity Glassmorphic Mock Dashboard Widget (Resolves empty landing page space) */}
        <div className="flex-1 w-full max-w-[560px] flex items-center justify-center relative mq1125:max-w-full">
          <div className="w-full p-7 rounded-[28px] bg-slate-50 border border-solid border-slate-200/80 shadow-[0_15px_40px_rgba(9,124,135,0.06)] relative overflow-hidden flex flex-col gap-5 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(9,124,135,0.08)] transition-all duration-300">
            {/* Header segment of mock workspace */}
            <div className="flex justify-between items-center pb-3 border-b border-solid border-slate-200/60">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Workspace</span>
                <span className="text-base font-bold text-slate-800 flex items-center gap-1.5 font-['Space_Grotesk']">
                  🏢 Quality Assurance Sync
                </span>
              </div>
              <span className="text-xs bg-[#23CED9]/10 text-[#097C87] px-2.5 py-1 rounded-md font-mono font-bold border border-solid border-[#23CED9]/20">
                GRP-5274
              </span>
            </div>

            {/* Simulated Sync Meeting Card */}
            <div className="bg-white p-4.5 rounded-2xl border border-solid border-slate-150 flex flex-col gap-3.5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-800 font-['Space_Grotesk']">📅 Weekly Performance Review</span>
                  <span className="text-xs text-slate-400 font-['DM_Sans']">⏰ 10:00 AM - Participants (4)</span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold bg-[#A1CCA6]/20 text-slate-700 px-2 py-0.5 rounded border border-solid border-[#A1CCA6]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#097C87] animate-pulse"></span>
                  Upcoming
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 mt-1 bg-slate-50 p-2.5 rounded-xl border border-solid border-slate-100">
                <span className="text-xs text-slate-500 font-medium font-['DM_Sans'] truncate">🔗 meet.google.com/new</span>
                <button className="cursor-pointer border-none bg-[#097C87] hover:bg-[#23CED9] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                  Join Call
                </button>
              </div>
            </div>

            {/* Simulated Tasks Card */}
            <div className="bg-white p-4.5 rounded-2xl border border-solid border-slate-150 flex flex-col gap-3.5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800 font-['Space_Grotesk']">📋 Active Tasks</span>
                <span className="text-[11px] font-bold text-slate-400 font-['DM_Sans']">2 Pending</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-solid border-slate-100">
                  <span className="text-slate-600 font-medium font-['DM_Sans']">🔧 Design SaaS UI Prototypes</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Medium</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium font-['DM_Sans']">🚀 Optimize API Performance</span>
                  <span className="text-[10px] font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded border border-solid border-red-100">High</span>
                </div>
              </div>
            </div>

            {/* Team Progress Tracker Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Task Workload Progress</span>
                <span className="text-[#097C87]">67%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#097C87] to-[#23CED9] rounded-full" style={{ width: "67%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ml-[-28px] w-[1440px] flex items-start py-0 px-[100px] box-border gap-10 max-w-full z-[1] shrink-0 mq1125:flex-wrap mq1125:pl-[50px] mq1125:pr-[50px] mq1125:box-border mq800:gap-5 mq800:pl-[25px] mq800:pr-[25px] mq800:box-border">
        <Heading
          label="Services"
          label1="Core Solutions"
          showLabel
        />
        <div className="w-[580px] relative inline-block shrink-0 max-w-full">
          At our coordination portal, we provide a robust suite of tools designed to streamline business scheduling, task allocation, and collaboration.
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
