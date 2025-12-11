"use client"

import { useState, useEffect } from "react"
import { X, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import QRCode from "react-qr-code"

export function DonationPopup() {
    const [isOpen, setIsOpen] = useState(true)
    const [copied, setCopied] = useState(false)

    // Replace this with your actual wallet address
    const WALLET_ADDRESS = "0x4fff0f708c768a46050f9b96c46c265729d1a62f"

    useEffect(() => {
        // Show popup every 5 minutes (300,000 ms)
        const timer = setInterval(() => {
            setIsOpen(true)
        }, 5 * 60 * 1000)

        // Initial show after 5 minutes? Or immediately? 
        // "Show popup every 5 minutes", usually implies an interval.
        // Let's stick to interval. 

        return () => clearInterval(timer)
    }, [])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(WALLET_ADDRESS)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy", err)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-[#0d1623] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 space-y-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-white">Support Free Tool</h2>
                        <p className="text-sm text-gray-400">
                            If you make money with this tool, please consider supporting me.
                        </p>
                    </div>

                    <div className="flex justify-center p-4 bg-white rounded-xl w-fit mx-auto">
                        <QRCode
                            value={WALLET_ADDRESS}
                            size={160}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-2">
                        <div className="flex items-center gap-2">
                            <code className="text-sm text-blue-400 font-mono break-all bg-blue-950/30 px-2 py-1 rounded">
                                {WALLET_ADDRESS}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className={cn(
                                    "p-2 rounded-md transition-colors shrink-0",
                                    copied
                                        ? "bg-green-500/20 text-green-500"
                                        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                                )}
                                title="Copy Address"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>

                {/* ProgressBar to auto-close? Optional. */}
            </div>
        </div>
    )
}
