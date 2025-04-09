export async function POST(request: Request) {
  const { name, email, image } = await request.json();

  const result = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/user`, {
    method: "POST",
  });
}
