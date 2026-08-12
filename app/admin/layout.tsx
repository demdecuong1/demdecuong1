import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

/**
 * Admin layout - only accessible to portal_admin
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Require portal_admin role
  if (!user || user.profile.role !== 'portal_admin') {
    redirect('/cases');
  }

  return <>{children}</>;
}
