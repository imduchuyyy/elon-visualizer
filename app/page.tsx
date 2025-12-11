import { Dashboard } from "@/components/Dashboard"
import { fetchElonTweets } from "@/lib/api"
import { subDays } from "date-fns"

export default async function Home() {
  const tweets = await fetchElonTweets()

  return (
    <main className="min-h-screen bg-background">
      <Dashboard initialTweets={tweets} />
    </main>
  )
}
