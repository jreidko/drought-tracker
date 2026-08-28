import AppChrome from "@/app/components/AppChrome";
import ReportGallery from "@/app/components/gallery/ReportGallery";

export default function Home() {
  return (
    <AppChrome
      title="chalk/dog"
      subtitle="Player reports"
      footer={
        <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-muted">
          Stats from public league APIs. Live reports refresh every 15 minutes.
        </p>
      }
    >
      <ReportGallery />
    </AppChrome>
  );
}
