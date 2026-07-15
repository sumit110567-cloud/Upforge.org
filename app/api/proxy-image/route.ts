import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  // Basic security validation: check if it's a valid http or https url
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return new NextResponse("Invalid url parameter", { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // Cache for 1 day, revalidate up to 7 days
        "Access-Control-Allow-Origin": "*", // Allow all origins for CORS
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    })
  } catch (error: any) {
    console.error("Proxy image error:", error)
    return new NextResponse(`Error proxying image: ${error.message}`, { status: 500 })
  }
}
