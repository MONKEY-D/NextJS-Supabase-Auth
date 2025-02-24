"use client";

import { useEffect, useState } from "react";

export default function ClientComponent() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      setUser(null);
    }
    getUser();
  }, []);

  return <h2>{user?.email}</h2>;
}