import Image from "next/image";
import SmallIcon from "../../public/assets/herofirst.png";
import ToolsFirst from "../../public/assets/toolsfirst.png";
import ToolsSecond from "../../public/assets/toolsec.png";
import ToolsThird from "../../public/assets/toolthird.png";
import ToolsFour from "../../public/assets/toolsfour.png";
import ToolsFive from "../../public/assets/toolsfive.png";
import ToolsSix from "../../public/assets/toolsix.png";

const Tools = () => {
  return (
    <section
      data-animate="true"
      className="relative w-full text-white md:pt-20 mt-10 px-4 md:px-10"
    >
      {/* Top */}
      <div className="flex justify-center md:mb-4 mb-6">
        <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-[#2A3241] border border-[#454E5F]">
          <div className="w-6 h-6 relative">
            <Image src={SmallIcon} alt="Icon" fill className="object-contain" />
          </div>
          <span className="rounded-full font-DMSans text-sm text-gray-200">
            One platform. Total control.
          </span>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-center font-DMSans text-2xl md:text-5xl px-10 md:px-0 md:mb-16 mb-6">
        Money tools that works <br className="hidden md:block" /> for you
      </h2>

      {/* Images Section */}
      <div className="mx-auto grid max-w-7xl gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-0">
        <div className="rounded-3xl p-0 md:p-2 shadow-lg">
          <Image
            src={ToolsFirst}
            alt="Tool 1"
            width={700}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-0 md:p-2 shadow-lg">
          <Image
            src={ToolsSecond}
            alt="Tool 2"
            width={700}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-0 md:p-2 shadow-lg">
          <Image
            src={ToolsThird}
            alt="Tool 3"
            width={700}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-0 md:p-2 shadow-lg">
          <Image
            src={ToolsFour}
            alt="Tool 4"
            width={700}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-0 md:p-2 shadow-lg">
          <Image
            src={ToolsFive}
            alt="Tool 5"
            width={700}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-0 md:p-2 shadow-lg">
          <Image
            src={ToolsSix}
            alt="Tool 6"
            width={700}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Tools;
