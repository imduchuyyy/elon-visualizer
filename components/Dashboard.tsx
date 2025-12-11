"use client"

import { useState } from "react"
import { Tweet } from "@/lib/api"
import { MarketAnalytics } from "./MarketAnalytics"
import { StatsCard } from "./StatsCard"
import { TimelineChart } from "./TimelineChart"
import { TweetList } from "./TweetList"
import { ContentAnalysis } from "./ContentAnalysis"
import { HourlyActivityTable } from "./HourlyActivityTable"
import { MessageSquare, Repeat, Share2, TrendingUp } from "lucide-react"

import { DonationPopup } from "./DonationPopup"

interface DashboardProps {
    initialTweets: Tweet[]
}

export function Dashboard({ initialTweets }: DashboardProps) {
    const [tweets] = useState<Tweet[]>(initialTweets)
    const [timezone, setTimezone] = useState<"local" | "austin">("local")

    const totalTweets = tweets.length
    const retweets = tweets.filter((t) => t.content.startsWith("RT ")).length
    const originalTweets = totalTweets - retweets
    // Estimate engagement (this is a placeholder as metrics are null in the sample)
    // We can calculate avg length instead
    const avgLength = Math.round(
        tweets.reduce((acc, t) => acc + t.content.length, 0) / totalTweets
    )

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
            {/* Donation Banner */}
            <div className="bg-blue-900/30 border border-blue-800 text-blue-100 px-4 py-2 rounded-lg text-center text-sm md:text-base flex flex-col md:flex-row items-center justify-center gap-2">
                <span className="font-semibold">If you make money with this tool, please consider supporting me.</span>
                <span className="flex items-center gap-2 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/50 font-mono text-xs md:text-sm break-all">
                    0x4fff0f708c768a46050f9b96c46c265729d1a62f
                </span>
            </div>

            <DonationPopup />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Elon Musk Tracker</h1>
                <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg border w-fit">
                    <button
                        onClick={() => setTimezone("local")}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timezone === "local"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:bg-background/50"
                            }`}
                    >
                        Local Time
                    </button>
                    <button
                        onClick={() => setTimezone("austin")}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timezone === "austin"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:bg-background/50"
                            }`}
                    >
                        Austin, TX
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Posts"
                    value={totalTweets}
                    icon={MessageSquare}
                    description="Total tweets"
                />
                <StatsCard
                    title="Original Tweets"
                    value={originalTweets}
                    icon={TrendingUp}
                    description="Non-retweets"
                />
                <StatsCard
                    title="Retweets"
                    value={retweets}
                    icon={Repeat}
                    description="Shared content"
                />
                <StatsCard
                    title="Avg Length"
                    value={avgLength}
                    icon={Share2}
                    description="Characters per tweet"
                />
            </div>

            <div className="col-span-full">
                <MarketAnalytics tweets={tweets} timezone={timezone} />
            </div>

            <div className="col-span-1">
                <HourlyActivityTable tweets={tweets} timezone={timezone} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <TimelineChart tweets={tweets} />
                <ContentAnalysis tweets={tweets} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-7">
                    <TweetList tweets={tweets} />
                </div>
            </div>
        </div>
    )
}
