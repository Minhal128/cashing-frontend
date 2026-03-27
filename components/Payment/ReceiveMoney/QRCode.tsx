import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "@/lib/api";

export default function QRCode() {
  const [qrInfo, setQrInfo] = useState<{ qrCode: string; qrDataUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const response = await api.get("/transactions/receive-qr");
        setQrInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch QR code:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, []);

  const paymentLink = qrInfo ? `chaching://pay/${qrInfo.qrCode}` : "";

  return (
    <div className="flex items-center justify-center">
      <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] p-6 text-white shadow-xl">
        {/* Heading */}
        <h2 className="text-center text-xl font-DMSans">
          Your account details
        </h2>
        <p className="mt-1 text-center font-DMSans text-sm text-[#7A869C]">
          Scan the QR code below to receive money
        </p>

        {/* QR Code */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-xl bg-white p-4">
            {loading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-black font-DMSans">Loading...</div>
            ) : (
              <QRCodeCanvas
                value={paymentLink}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-[#1A2338] px-3 py-2">
          <p className="truncate md:text-sm text-xs font-DMSans text-gray-300">
            {loading ? "..." : `${typeof window !== 'undefined' ? window.location.host : 'cha-ching.app'}/pay/${qrInfo?.qrCode}`}
          </p>

          <button
            onClick={() => qrInfo && navigator.clipboard.writeText(paymentLink)}
            className="rounded-lg font-DMSans bg-[#82F764] cursor-pointer px-4 py-3 md:text-sm text-[8.5px] text-black transition"
            disabled={!qrInfo}
          >
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}
