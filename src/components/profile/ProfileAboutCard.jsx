import { Link } from 'react-router-dom';

function Row({ icon, children }) {
  return (
    <div className="flex items-start gap-3 text-[15px] text-gray-800 dark:text-gray-200">
      <span className="w-5 text-center mt-0.5">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export default function ProfileAboutCard({ user, isOwner }) {
  const hasPersonalDetails = user.location || user.birthday;
  const hasWork = user.work || user.profession;

  return (
    <aside className="w-full lg:w-[300px] flex-shrink-0 space-y-4">
      {/* Personal details */}
      <div className="card p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">Personal details</h3>

        {!hasPersonalDetails && (
          <p className="text-sm text-gray-400 mb-2">
            {isOwner ? 'Add your city and birthday.' : 'No details added yet.'}
          </p>
        )}

        <div className="space-y-2.5">
          {user.location && <Row icon="📍">Lives in {user.location}</Row>}
          {user.birthday && <Row icon="🎂">{user.birthday}</Row>}
        </div>

        {isOwner && (
          <Link
            to="/dashboard/settings"
            className="inline-block mt-3 text-sm font-semibold text-brand-600 hover:underline"
          >
            See more personal details
          </Link>
        )}
      </div>

      {/* Links */}
      {(user.website || isOwner) && (
        <div className="card p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">Links</h3>
          {user.website ? (
            <Row icon="🔗">
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline break-all"
              >
                {user.website}
              </a>
            </Row>
          ) : (
            <p className="text-sm text-gray-400">Add a website or social link.</p>
          )}
        </div>
      )}

      {/* Work */}
      {(hasWork || isOwner) && (
        <div className="card p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">Work</h3>
          {hasWork ? (
            <Row icon="💼">
              <span className="font-medium">{user.work || user.profession}</span>
              {user.work && user.profession && (
                <span className="block text-gray-500 dark:text-gray-400 text-sm">{user.profession}</span>
              )}
            </Row>
          ) : (
            <p className="text-sm text-gray-400">Add a workplace.</p>
          )}
        </div>
      )}
    </aside>
  );
}
