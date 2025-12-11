"use client"

import { useState, useMemo, useEffect } from "react"
import { Tweet } from "@/lib/api"
import { format, addDays, startOfDay, isFriday, isTuesday, setHours, setMinutes, setSeconds, isAfter, isBefore, subDays, differenceInSeconds } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { cn } from "@/lib/utils"

interface MarketAnalyticsProps {
    tweets: Tweet[]
    timezone: "local" | "austin"
}

interface Market {
    id: string
    startDate: Date
    endDate: Date
    label: string
}

export function MarketAnalytics({ tweets, timezone }: MarketAnalyticsProps) {
    const [selectedMarketId, setSelectedMarketId] = useState<string>("")
    const [now, setNow] = useState(new Date())

    // Update "now" every second for the countdown
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const markets = useMemo<Market[]>(() => {
        const generatedMarkets: Market[] = []
        // Determine "now" in UTC or simple local date for calculation?
        // Polymarket markets end at 12:00 PM ET (17:00 UTC) on Tue/Fri usually.
        // Let's generate the next 3 market end dates relative to NOW.

        let candidate = new Date()
        // Align candidate to a previous point to start searching
        candidate = subDays(candidate, 1) // Start looking from yesterday just in case

        let count = 0
        while (count < 3) {
            candidate = addDays(candidate, 1)
            // Check if candidate is Tue or Fri
            if (isFriday(candidate) || isTuesday(candidate)) {
                // Set time to 12:00 PM ET -> 17:00 UTC
                // Using a simplified logic: Set to 17:00 UTC of that day
                const endDate = new Date(Date.UTC(candidate.getFullYear(), candidate.getMonth(), candidate.getDate(), 17, 0, 0))

                // If this market ends in the future (or very recently), include it
                // User logic: "when time pass Dec 12, Dec 5-12 can be removed"
                // So include if endDate > now
                if (isAfter(endDate, now)) {
                    const startDate = subDays(endDate, 7)
                    // Ensure label is formatted in ET (Polymarket logic), so Dec 12 17:00 UTC shows as Dec 12
                    const zonedEndDate = toZonedTime(endDate, "America/New_York")

                    generatedMarkets.push({
                        id: endDate.toISOString(),
                        startDate,
                        endDate,
                        label: format(zonedEndDate, "MMM d EEE")
                    })
                    count++
                }
            }
        }
        return generatedMarkets
    }, []) // Empty dependency array? No, "now" changes, but we don't want to re-gen markets every second.
    // Actually, we want to re-gen if "now" crosses a market boundary. 
    // Ideally we generate based on a stable "today".
    // Let's rely on initial mount or re-calc rarely.

    useEffect(() => {
        if (!selectedMarketId && markets.length > 0) {
            setSelectedMarketId(markets[0].id)
        }
    }, [markets, selectedMarketId])


    const selectedMarket = markets.find(m => m.id === selectedMarketId)

    if (!selectedMarket) return null

    // Filter tweets for this market
    const marketTweets = tweets.filter(t => {
        const tweetDate = new Date(t.createdAt)
        return isAfter(tweetDate, selectedMarket.startDate) && isBefore(tweetDate, selectedMarket.endDate)
    })

    // Calculate Metrics
    const tweetCount = marketTweets.length
    const totalDurationSeconds = differenceInSeconds(selectedMarket.endDate, selectedMarket.startDate)
    const elapsedSeconds = differenceInSeconds(now, selectedMarket.startDate)
    const progress = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100))

    // Pace: Projected tweets
    // If progress is 0, Pace is 0.
    const pace = progress > 0 ? Math.round((tweetCount / progress) * 100) : 0

    // Time Left
    const secondsLeft = Math.max(0, differenceInSeconds(selectedMarket.endDate, now))
    const d = Math.floor(secondsLeft / (3600 * 24))
    const h = Math.floor((secondsLeft % (3600 * 24)) / 3600)
    const m = Math.floor((secondsLeft % 3600) / 60)
    const s = Math.floor(secondsLeft % 60)
    const timeLeftString = `${d} Days ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

    return (
        <div className="w-full bg-black/90 p-4 rounded-xl border border-gray-800 space-y-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg w-full overflow-x-auto no-scrollbar">
                {markets.map(market => (
                    <button
                        key={market.id}
                        onClick={() => setSelectedMarketId(market.id)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all min-w-[100px] whitespace-nowrap flex-shrink-0",
                            selectedMarketId === market.id
                                ? "bg-gray-800 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        {market.label}
                    </button>
                ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 md:gap-8 px-2 md:px-4">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1">Tweet count</span>
                    <span className="text-2xl md:text-3xl font-bold text-white">{tweetCount}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1">Time left</span>
                    <span className="text-xl md:text-2xl font-mono text-white whitespace-nowrap">{timeLeftString}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-6 md:h-8 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full flex items-center px-2 md:px-4 transition-all duration-500"
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #ff4d4d 0%, #ffff00 50%, #4da6ff 100%)'
                    }}
                >
                    <span className="text-[10px] md:text-xs font-bold text-black whitespace-nowrap ml-auto">
                        {progress.toFixed(1)}%
                    </span>
                </div>
                <div className="absolute top-0 right-0 h-full flex items-center px-2 md:px-4">
                    {/* Show pace on the right side if progress allows, or just overlay it properly */}
                    <span className="text-[10px] md:text-xs font-bold text-white z-10 drop-shadow-md">
                        Pace: {pace}
                    </span>
                </div>
            </div>

            {/* Days strip */}
            <div className="flex justify-between px-2 text-[10px] text-gray-500 uppercase font-medium">
                {/*  This is static in the image "Fri Sat Sun..." but it should probably match the market start day dynamically? 
                    The image shows 7 days. Market is 7 days.
                    Let's generate the days based on the selected market start date.
                 */}
                {Array.from({ length: 7 }).map((_, i) => {
                    const d = addDays(selectedMarket.startDate, i)
                    return <span key={i}>{format(d, "EEE")}</span>
                })}
                <span>{format(selectedMarket.endDate, "EEE")}</span>
            </div>
        </div>
    )
}
