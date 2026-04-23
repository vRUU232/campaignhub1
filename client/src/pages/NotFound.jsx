import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../components/ui/Button';

// Custom 404 page displayed when users navigate to an invalid URL
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf6f1] px-4">
      <div className="text-center max-w-md">
        {/* 404 heading with branded styling */}
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-[#f6efe6]">
          <Search className="h-12 w-12 text-[#f3a76a]" />
        </div>

        <h1 className="font-['Outfit'] text-[5rem] font-bold leading-none tracking-[-0.04em] text-[#1f172f]">
          404
        </h1>

        <h2 className="mt-2 text-xl font-semibold text-[#1f172f]">
          Page not found
        </h2>

        <p className="mt-3 text-[#6f677b] leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        {/* Navigation actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button icon={Home}>Back to Home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" icon={ArrowLeft}>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
