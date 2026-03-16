"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying payment...");
  const router = useRouter()

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setMessage("Payment reference missing");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/verify?reference=${reference}`
        );

        const data = await res.json();

        if (data.success) {
          setMessage("Payment verified successfully 🎉");
          router.push("/dashboard/bookings");
        } else {
          setMessage("Payment verification failed");
        }

      } catch (error) {
        setMessage("Payment verification failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>{message}</h1>
    </div>
  );
}