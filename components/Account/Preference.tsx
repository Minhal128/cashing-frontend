import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useCurrency } from "@/context/CurrencyContext";

type Language = "English" | "Urdu" | "Arabic";
type Currency = "USD" | "EUR" | "PKR";

export default function Preference() {
  const [openSection, setOpenSection] = useState<
    "language" | "currency" | "notification" | null
  >(null);

  const [language, setLanguage] = useState<Language>("English");
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setCurrency: setGlobalCurrency } = useCurrency();

  const [notifications, setNotifications] = useState({
    security: true,
    payments: false,
    marketing: false,
    updates: true,
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get("/wallet/profile");
        const user = res.data;
        if (user.language) setLanguage(user.language as Language);
        if (user.currency) {
          setCurrencyState(user.currency as Currency);
          setGlobalCurrency(user.currency as Currency);
        }
        if (user.twoFactorEnabled !== undefined) setTwoFactorEnabled(user.twoFactorEnabled);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const updatePreference = async (updates: any) => {
    try {
      await api.post("/auth/update-profile", updates);
      toast.success("Preference updated");
    } catch (error) {
      console.error("Failed to update preference", error);
      toast.error("Failed to update preference");
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    updatePreference({ language: lang });
  };

  const handleCurrencyChange = (cur: Currency) => {
    console.log('Preference: Changing currency to', cur);
    setCurrencyState(cur);
    setGlobalCurrency(cur);
    updatePreference({ currency: cur });
  };

  if (loading) return <div className="text-white p-4">Loading preferences...</div>;

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full rounded-xl">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-white text-md font-DMSans">Preferences</h1>
        </div>

        {/* Preferred Language */}
        <div
          className="flex items-center justify-between px-0 py-3 border-b border-[#2B3343] cursor-pointer"
          onClick={() =>
            setOpenSection(openSection === "language" ? null : "language")
          }
        >
          <span className="text-[#FFFFFF] text-sm font-DMSans">
            Preferred language
          </span>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-DMSans">{language}</span>
            <ChevronRight size={18} />
          </div>
        </div>

        {openSection === "language" && (
          <div className="px-3 py-4 rounded-2xl mt-3 mb-3 space-y-3 bg-[#202736]">
            {["English", "Urdu", "Arabic"].map((lang) => (
              <label
                key={lang}
                className="flex items-center font-DMSans justify-between text-gray-300 cursor-pointer"
                onClick={() => handleLanguageChange(lang as Language)}
              >
                <span className="font-DMSans text-sm">{lang}</span>
                <input
                  type="checkbox"
                  checked={language === lang}
                  readOnly
                  className="accent-[#82F764] w-3 h-3 cursor-pointer"
                />
              </label>
            ))}
          </div>
        )}

        {/* Display Currency */}
        <div
          className="flex items-center justify-between px-0 py-3 border-b border-[#2B3343] cursor-pointer"
          onClick={() =>
            setOpenSection(openSection === "currency" ? null : "currency")
          }
        >
          <span className="text-gray-300">Display currency</span>
          <div className="flex items-center gap-2 text-gray-400">
            <span>{currency}</span>
            <ChevronRight size={18} />
          </div>
        </div>

        {openSection === "currency" && (
          <div className="px-3 py-4 space-y-3 rounded-2xl my-3 bg-[#202736]">
            {["USD", "EUR", "PKR"].map((cur) => (
              <label
                key={cur}
                className="flex items-center justify-between text-gray-300 cursor-pointer"
                onClick={() => handleCurrencyChange(cur as Currency)}
              >
                <span className="font-DMSans text-sm">{cur}</span>
                <input
                  type="checkbox"
                  checked={currency === cur}
                  readOnly
                  className="accent-[#82F764] w-3 h-3 cursor-pointer"
                />
              </label>
            ))}
          </div>
        )}

        {/* Notification Preference */}
        <div
          className="flex items-center justify-between px-0 py-3 cursor-pointer"
          onClick={() =>
            setOpenSection(
              openSection === "notification" ? null : "notification",
            )
          }
        >
          <span className="text-gray-300">Notification preference</span>
          <ChevronRight size={18} className="text-gray-400" />
        </div>

        {openSection === "notification" && (
          <div className="px-3 py-4 space-y-4 my-3 rounded-2xl bg-[#202736]">
            {[
              {
                key: "security",
                title: "Security alerts",
                desc: "Login and password related alerts",
              },
              {
                key: "payments",
                title: "Payment alerts",
                desc: "Transaction notifications",
              },
              {
                key: "marketing",
                title: "Marketing",
                desc: "Offers and promotions",
              },
              {
                key: "updates",
                title: "App updates",
                desc: "New features and improvements",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 font-DMSans text-sm">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 font-DMSans">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof notifications],
                    }))
                  }
                  className={`w-9 h-5 rounded-full transition ${notifications[item.key as keyof typeof notifications]
                    ? "bg-[#82F764]"
                    : "bg-[#BEC0CA]"
                    }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 bg-[#202736] rounded-full transform transition ${notifications[item.key as keyof typeof notifications]
                      ? "translate-x-5"
                      : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
