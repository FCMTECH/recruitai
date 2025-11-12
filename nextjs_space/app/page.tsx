
import dynamic from "next/dynamic";

const HomeContent = dynamic(() => import("@/components/home-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
    </div>
  )
});

export default function HomePage() {
  return <HomeContent />;
}
