import React, { useEffect, useState } from "react";

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isDanger, setIsDanger] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = Math.max(0, end - now);
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
      setIsDanger(diff <= 5 * 60 * 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  return <span className={`font-mono text-2xl font-bold ${isDanger ? "text-red-600" : "text-blue-700"}`}>{timeLeft}</span>;
};

export default CountdownTimer;
