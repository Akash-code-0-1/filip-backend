import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, CheckCircle } from "lucide-react";
import {
  fetchPendingReviews,
  updateReviewStatus,
  Review,
} from "../../store/features/reviewsSlice";
import type { RootState, AppDispatch } from "../../store";

export default function ReviewModeration() {
  const dispatch = useDispatch<AppDispatch>();

  const { reviews, loading } = useSelector(
    (state: RootState) => state.reviews
  );

  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    dispatch(fetchPendingReviews());
  }, [dispatch]);

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-[2px]">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < rating ? "#FBB040" : "none"}
            color={i < rating ? "#FBB040" : "#555"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#1f1f1f] rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Pending Reviews</h2>

      {loading && <p className="text-gray-400">Loading...</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => setSelected(review)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl cursor-pointer hover:border-[#FBB040] transition"
          >
            {/* Reviewer */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  review.fromUser?.photo ||
                  "https://ui-avatars.com/api/?name=User"
                }
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  {review.fromUser?.name}

                  {review.fromUser?.verified && (
                    <CheckCircle size={12} color="#FBB040" />
                  )}
                </p>

                <p className="text-xs text-gray-400">
                  {review.fromUser?.email}
                </p>
              </div>
            </div>

            {/* Target */}
            <p className="text-xs text-gray-500 mb-2">
              → Reviewing{" "}
              <span className="text-gray-300">
                {review.toUser?.name}
              </span>
            </p>

            {/* Rating */}
            <div className="mb-2">{renderStars(review.rating)}</div>

            {/* Text */}
            <p className="text-gray-300 text-sm line-clamp-2">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-3xl">

            <h3 className="text-xl font-semibold mb-5">
              Review Details
            </h3>

            <div className="grid md:grid-cols-2 gap-8">

              {/* REVIEWER */}
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">

                <h4 className="text-sm text-gray-400 mb-3">
                  Reviewer
                </h4>

                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      selected.fromUser?.photo ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {selected.fromUser?.name}

                      {selected.fromUser?.verified && (
                        <CheckCircle size={14} color="#FBB040" />
                      )}
                    </p>

                    <p className="text-xs text-gray-400">
                      {selected.fromUser?.email}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400">
                  City: {selected.fromUser?.city || "Unknown"}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  {renderStars(selected.fromUser?.rating)}
                  <span className="text-xs text-gray-400">
                    ({selected.fromUser?.reviewsCount})
                  </span>
                </div>

                <p className="text-sm text-gray-400 mt-1">
                  Active: {selected.fromUser?.active ? "Yes" : "No"}
                </p>
              </div>

              {/* TARGET USER */}
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">

                <h4 className="text-sm text-gray-400 mb-3">
                  Reviewed User
                </h4>

                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      selected.toUser?.photo ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {selected.toUser?.name}

                      {selected.toUser?.verified && (
                        <CheckCircle size={14} color="#FBB040" />
                      )}
                    </p>

                    <p className="text-xs text-gray-400">
                      {selected.toUser?.email}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400">
                  City: {selected.toUser?.city || "Unknown"}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  {renderStars(selected.toUser?.rating)}
                  <span className="text-xs text-gray-400">
                    ({selected.toUser?.reviewsCount})
                  </span>
                </div>

                <p className="text-sm text-gray-400 mt-1">
                  Active: {selected.toUser?.active ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* REVIEW TEXT */}
            <div className="mt-6 border-t border-[#2a2a2a] pt-4">

              <div className="flex items-center gap-2 mb-2">
                {renderStars(selected.rating)}
              </div>

              <p className="text-gray-300">{selected.text}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  dispatch(
                    updateReviewStatus({
                      reviewId: selected.id,
                      status: "approved",
                    })
                  );
                  setSelected(null);
                }}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition"
              >
                Approve
              </button>

              <button
                onClick={() => {
                  dispatch(
                    updateReviewStatus({
                      reviewId: selected.id,
                      status: "rejected",
                    })
                  );
                  setSelected(null);
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
              >
                Reject
              </button>

              <button
                onClick={() => setSelected(null)}
                className="ml-auto text-gray-400 hover:text-gray-200"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}