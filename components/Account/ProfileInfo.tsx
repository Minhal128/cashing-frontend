import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ProfileInfo() {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/wallet/profile");
        const data = res.data;
        if (data.dob) {
          const date = new Date(data.dob);
          if (!isNaN(date.getTime())) {
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const y = date.getFullYear();
            data.dob = `${m}/${d}/${y}`;
          }
        }
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Validate DOB if it's not empty
    let formattedDob = user.dob;
    if (user.dob && user.dob.includes('/')) {
      const parts = user.dob.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900) {
          // Store as YYYY-MM-DD for backend consistency if it expects that, 
          // or just pass as is if backend handles JS dates. 
          // Let's create a date object to be safe.
          const dateObj = new Date(year, month - 1, day);
          formattedDob = dateObj.toISOString();
        } else {
          toast.error("Invalid Date of Birth format. Use MM/DD/YYYY");
          return;
        }
      } else {
        toast.error("Invalid Date of Birth format. Use MM/DD/YYYY");
        return;
      }
    }

    try {
      await api.post("/auth/update-profile", {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        country: user.country,
        dob: formattedDob
      });
      toast.success("Profile updated!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="text-white p-4">Loading profile...</div>;

  return (
    <div className="w-full">
      {/* Title */}
      <h1 className="text-xl font-DMSans text-left mb-4">
        Profile information
      </h1>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">First Name</label>
          <input
            name="firstName"
            value={user.firstName || ''}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] outline-none text-white"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Last Name</label>
          <input
            name="lastName"
            value={user.lastName || ''}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] outline-none text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-3">

        {/* Input 2 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Email address</label>
          <input
            name="email"
            value={user.email || ''}
            readOnly
            type="email"
            placeholder="Email address"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] text-white outline-none opacity-70 cursor-not-allowed"
          />
        </div>

        {/* Input 3 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Phone number</label>
          <input
            name="phone"
            value={user.phone || ''}
            onChange={handleChange}
            type="text"
            placeholder="Phone number"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] text-white outline-none"
          />
        </div>

        {/* Input 4 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Gender</label>
          <input
            name="gender"
            value={user.gender || ''}
            onChange={handleChange}
            type="text"
            placeholder="Gender"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] text-white outline-none"
          />
        </div>

        {/* Input 5 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Country of residence</label>
          <input
            name="country"
            value={user.country || ''}
            onChange={handleChange}
            type="text"
            placeholder="Country of residence"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] text-white outline-none"
          />
        </div>

        {/* Input 6 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Date of birth (MM/DD/YYYY)</label>
          <input
            name="dob"
            value={user.dob || ''}
            onChange={(e) => {
              let val = e.target.value.replace(/[^\d/]/g, '');
              if (val.length === 2 && !val.includes('/')) val += '/';
              if (val.length === 5 && val.split('/').length === 2) val += '/';
              if (val.length > 10) val = val.substring(0, 10);
              setUser({ ...user, dob: val });
            }}
            type="text"
            placeholder="MM/DD/YYYY"
            className="w-full p-4 rounded-xl font-DMSans bg-[#202736] text-white outline-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSave}
        className="w-full mt-6 p-4 rounded-xl bg-[#82F764] text-[#202736] font-inter font-bold hover:opacity-90 transition"
      >
        Save Changes
      </button>
    </div>
  );
}
