"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { format, parseISO, startOfDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tweet } from "@/lib/api"

interface TimelineChartProps {
    tweets: Tweet[]
}

export function TimelineChart({ tweets }: TimelineChartProps) {
    const data = useMemo(() => {
        const grouped = tweets.reduce((acc, tweet) => {
            const date = format(parseISO(tweet.createdAt), "yyyy-MM-dd")
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(grouped)
            .map(([date, count]) => ({
                date,
                count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
    }, [tweets])

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Tweet Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                                itemStyle={{ color: "#fff" }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#adfa1d"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
