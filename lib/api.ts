import axios from "axios";

export interface Tweet {
  id: string;
  userId: string;
  platformId: string;
  content: string;
  createdAt: string;
  importedAt: string;
  metrics: null | any; // The API response showed null, using any for now if it changes
}

export interface ApiResponse {
  success: boolean;
  data: Tweet[];
}

export async function fetchElonTweets(startDate?: string, endDate?: string): Promise<Tweet[]> {
  try {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const { data } = await axios.get<ApiResponse>(
      "https://xtracker.polymarket.com/api/users/elonmusk/posts",
      { params }
    );

    if (!data.success) {
      throw new Error("API reported failure");
    }
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error("Axios error fetching tweets:", error.message);
    } else {
        console.error("Error fetching tweets:", error);
    }
    return [];
  }
}
