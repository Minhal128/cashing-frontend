import { useEffect, useState } from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import UserImg from "../../../public/assets/user.png";
import SendImg from "../../../public/assets/send.png";
import api from "@/lib/api";

export default function SavedContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get("/transactions/history");
        // Extract unique receiverIds from transfers
        const transfers = response.data.filter((tx: any) => tx.type === 'transfer');
        const uniqueContactsMap = new Map();

        transfers.forEach((tx: any) => {
          // In a real app, you'd fetch user details for these IDs. 
          // For now, we'll use the receiver ID as the name/tag for demonstration of dynamic behavior.
          // In this specific backend, transaction history usually includes user objects if populated.
          const contactId = tx.receiverId?._id || tx.receiverId;
          if (contactId && !uniqueContactsMap.has(contactId)) {
            uniqueContactsMap.set(contactId, {
              id: contactId,
              name: tx.receiverId?.firstName ? `${tx.receiverId.firstName} ${tx.receiverId.lastName}` : "Recent Contact",
              username: tx.receiverId?.tag || `@user_${contactId.substring(0, 5)}`,
              avatar: UserImg
            });
          }
        });

        setContacts(Array.from(uniqueContactsMap.values()).slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#111827] border border-[#2B3343] rounded-xl p-5 w-full text-white">
      {/* Header */}
      <h3 className="font-DMSans mb-3">Saved contacts</h3>

      {/* Search */}
      <div className="relative mb-3">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search contact"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#202736] font-DMSans rounded-md py-3 pl-9 pr-3 text-sm placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Contacts List */}
      <div className="space-y-1">
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-4 font-DMSans">Loading contacts...</p>
        ) : filteredContacts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4 font-DMSans">{search ? "No matching contacts" : "No recent contacts"}</p>
        ) : (
          filteredContacts.map((contact, index) => (
            <div key={contact.id}>
              <div className="flex items-center justify-between py-3">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 relative">
                    <Image src={UserImg} alt={contact.name} fill className="object-cover" />
                  </div>

                  <div>
                    <p className="text-sm font-DMSans">{contact.name}</p>
                    <span className="text-xs font-DMSans text-[#82F764]">
                      {contact.username}
                    </span>
                  </div>
                </div>

                <button className="w-9 h-9 flex cursor-pointer items-center justify-center rounded-full bg-[#1F2937] hover:bg-[#82F764] hover:text-black text-[#82F764] transition">
                  <Image
                    src={SendImg}
                    alt="Send"
                    width={16}
                    height={16}
                    className="object-contain filter invert opacity-80"
                  />
                </button>
              </div>

              {/* Divider line */}
              {index !== filteredContacts.length - 1 && (
                <div className="h-px bg-white/5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
