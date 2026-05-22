import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mt-2 mb-6">Page not found</p>
      <Button asChild><Link to="/">Go home</Link></Button>
    </div>
  );
}
