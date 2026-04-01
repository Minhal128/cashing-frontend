"use client";

import { X } from "lucide-react";
import Image from "next/image";
import LogoImg from "../../public/assets/logo.png";
import { useConnectCryptoWallet } from "@/lib/reown/useConnectCryptoWallet";

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnected: () => void;
}

export default function ConnectWalletModal({
    isOpen,
    onClose,
    onConnected,
}: ConnectWalletModalProps) {
    const { connectAndLinkWallet, isLinking } = useConnectCryptoWallet();

    if (!isOpen) return null;

    const handleConnect = async () => {
        try {
            await connectAndLinkWallet();
            onConnected();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#0a0e1a] border border-[#1e2a3a] shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                        <h2 className="text-xl font-bold text-white font-DMSans mb-2">
                            Connect Your Wallet
                        </h2>
                        <p className="text-sm text-gray-400 font-DMSans mb-6">
                            Powered by Reown AppKit. Connect MetaMask, WalletConnect,
                            Coinbase Wallet, Rainbow, Trust Wallet and more.
                        </p>

                        <button
                            onClick={handleConnect}
                            disabled={isLinking}
                            className="w-full rounded-xl bg-[#82F764] text-black font-DMSans font-semibold px-4 py-3 cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isLinking ? "Connecting..." : "Open Wallet Connector"}
                        </button>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {[
                                "MetaMask",
                                "WalletConnect",
                                "Coinbase",
                                "Rainbow",
                                "Trust Wallet",
                            ].map((wallet) => (
                                <span
                                    key={wallet}
                                    className="text-xs font-DMSans text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1"
                                >
                                    {wallet}
                                </span>
                            ))}
            </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0f1625] to-[#0a0e1a] border-l border-[#1e2a3a] relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5 cursor-pointer" />
                        </button>

                        <div className="mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#82F764]/20 to-[#3A6FF9]/20 flex items-center justify-center">
                                <Image
                                    src={LogoImg}
                                    alt="Caching"
                                    width={60}
                                    height={60}
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white font-DMSans mb-2">
                            CACHING Token
                        </h3>
                        <p className="text-sm text-gray-400 font-DMSans text-center max-w-xs">
                            Connect your wallet with Reown and keep your linked crypto address
                            synced securely.
                        </p>
                    </div>
        </div>
            </div>
        </div>
    );
}
