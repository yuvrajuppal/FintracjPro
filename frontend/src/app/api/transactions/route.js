import { baseurl } from "@/config/baseurl";

export async function GET(request) {
  const cookie = request.headers.get("cookie") || "";
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";

  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (search) params.set("search", search);
  const qs = params.toString();

  const res = await fetch(`${baseurl}/moneyRoutes/getTransactions${qs ? `?${qs}` : ""}`, {
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { cookie }),
    },
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  const cookie = request.headers.get("cookie") || "";
  const body = await request.json();

  const res = await fetch(`${baseurl}/moneyRoutes/addTransaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { cookie }),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
