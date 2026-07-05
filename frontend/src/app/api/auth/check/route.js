import { baseurl } from "@/config/baseurl";

export async function GET(request) {
  const cookie = request.headers.get("cookie") || "";

  const res = await fetch(`${baseurl}/userRoutes/check`, {
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { cookie }),
    },
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
