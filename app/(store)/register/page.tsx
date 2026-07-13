"use client";

export default function RegisterPage() {
  const register = async () => {
    await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Admin",
        username: "sasan@test.com",
        password: "123456",
        phone: "09363210320",
      }),
    });
  };

  return (
    <button
      onClick={register}
      className="border p-4"
    >
      Register Test
    </button>
  );
}