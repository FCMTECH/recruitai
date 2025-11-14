"use client";

import dynamic from "next/dynamic";
import { SubscriptionGuard } from "@/components/ui/subscription-guard";

const CreateJobContent = dynamic(() => import("@/components/create-job-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
    </div>
  )
});

export default function CreateJobPage() {
  return (
    <SubscriptionGuard requireActive={true}>
      <CreateJobContent />
    </SubscriptionGuard>
  );
}
