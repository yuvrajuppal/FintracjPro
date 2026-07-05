import { baseurl } from "@/config/baseurl";

export async function POST(request) {
  const cookie = request.headers.get("cookie") || "";
  const body = await request.json();

  const res = await fetch(`${baseurl}/userRoutes/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { cookie }),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  const setCookie = res.headers.get("set-cookie");

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      ...(setCookie && { "Set-Cookie": setCookie }),
    },
  });
}
