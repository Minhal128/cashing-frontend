import Image from "next/image";
import BgGrid from "../../public/assets/walletbg.png";
import ShadowLeft from "../../public/assets/shadow1.png";
import ShadowRight from "../../public/assets/shdow2.png";

const Wallet = () => {
  return (
    <section
      data-animate="true"
      className="relative w-full px-4 md:px-10 md:py-20"
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#2A3241]">
        {/* Background */}
        <Image
          src={BgGrid}
          alt="Background Grid"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-white/8" />

        <Image
          src={ShadowLeft}
          alt="Left Shadow"
          fill
          className="object-cover opacity-60"
        />

        <Image
          src={ShadowRight}
          alt="Right Shadow"
          fill
          className="object-cover opacity-60"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 md:py-20 py-10 text-center text-white">
          <h2 className="text-xl font-DMSans md:text-4xl mb-4">
            Create Your Cha$Ching Wallet
          </h2>

          <p className="max-w-2xl text-gray-400 mb-4 font-DMSans text-xs md:text-lg">
            Sign up once and access fast, secure money movement from one place.
          </p>

          <button className="rounded-full font-DMSans cursor-pointer bg-[#82F764] px-8 py-2 text-sm text-black transition hover:opacity-90">
            Start banking
          </button>
        </div>
      </div>
    </section>
  );
};

export default Wallet;
