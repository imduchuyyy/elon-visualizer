"use client"

import { useMemo } from "react"
import { Tweet } from "@/lib/api"
import { format, parseISO, getHours, startOfDay, eachDayOfInterval, min, max } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface HourlyActivityTableProps {
    tweets: Tweet[]
    timezone: "local" | "austin"
}

export function HourlyActivityTable({ tweets, timezone }: HourlyActivityTableProps) {
    const { tableData, hours, dates } = useMemo(() => {
        if (tweets.length === 0) return { tableData: {}, hours: [], dates: [] }

        // Austin timezone IANA identifier
        const timeZone = timezone === "austin" ? "America/Chicago" : Intl.DateTimeFormat().resolvedOptions().timeZone

        const tweetDates = tweets.map(t => toZonedTime(parseISO(t.createdAt), timeZone))
        const minDate = min(tweetDates)
        const maxDate = max(tweetDates)

        // Generate all dates in range
        const allDates = eachDayOfInterval({
            start: startOfDay(minDate),
            end: startOfDay(maxDate)
        }).sort((a, b) => b.getTime() - a.getTime()) // Descending

        const hours = Array.from({ length: 24 }, (_, i) => i)

        const tableData: Record<string, Record<number, number>> = {}

        allDates.forEach(date => {
            const dateKey = format(date, "yyyy-MM-dd")
            tableData[dateKey] = {}
            hours.forEach(h => tableData[dateKey][h] = 0)
        })

        tweets.forEach(t => {
            const date = toZonedTime(parseISO(t.createdAt), timeZone)
            const dateKey = format(date, "yyyy-MM-dd")
            const hour = getHours(date)
            if (tableData[dateKey]) {
                tableData[dateKey][hour] = (tableData[dateKey][hour] || 0) + 1
            }
        })

        return { tableData, hours, dates: allDates }
    }, [tweets, timezone])

    const getColor = (count: number) => {
        if (count === 0) return "bg-[#1e3a5f] text-transparent" // Dark blue-ish for empty
        if (count < 3) return "bg-[#fcd3b6] text-black" // Light beige
        if (count < 7) return "bg-[#faa568] text-black" // Orange
        return "bg-[#f57d2a] text-black" // Darker Orange
    }

    return (
        <Card className="col-span-full bg-[#0d1623] text-white border-none">
            <CardHeader>
                <CardTitle>Tweets (split into hours) - {timezone === "austin" ? "Austin Time" : "Local Time"}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <div className="min-w-[800px] text-xs">
                    {/* Header */}
                    <div className="flex bg-[#112033] border-b border-gray-700">
                        <div className="w-20 p-2 font-bold shrink-0">Date</div>
                        {hours.map(h => (
                            <div key={h} className="flex-1 min-w-[30px] p-2 text-center border-l border-gray-700">
                                {h.toString().padStart(2, '0')}:00
                            </div>
                        ))}
                        <div className="w-12 p-2 text-center border-l border-gray-700 font-bold">Total</div>
                    </div>

                    {/* Rows */}
                    {dates.map(date => {
                        const dateKey = format(date, "yyyy-MM-dd")
                        const dayData = tableData[dateKey] || {}
                        const total = Object.values(dayData).reduce((a, b) => a + b, 0)

                        // Check if this row represents "today" based on the selected timezone
                        const targetTimeZone = timezone === "austin" ? "America/Chicago" : Intl.DateTimeFormat().resolvedOptions().timeZone
                        const nowZoned = toZonedTime(new Date(), targetTimeZone)
                        const isToday = format(nowZoned, "yyyy-MM-dd") === dateKey
                        const currentHour = getHours(nowZoned)

                        return (
                            <div key={dateKey} className="flex border-b border-gray-700 hover:bg-[#1a2d42] transition-colors">
                                <div className="w-20 p-2 font-medium shrink-0 flex items-center bg-[#112033]">
                                    {format(date, "MM-dd")}
                                </div>
                                {hours.map(h => {
                                    const count = dayData[h] || 0
                                    const isNow = isToday && h === currentHour
                                    return (
                                        <div
                                            key={h}
                                            className={cn(
                                                "flex-1 min-w-[30px] p-2 flex items-center justify-center border-l border-gray-700 relative",
                                                getColor(count),
                                                isNow && "ring-2 ring-red-500 ring-inset z-10"
                                            )}
                                            title={isNow ? "Current Time" : undefined}
                                        >
                                            {count > 0 ? count : "-"}
                                            {isNow && (
                                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            )}
                                        </div>
                                    )
                                })}
                                <div className="w-12 p-2 flex items-center justify-center border-l border-gray-700 bg-[#1e3a5f] font-bold">
                                    {total}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
