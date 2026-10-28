import type { Metadata } from "next";
import TestRunner from "@/components/TestRunner";

export const metadata: Metadata = { title: "테스트" };

export default function TestPage() {
  return <TestRunner />;
}
