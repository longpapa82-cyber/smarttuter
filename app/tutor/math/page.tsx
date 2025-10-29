// Server Component wrapper to force dynamic rendering
export const dynamic = 'force-dynamic';

import MathTutorPage from './page.client';

export default function ServerWrapper() {
  return <MathTutorPage />;
}
