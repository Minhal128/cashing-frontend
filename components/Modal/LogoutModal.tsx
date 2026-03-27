"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoutImg from "@/public/assets/logout.png";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    onClose();
    router.push("/signin");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#181D27] p-6 text-white">
        <div className="mb-4 flex justify-center">
          <div className="flex h-25 w-25 items-center justify-center rounded-full bg-[#202736]">
            <Image
              src={LogoutImg}
              alt="Logout"
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>

        <h2 className="text-center text-xl font-DMSans">You’re signing out</h2>

        <p className="mt-1 text-center font-DMSans text-sm text-gray-400">
          You can safely log out now. Your account and wallet remain secure.
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[#2B3343] py-3 text-sm cursor-pointer text-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-full bg-[#FF383C] py-3 text-sm font-medium text-white cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
