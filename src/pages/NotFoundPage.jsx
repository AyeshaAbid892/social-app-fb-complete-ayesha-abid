import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="max-w-sm mx-auto py-24 px-4 text-center">
      <p className="text-6xl mb-4">🧭</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Back to Feed</Button>
      </Link>
    </div>
  );
}
