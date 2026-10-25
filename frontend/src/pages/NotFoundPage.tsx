import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-slate-200 shadow-elevated bg-white">
        <CardHeader>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-2">
            <FileQuestion className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">404 — Page Not Found</CardTitle>
          <CardDescription className="text-slate-600">
            The requested route does not exist in the SolveBid application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-500">
            Please check the URL or use one of the navigation links below.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/">
              <Button variant="primary" size="sm" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Homepage
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="sm" className="w-full">
                About SolveBid
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
