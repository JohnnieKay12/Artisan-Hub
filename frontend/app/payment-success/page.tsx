"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [message, setMessage] = useState("Verifying payment...");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/verify?reference=${reference}`
        );

        const data = await res.json();

        if (data.success) {
          setMessage("Payment verified successfully 🎉");
        } else {
          setMessage("Payment verification failed");
        }
      } catch (error) {
        setMessage("Payment verification failed");
      }
    };

    verifyPayment();

  }, [reference]);

  // countdown redirect
  useEffect(() => {

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          router.push("/dashboard");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);

  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
    
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md w-full">

        {/* Success Icon */}
        <div className="text-green-500 text-6xl mb-4">
          ✓
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-3">
          Payment Successful
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {message}
        </p>

        {/* Reference */}
        {reference && (
          <p className="text-sm text-gray-500 mb-6">
            Reference: <span className="font-semibold">{reference}</span>
          </p>
        )}

        {/* Redirect countdown */}
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push("/dashboard/bookings")}
            className="border px-5 py-2 rounded-lg hover:bg-gray-100"
          >
            View Bookings
          </button>

        </div>

      </div>

    </div>
  );
}