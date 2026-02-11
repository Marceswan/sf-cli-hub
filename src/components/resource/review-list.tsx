import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: Date;
  userId: string;
  userName: string | null;
  userImage: string | null;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-text-muted text-sm py-8">
        No reviews yet. Be the first to leave one!
      </p>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-bg-card border border-border rounded-card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg-surface border border-border flex items-center justify-center text-xs font-bold">
                {review.userName?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <span className="font-medium text-sm">
                  {review.userName || "Anonymous"}
                </span>
                <span className="text-text-muted text-xs ml-2">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
            <StarRating rating={review.rating} size={14} />
          </div>
          {review.title && (
            <h4 className="font-semibold mb-1">{review.title}</h4>
          )}
          {review.body && (
            <p className="text-text-muted text-sm">{review.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}
