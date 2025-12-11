import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  try {
    const { data } = await axios.get(
      "https://xtracker.polymarket.com/api/users/elonmusk/posts",
      { params }
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to Polymarket:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 });
  }
}
