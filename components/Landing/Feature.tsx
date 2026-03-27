import Image from "next/image";
import SmallIcon from "../../public/assets/herofirst.png";
import DiscoverFirst from "../../public/assets/discoverfirst.png";
import DiscoverSecond from "../../public/assets/discoversec.png";

const Feature = () => {
  return (
    <section
      data-animate="true"
      className="relative w-full text-white py-5 px-4 md:px-0 translate-y-20"
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
      <h2 className="text-center font-DMSans text-2xl md:text-5xl md:mb-16 mb-8">
        Transforming finance – one <br className="hidden md:block" />
        feature at a time
      </h2>

      {/* Images Section */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:gap-0 md:grid-cols-2">
        <div className="rounded-3xl p-0 md:p-6">
          <Image
            src={DiscoverFirst}
            alt="Left Feature"
            width={800}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-0 md:p-6">
          <Image
            src={DiscoverSecond}
            alt="Right Feature"
            width={800}
            height={500}
            className="w-full h-auto rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Feature;
