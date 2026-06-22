import { redirect } from 'next/navigation';

// Root URL redirects immediately to /chat.
// Once Stage 5.2 adds auth, this becomes:
//   isAuthenticated ? redirect('/chat') : redirect('/login')
export default function RootPage() {
  redirect('/chat');
}