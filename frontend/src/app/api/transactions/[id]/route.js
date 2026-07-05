import { baseurl } from "@/config/baseurl";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const cookie = request.headers.get("cookie") || "";

  const res = await fetch(`${baseurl}/moneyRoutes/deleteTransaction/${id}`, {
    method: "DELETE",
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
