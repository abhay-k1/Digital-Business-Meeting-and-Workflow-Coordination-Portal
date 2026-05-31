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
      className={`self-stretch h-[667px] flex items-start py-0 pl-[99px] pr-[100px] box-border max-w-full shrink-0 mq450:pl-5 mq450:pr-5 mq450:box-border mq800:pl-[49px] mq800:pr-[50px] mq800:box-border ${className}`}
    >
      <div
        className="self-stretch flex-1 rounded-t-[45px] rounded-b-none bg-dark flex flex-col items-start pt-[55px] px-[60px] pb-[50px] box-border max-w-full mq450:pt-9 mq450:pb-8 mq450:box-border mq800:gap-[25px] mq1350:pl-[30px] mq1350:pr-[30px] mq1350:box-border"
        data-scroll-to="footerContainer"
      >
        <div className="w-[1121px] h-[281px] relative max-w-full mq1350:h-auto mq1350:min-h-[281px]">
          <div className="absolute top-[-56px] left-[350px] [filter:blur(240px)] rounded-[50%] bg-[#d9d9d9] w-[421px] h-[209px] shrink-0" />
          <section className="absolute top-[210px] left-[12px] flex items-start gap-[154px] max-w-full shrink-0 text-left text-lg text-[#fff] font-['Space_Grotesk'] mq1350:flex-wrap">
            <div className="flex flex-col items-start gap-[27px] mq1350:flex-1">
              <Heading
                property1="Green"
                label="Contact us:"
                labelWidth="119px"
                labelHeight="51px"
                label1="Label"
                showLabel={false}
                labelWidth1="119px"
                labelHeight1="51px"
                label2="Label"
                labelVisible={false}
              />
              <div className="flex flex-col items-start gap-5">
                <div className="relative">Email: abhaykamble976@gmail.com</div>
                <div className="relative">Phone: 8446638287</div>
              </div>
            </div>
            <div className="rounded-[14px] bg-[#292a32] overflow-hidden flex items-start py-[58px] px-10 box-border gap-5 max-w-full mq1125:min-w-full mq800:flex-wrap mq1350:flex-1">
              <div className="w-[285px] rounded-[14px] border-[#fff] border-solid border-[1px] box-border overflow-hidden shrink-0 flex items-start py-5 px-[35px]">
                <input
                  className="w-full [border:none] [outline:none] font-['Space_Grotesk'] text-lg bg-[transparent] h-[23px] relative text-[#fff] text-left inline-block min-w-[27px] p-0"
                  placeholder="Email"
                  type="text"
                />
              </div>
              <Button property1="Button tertiary" label="Subscribe to news" />
            </div>
          </section>
          <Image
            className="absolute top-[-13px] left-[332px] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] w-[457px] h-[123px] object-cover shrink-0"
            width={457}
            height={123}
            sizes="100vw"
            alt=""
            src="/image-1@2x.png"
          />
        </div>
      </div>
    </section>
  );
};

export default FrameComponent3;
