"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">
        خطایی رخ داد
      </h1>

      <p className="mt-4">
        لطفاً دوباره تلاش کنید.
      </p>

      <button
        onClick={() => reset()}
        className="border px-4 py-2 mt-4"
      >
        تلاش مجدد
      </button>
    </div>
  );
}