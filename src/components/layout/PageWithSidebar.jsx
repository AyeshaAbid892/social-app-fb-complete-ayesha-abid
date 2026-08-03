import Sidebar from './Sidebar';
import RightRail from './RightRail';
import clsx from 'clsx';

export default function PageWithSidebar({ children, showRightRail = false, fluid = false }) {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
      <Sidebar />
      <div className={clsx('flex-1 min-w-0 w-full', !showRightRail && !fluid && 'max-w-2xl mx-auto')}>
        {children}
      </div>
      {showRightRail && <RightRail />}
    </div>
  );
}
