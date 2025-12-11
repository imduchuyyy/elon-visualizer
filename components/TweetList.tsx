import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tweet } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { ExternalLink } from "lucide-react"

interface TweetListProps {
    tweets: Tweet[]
}

export function TweetList({ tweets }: TweetListProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Tweets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {tweets.map((tweet) => (
                        <div
                            key={tweet.id}
                            className="flex flex-col space-y-2 border-b pb-4 last:border-0"
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium leading-none text-muted-foreground">
                                    {format(parseISO(tweet.createdAt), "MMM d, yyyy • h:mm a")}
                                </p>
                                <a
                                    href={tweet.content.match(/https:\/\/t\.co\/\w+/)?.[0] || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                >
                                    View <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <p className="text-sm">{tweet.content}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
