import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useFriends } from '../hooks/useFriends';
import PageWithSidebar from '../components/layout/PageWithSidebar';

function InsightCard({ label, value, icon }) {
  return (
    <div className="card p-4 flex-1 min-w-[140px]">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

/** A small real (not decorative) line chart of post activity over the last 14 days. */
function ActivityChart({ points }) {
  const width = 600;
  const height = 140;
  const max = Math.max(1, ...points);
  const stepX = width / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - (p / max) * (height - 20) - 10;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-brand-500"
      />
      {coords.map((c, i) => {
        const [x, y] = c.split(',');
        return <circle key={i} cx={x} cy={y} r="2.5" className="fill-brand-600" />;
      })}
    </svg>
  );
}

export default function ProfessionalDashboardPage() {
  const { currentUser } = useAuth();
  const { getUserPosts, getLikesForPost, getCommentsForPost, version: postsVersion } = usePosts();
  const { getFriendIds, version: friendsVersion } = useFriends();

  const myPosts = useMemo(
    () => getUserPosts(currentUser.id),
    [getUserPosts, currentUser.id, postsVersion]
  );
  const friendCount = useMemo(
    () => getFriendIds(currentUser.id).length,
    [getFriendIds, currentUser.id, friendsVersion]
  );

  const totals = useMemo(() => {
    let views = 0;
    let engagement = 0;
    for (const post of myPosts) {
      views += post.views || 0;
      engagement += getLikesForPost(post.id).length + getCommentsForPost(post.id).length;
    }
    return { views, engagement };
  }, [myPosts, getLikesForPost, getCommentsForPost]);

  // Real post-count-per-day for the last 14 days, derived from actual createdAt timestamps.
  const chartPoints = useMemo(() => {
    const days = 14;
    const buckets = new Array(days).fill(0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const post of myPosts) {
      const created = new Date(post.createdAt);
      created.setHours(0, 0, 0, 0);
      const diffDays = Math.round((now - created) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < days) {
        buckets[days - 1 - diffDays] += 1;
      }
    }
    return buckets;
  }, [myPosts]);

  const latestPost = myPosts[0];
  const latestPostEngagement = latestPost
    ? getLikesForPost(latestPost.id).length + getCommentsForPost(latestPost.id).length
    : 0;

  // Mini 4-day planner starting today, using real post dates.
  const plannerDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayPosts = myPosts.filter((p) => {
        const created = new Date(p.createdAt);
        return created.toDateString() === d.toDateString();
      });
      return { date: d, count: dayPosts.length };
    });
  }, [myPosts]);

  return (
    <PageWithSidebar>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Professional Dashboard</h1>
      <p className="text-sm text-gray-500 mb-5">Real metrics derived from your own posts, likes and comments.</p>

      <div className="mb-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Insights</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <InsightCard label="Total Views" value={totals.views} icon="👁️" />
          <InsightCard label="Total Engagement" value={totals.engagement} icon="💬" />
          <InsightCard label="Friends" value={friendCount} icon="👥" />
        </div>
        <div className="card p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Posts created — last 14 days</p>
          <ActivityChart points={chartPoints} />
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Content</h2>
          <Link to="/dashboard/posts" className="text-xs text-brand-600 hover:underline">See all</Link>
        </div>
        {!latestPost ? (
          <div className="card p-6 text-center text-gray-400 text-sm">
            No posts yet — create your first post to see insights here.
          </div>
        ) : (
          <div className="card p-4 flex items-center gap-4">
            {latestPost.image ? (
              <img src={latestPost.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-400 to-indigo-500" />
            )}
            <div className="flex gap-6 text-sm">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{latestPost.views || 0}</p>
                <p className="text-gray-500">Views</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{latestPostEngagement}</p>
                <p className="text-gray-500">Engagement</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Planned Content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {plannerDays.map(({ date, count }, i) => (
            <div key={i} className={`card p-3 text-center ${i === 0 ? 'border-brand-400' : ''}`}>
              <p className="text-xs text-gray-400 mb-1">{date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">{date.getDate()}</p>
              <p className="text-xs text-gray-500">{count > 0 ? `${count} post${count > 1 ? 's' : ''}` : 'No posts'}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWithSidebar>
  );
}
