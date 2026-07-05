export async function POST() {
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "fintrackerpro_user_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}
