import { LoadingSpinner } from "~/components/loading-spinner";

export default function LoadingPage() {
  return (
    <div className="container flex h-[80vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
