import Image from "next/image";
import Imageone from "../../public/assets/discover/1.png";
import Imagetwo from "../../public/assets/discover/2.png";
import ImageThree from "../../public/assets/discover/3.png";
import ImageFour from "../../public/assets/discover/4.png";
import ImageFive from "../../public/assets/discover/5.png";

const logos = [Imageone, Imagetwo, ImageThree, ImageFour, ImageFive];

export default function Discover() {
  return (
    <section data-animate="true" className="w-full bg-[#0b1220] md:py-20 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl border border-[#252B37] backdrop-blur-md md:px-6 md:py-6 py-3 overflow-hidden">
          {/* Heading */}
          <h2 className="text-center font-DMSans text-white md:text-lg text-[12px]">
            Built for people who value speed and security
          </h2>

          <div className="relative md:mt-6 mt-5 overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-linear-to-r from-[#0b1220] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-linear-to-l from-[#0b1220] to-transparent z-10" />

            <div className="marquee flex md:gap-12 gap-3">
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={index}
                  className="flex md:min-w-30 min-w-40 items-center justify-center opacity-70 hover:opacity-100 transition"
                >
                  <Image
                    src={logo}
                    alt="Brand logo"
                    className="object-contain md:w-42 w-30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="md:mt-6 font-DMSans mt-5 text-center md:text-sm text-[8px] text-white/70">
            Discover tailored financial solutions that secure your investments.
          </p>
        </div>
      </div>
    </section>
  );
}
