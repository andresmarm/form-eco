import { RegisterServiceWorker } from "./_components/RegisterServiceWorker";

export default function ReportarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterServiceWorker />
      {children}
    </>
  );
}
