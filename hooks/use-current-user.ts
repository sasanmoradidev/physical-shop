"use client";

import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (!res.ok) return null;
        
        // خواندن متنی و بررسی خالی نبودن پاسخ قبل از پارس کردن JSON
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return {
    user,
    loading,
  };
}