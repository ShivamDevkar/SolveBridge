import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api';

interface Review {
  id: string;
  jobId: string;
  professionalName: string;
  ratings: {
    overall: number;
    quality: number;
    professionalism: number;
    timeliness: number;
    value: number;
  };
  comment: string | null;
  response: { text: string; createdAt: string } | null;
  createdAt: string;
}

export function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ data: { reviews: Review[] } }>('/api/v1/reviews/mine')
      .then((response) => {
        if (mounted) setReviews(response.data.reviews);
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <Link
        to="/customer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading reviews...</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-700">{error}</p>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">You have not submitted any reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.professionalName}</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" /> {review.ratings.overall}/5
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-700">&ldquo;{review.comment}&rdquo;</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                  <span>Quality: <strong>{review.ratings.quality}</strong></span>
                  <span>Professionalism: <strong>{review.ratings.professionalism}</strong></span>
                  <span>Punctuality: <strong>{review.ratings.timeliness}</strong></span>
                  <span>Value: <strong>{review.ratings.value}</strong></span>
                </div>
                {review.response && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-700">Professional response</p>
                    <p className="text-xs text-slate-700 mt-1">{review.response.text}</p>
                  </div>
                )}
                <Link
                  to={`/jobs/${review.jobId}`}
                  className="inline-block text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Job
                </Link>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
