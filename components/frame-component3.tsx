import type { NextPage } from "next";
import Image from "next/image";
import Heading from "./heading";
import Button from "./button";

export type FrameComponent3Type = {
  className?: string;
};

const FrameComponent3: NextPage<FrameComponent3Type> = ({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex items-start py-0 pl-0 pr-0 box-border max-w-full shrink-0 ${className}`}
    >
      <div
        className="self-stretch flex-1 rounded-t-[32px] rounded-b-none bg-white/75 backdrop-blur-lg border-t-[3.5px] border-solid border-[#097C87] shadow-[0_-15px_40px_rgba(9,124,135,0.06)] flex flex-col items-start pt-[65px] px-[80px] pb-[60px] box-border max-w-full mq450:pt-9 mq450:pb-8 mq450:box-border mq800:gap-[25px] mq1350:pl-[30px] mq1350:pr-[30px] mq1350:box-border"
        data-scroll-to="footerContainer"
      >
        <div className="w-full flex items-start justify-between flex-wrap gap-12 max-w-full z-[1]">
          {/* Contact Details */}
          <div className="flex flex-col items-start gap-[20px] min-w-[280px]">
            <Heading
              label="Contact Us"
              showLabel={false}
            />
            <div className="flex flex-col items-start gap-3.5 text-base text-slate-600 font-['DM_Sans'] mt-2">
              <div className="relative">
                Email: <a href="mailto:abhaykamble976@gmail.com" className="font-semibold text-[#097C87] hover:text-[#5F8D9E] transition underline">abhaykamble976@gmail.com</a>
              </div>
              <div className="relative">
                Phone: <span className="font-semibold text-slate-800">8446638287</span>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="rounded-[20px] bg-white border border-solid border-slate-200/50 p-6 shadow-sm flex items-center gap-4 max-w-full flex-wrap min-w-[320px]">
            <div className="rounded-xl border-slate-200 border-solid border-[1px] box-border overflow-hidden shrink-0 flex items-center py-3 px-4 w-[280px]">
              <input
                className="w-full border-none outline-none font-['Space_Grotesk'] text-base bg-transparent text-[#0f172a] placeholder:text-slate-400 p-0"
                placeholder="Enter your email"
                type="email"
              />
            </div>
            <Button property1="Button tertiary" label="Subscribe" />
          </div>

          {/* Logo Branding */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Image
              className="w-[260px] h-[70px] object-cover opacity-95 cursor-pointer"
              width={260}
              height={70}
              sizes="100vw"
              alt="Digital Business Meeting and Workflow Coordination Portal Logo"
              src="/image-1@2x.png"
              onClick={() => window.location.href = "/"}
            />
            <span className="text-xs text-slate-400 font-['DM_Sans'] pr-2">
              © 2026 Portal Inc. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent3;
