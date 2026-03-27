"use client";

import Image from "next/image";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import LeftLogo from "../../public/assets/logo.png";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="py-6 max-w-7xl mx-auto w-full relative z-50">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Image
            src={LeftLogo}
            alt="Logo"
            width={65}
            height={65}
            className="object-contain"
          />
        </div>

        {/* CENTER - Nav Items (Desktop) */}
        <ul className="hidden md:flex bg-[#2A3242] max-w-xs py-3.5 rounded-full flex-1 justify-center gap-10 text-sm text-gray-300">
          <li className="cursor-pointer font-DMSans hover:text-white transition">
            Features
          </li>
          <li className="cursor-pointer font-DMSans hover:text-white transition">
            About
          </li>
          <li className="cursor-pointer font-DMSans hover:text-white transition">
            Contact Us
          </li>
        </ul>

        <div className="hidden md:flex items-center">
          <button
            onClick={() => router.push("/signup")}
            className="bg-[#82F764] font-DMSans text-black text-md px-7 py-2 rounded-full cursor-pointer font-medium"
          >
            Sign in
          </button>
        </div>

        {/* Hamburger */}
        <div className="md:hidden flex items-center z-50">
          <button
            className="text-3xl text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <ul
        className={`md:hidden absolute top-25 left-0 w-full bg-[#2A3242] rounded-xl flex flex-col gap-4 p-6 text-gray-300 shadow-lg transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }
        `}
      >
        <li className="cursor-pointer hover:text-white transition">Features</li>
        <li className="cursor-pointer hover:text-white transition">About</li>
        <li className="cursor-pointer hover:text-white transition">
          Contact Us
        </li>
        <li>
          <button onClick={() => router.push("/signup")} className="w-full bg-[#82F764] text-black text-lg px-7 py-2 rounded-full cursor-pointer font-medium">
            Sign in
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
