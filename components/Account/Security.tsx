import { useState, useEffect } from "react";
import { Monitor, Trash2 } from "lucide-react";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function Security() {
  const [openSection, setOpenSection] = useState<
    "password" | "sessions" | null
  >(null);

  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const res = await api.get("/wallet/profile");
        setTwoFactor(res.data.twoFactorEnabled || false);
      } catch (error) {
        console.error("Failed to fetch security settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSecurity();
  }, []);

  const handleToggle2FA = async () => {
    try {
      const newVal = !twoFactor;
      await api.post("/auth/update-profile", { twoFactorEnabled: newVal });
      setTwoFactor(newVal);
      toast.success(`2FA ${newVal ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Failed to toggle 2FA:", error);
      toast.error("Failed to update 2FA setting");
    }
  };

  const toggleSection = (section: "password" | "sessions") => {
    setOpenSection(openSection === section ? null : section);
  };

  if (loading) return <div className="text-white p-4">Loading security settings...</div>;

  return (
    <div className="text-white">
      <div className="rounded-xl">
        {/* Header */}
        <div className="px-0 pb-4 text-lg font-DMSans">Security</div>

        {/* Two Factor Authentication */}
        <div className="flex items-center justify-between px-0 py-3 border-b border-white/10">
          <span className="text-sm font-DMSans">Two-factor authentication</span>

          <button
            onClick={handleToggle2FA}
            className={`w-11 h-6 rounded-full relative transition ${twoFactor ? "bg-green-500" : "bg-gray-500"
              }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${twoFactor ? "right-1" : "left-1"
                }`}
            />
          </button>
        </div>

        {/* Change Password */}
        <div className="border-b border-white/10">
          <button
            onClick={() => toggleSection("password")}
            className="w-full flex items-center cursor-pointer justify-between px-0 py-3"
          >
            <span className="font-DMSans text-sm">Change password</span>
            {openSection === "password" ? (
              <IoMdArrowDropdown />
            ) : (
              <IoMdArrowDropright />
            )}
          </button>

          {openSection === "password" && (
            <div className="px-0 pb-4 space-y-2">
              <input
                type="password"
                placeholder="Old password"
                className="w-full font-DMSans bg-[#202736] rounded-lg px-4 outline-none py-3 text-sm"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full font-DMSans bg-[#202736] rounded-lg px-4 outline-none py-3 text-sm"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full font-DMSans bg-[#202736] rounded-lg px-4 outline-none py-3 text-sm"
              />

              <button className="bg-[#82F764] font-DMSans text-[#202736] text-sm px-4 py-3 rounded-lg">
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div>
          <button
            onClick={() => toggleSection("sessions")}
            className="w-full flex items-center cursor-pointer justify-between px-0 py-3"
          >
            <span className="font-DMSans text-sm">Active sessions</span>
            {openSection === "sessions" ? (
              <IoMdArrowDropdown />
            ) : (
              <IoMdArrowDropright />
            )}
          </button>

          {openSection === "sessions" && (
            <div className="px-0 pb-4 space-y-3">
              {/* Session Item */}
              <div className="flex items-center justify-between bg-[#1B2230] rounded-full px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Left Icon Box */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#202736]">
                    <Monitor size={18} className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-DMSans">Chrome · Windows</p>
                    <p className="text-xs font-DMSans text-white/60">
                      Lahore, Pakistan · Active now
                    </p>
                  </div>
                </div>

                {/* Delete Icon Box */}
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#202736] text-red-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#1B2230] rounded-full px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#202736]">
                    <Monitor size={18} className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-DMSans">Safari · iPhone</p>
                    <p className="text-xs font-DMSans text-white/60">
                      Karachi, Pakistan · 2 hours ago
                    </p>
                  </div>
                </div>

                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#202736] text-red-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
