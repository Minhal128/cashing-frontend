"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import LogoImg from "../../public/assets/logo.png";

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnected: () => void;
}

const walletProviders = [
    {
        id: "metamask",
        name: "MetaMask",
        subtitle: "Recommended",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
        supported: true,
    },
    {
        id: "walletconnect",
        name: "WalletConnect",
        icon: "https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png",
        supported: false,
    },
    {
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo-300x300.webp",
        supported: false,
    },
    {
        id: "rainbow",
        name: "Rainbow",
        icon: "https://avatars.githubusercontent.com/u/48327834?s=200&v=4",
        supported: false,
    },
    {
        id: "trustwallet",
        name: "Trust Wallet",
        icon: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
        supported: false,
    },
];

export default function ConnectWalletModal({
    isOpen,
    onClose,
    onConnected,
}: ConnectWalletModalProps) {
    const [connecting, setConnecting] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConnect = async (providerId: string) => {
        const provider = walletProviders.find((p) => p.id === providerId);
        if (!provider?.supported) {
            toast.error(`${provider?.name} coming soon!`);
            return;
        }

        if (providerId === "metamask") {
            if (typeof window === "undefined" || !window.ethereum) {
                toast.error("Please install MetaMask!");
                return;
            }

            setConnecting("metamask");
            try {
                const ethProvider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await ethProvider.send("eth_requestAccounts", []);
                const address = accounts[0];

                // Save to backend
                await api.post("/wallet/payment-methods", {
                    type: "crypto_wallet",
                    provider: "MetaMask",
                    details: address,
                });

                toast.success("Wallet connected!");
                onConnected();
                onClose();
            } catch (error: any) {
                console.error(error);
                toast.error("Connection failed");
            } finally {
                setConnecting(null);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#0a0e1a] border border-[#1e2a3a] shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Wallet List */}
                    <div className="flex-1 p-6">
                        <h2 className="text-xl font-bold text-white font-DMSans mb-6">
                            Connect Your Wallet
                        </h2>

                        <div className="space-y-2">
                            {walletProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => handleConnect(provider.id)}
                                    disabled={connecting === provider.id}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-[#1a2030] transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                                        <img
                                            src={provider.icon}
                                            alt={provider.name}
                                            className="w-7 h-7 object-contain"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-DMSans font-medium text-sm group-hover:text-[#82F764] transition-colors">
                                            {connecting === provider.id
                                                ? "Connecting..."
                                                : provider.name}
                                        </p>
                                        {provider.subtitle && (
                                            <p className="text-xs text-gray-500 font-DMSans">
                                                {provider.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Branding */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0f1625] to-[#0a0e1a] border-l border-[#1e2a3a] relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5 cursor-pointer" />
                        </button>

                        {/* Logo / Bee */}
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
                            Connect your wallet to participate in the presale
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
