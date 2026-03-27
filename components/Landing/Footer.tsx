import Image from "next/image";
import Link from "next/link";
import LogoImg from "../../public/assets/logo.png";

import {
  FaInstagram,
  FaTelegramPlane,
  FaTwitter,
  FaMediumM,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer data-animate="true" className="w-full bg-[#0b1220] text-gray-400">
      {/* Top Content */}
      <div className="max-w-7xl mx-auto md:px-0 px-2 py-16 grid grid-cols-2 md:grid-cols-3 md:gap-10">
        {/* Left Section */}
        <div className="space-y-4 col-span-1">
          <div className="flex items-center gap-2">
            <Image
              src={LogoImg}
              alt="Cha $ching"
              width={70}
              height={40}
              className="object-contain"
            />
          </div>

          <p className="md:text-md font-DMSans text-xs leading-relaxed max-w-xs">
            Securely Protecting Your Digital Wealth, Today And Tomorrow.
          </p>
        </div>

        {/* Right Links */}
        <div className="col-span-1 md:col-span-2 flex justify-end">
          <ul className="space-y-3 md:text-sm text-xs text-right">
            <li>
              <Link
                href="#"
                className="hover:text-white font-DMSans transition"
              >
                FEATURES
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-white font-DMSans transition"
              >
                ABOUT
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-white font-DMSans transition"
              >
                CONTACT US
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-white font-DMSans transition"
              >
                BLOGS
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t md:mx-26 mx-2 border-[#1A365D]"></div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto font-DMSans px-0 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <span>COPYRIGHT 2025, ALL RIGHT RESERVED</span>

        <div className="flex gap-6">
          <Link href="#" className="hover:text-white font-DMSans transition">
            PRIVACY
          </Link>
          <Link href="#" className="hover:text-white font-DMSans transition">
            TERMS
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3">
          {[
            { icon: <FaMediumM />, link: "#" },
            { icon: <FaInstagram />, link: "#" },
            { icon: <FaTelegramPlane />, link: "#" },
            { icon: <FaTwitter />, link: "#" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition text-sm text-white"
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Big Background Image */}
      <div className="relative overflow-hidden md:mt-10 mt-5 flex justify-center pb-10">
        <h1
          className="
    text-[12vw] md:text-[9vw] font-DMSans-Bold
    bg-linear-to-b
    from-[#76A3DC]
    to-gray-900
    bg-clip-text text-transparent
    opacity-90
    leading-tight
  "
        >
          CHA $CHING
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
