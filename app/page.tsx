import { redirect } from 'next/navigation';

/**
 * Root page - redirects to /cases
 */
export default function Home() {
  redirect('/cases');
}
