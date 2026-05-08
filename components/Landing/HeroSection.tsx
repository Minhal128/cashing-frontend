import Image from "next/image";
import BgDotsImg from "../../public/assets/bgdots.png";
import TopraysImg from "../../public/assets/toprays.png";
import DashImg from "../../public/assets/dash.png";
import SmallIcon from "../../public/assets/herofirst.png";
import Navbar from "./Navbar";

const HeroSection = () => {
  return (
    <section
      data-animate="true"
      className="relative md:min-h-screen overflow-hidden rounded-4xl bg-[#1A202A] text-white"
    >
      {/* background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BgDotsImg}
          alt="App background"
          fill
          className="object-cover opacity-40"
        />
      </div>

      {/* Rays */}
      <div className="absolute inset-0 z-10">
        <Image
          src={TopraysImg}
          alt="Rays"
          fill
          className="md:object-cover opacity-40"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6">
        {/* NAVBAR */}
        <Navbar />

        {/* HERO */}
        <div className="text-center md:mt-24 mt-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-[#2A3241] border border-[#454E5F] mb-4">
            <div className="w-6 h-6 relative">
              <Image
                src={SmallIcon}
                alt="Icon"
                fill
                className="object-contain"
              />
            </div>
            <span className="rounded-full font-DMSans text-sm text-gray-200">
              One platform. Total control.
            </span>
          </div>

          <div className="text-3xl font-DMSans md:text-[60px] leading-tight-2">
            Get paid. Send money.
            <br />
            Withdraw <span className="text-[#7CFF4D]">Anytime.</span>
          </div>

          <p className="text-sm font-DMSans md:text-[14px] px-10 md:px-0 pt-2 pb-8 leading-tight-2">
            Accept payments, transfer funds instantly within the platform, and
            <br />
            cash out to your bank or Bitcoin wallet in minutes.
          </p>
          <button className="bg-[#82F764] font-DMSans text-black px-10 cursor-pointer py-3 rounded-full">
            Start banking
          </button>
        </div>

        {/*  DASHBOARD */}
        <div className="relative mt-20">
          <Image
            src={DashImg}
            alt="Dashboard"
            width={1200}
            height={700}
            className="mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
