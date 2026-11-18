import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquareText, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api';

interface Review {
  id: string;
  jobId: string;
  customerName: string;
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

interface ReviewsResponse {
  reviews: Review[];
  summary: {
    averageRating: number;
    totalReviews: number;
    breakdown: {
      quality: number;
      professionalism: number;
      timeliness: number;
      value: number;
    };
  };
}

export function ProReviewsPage() {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: ReviewsResponse }>('/api/v1/reviews/mine')
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500 p-6">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700 p-6">{error}</p>;
  }

  const reviews = data?.reviews ?? [];
  const summary = data?.summary;

  return (
    <div className="space-y-5">
      <Link
        to="/pro/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Overall', summary?.averageRating ?? 0],
          ['Quality', summary?.breakdown.quality ?? 0],
          ['Professionalism', summary?.breakdown.professionalism ?? 0],
          ['Punctuality', summary?.breakdown.timeliness ?? 0],
          ['Value', summary?.breakdown.value ?? 0],
        ].map(([label, rating]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase font-bold text-slate-500">{String(label)}</p>
              <p className="text-xl font-bold text-slate-900 flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {Number(rating).toFixed(1)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-blue-600" />
            Customer Reviews ({summary?.totalReviews ?? reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No customer reviews yet.
            </p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.customerName}</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {review.ratings.overall}/5
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    ['Quality', review.ratings.quality],
                    ['Professionalism', review.ratings.professionalism],
                    ['Punctuality', review.ratings.timeliness],
                    ['Value', review.ratings.value],
                  ].map(([label, rating]) => (
                    <span key={String(label)} className="px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-600">
                      {String(label)}: <strong className="text-slate-900">{String(rating)}</strong>
                    </span>
                  ))}
                </div>
                <Link
                  to={`/jobs/${review.jobId}/review`}
                  className="inline-block text-xs font-semibold text-blue-600 hover:underline"
                >
                  View job review
                </Link>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
