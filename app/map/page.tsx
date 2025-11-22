"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import('../components/MapClient'), {
  ssr: false,
});

export default function Page() {
  return <Map />;
}