import { Link } from 'react-router-dom';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Button from '../components/ui/Button';

export default function ComingSoonPage({ title, icon = '🚧', description }) {
  return (
    <PageWithSidebar>
      <div className="card p-10 text-center">
        <p className="text-5xl mb-4">{icon}</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description || 'This screen is on the roadmap for the next build phase.'}
        </p>
        <Link to="/">
          <Button variant="secondary">Back to Feed</Button>
        </Link>
      </div>
    </PageWithSidebar>
  );
}
