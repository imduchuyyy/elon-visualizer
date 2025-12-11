import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tweet } from "@/lib/api"
import { useMemo } from "react"

interface ContentAnalysisProps {
    tweets: Tweet[]
}

export function ContentAnalysis({ tweets }: ContentAnalysisProps) {
    const analysis = useMemo(() => {
        const mentions: Record<string, number> = {}
        const hashtags: Record<string, number> = {}

        tweets.forEach((tweet) => {
            const mentionMatches = tweet.content.match(/@\w+/g) || []
            const hashtagMatches = tweet.content.match(/#\w+/g) || []

            mentionMatches.forEach((m) => {
                mentions[m] = (mentions[m] || 0) + 1
            })
            hashtagMatches.forEach((h) => {
                hashtags[h] = (hashtags[h] || 0) + 1
            })
        })

        const topMentions = Object.entries(mentions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)

        const topHashtags = Object.entries(hashtags)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)

        return { topMentions, topHashtags }
    }, [tweets])

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Content Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-2">Top Mentions</h4>
                    <div className="space-y-1">
                        {analysis.topMentions.map(([mention, count]) => (
                            <div key={mention} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{mention}</span>
                                <span className="font-bold">{count}</span>
                            </div>
                        ))}
                        {analysis.topMentions.length === 0 && (
                            <p className="text-sm text-muted-foreground">No mentions found.</p>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2">Top Hashtags</h4>
                    <div className="space-y-1">
                        {analysis.topHashtags.map(([hashtag, count]) => (
                            <div key={hashtag} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{hashtag}</span>
                                <span className="font-bold">{count}</span>
                            </div>
                        ))}
                        {analysis.topHashtags.length === 0 && (
                            <p className="text-sm text-muted-foreground">No hashtags found.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
