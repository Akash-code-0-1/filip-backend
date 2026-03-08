import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

export interface UserInfo {
  name: string;
  email: string;
  photo?: string;
  city?: string;
  rating?: number;
  reviewsCount?: number;
  verified?: boolean;
  active?: boolean;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;

  fromUser?: UserInfo;
  toUser?: UserInfo;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
};

export const fetchPendingReviews = createAsyncThunk(
  "reviews/fetchPending",
  async () => {
    const q = query(
      collection(firestore, "reviews"),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);

    const reviews: Review[] = [];

    for (const reviewDoc of snap.docs) {
      const data = reviewDoc.data();

      const fromUserDoc = await getDoc(
        doc(firestore, "users", data.fromUserId)
      );

      const toUserDoc = await getDoc(
        doc(firestore, "users", data.toUserId)
      );

      const fromUserData = fromUserDoc.data();
      const toUserData = toUserDoc.data();

      reviews.push({
        id: reviewDoc.id,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        rating: data.rating,
        text: data.text,
        status: data.status,
        createdAt: data.createdAt,

        fromUser: {
          name: fromUserData?.profile?.name ?? "Unknown",
          email: fromUserData?.email ?? "",
          photo: fromUserData?.profile?.photo,
          city: fromUserData?.profile?.city,
          rating: fromUserData?.profile?.rating,
          reviewsCount: fromUserData?.profile?.reviewsCount,
          verified: fromUserData?.verified,
          active: fromUserData?.active,
        },

        toUser: {
          name: toUserData?.profile?.name ?? "Unknown",
          email: toUserData?.email ?? "",
          photo: toUserData?.profile?.photo,
          city: toUserData?.profile?.city,
          rating: toUserData?.profile?.rating,
          reviewsCount: toUserData?.profile?.reviewsCount,
          verified: toUserData?.verified,
          active: toUserData?.active,
        },
      });
    }

    return reviews;
  }
);

export const updateReviewStatus = createAsyncThunk(
  "reviews/updateStatus",
  async ({
    reviewId,
    status,
  }: {
    reviewId: string;
    status: "approved" | "rejected";
  }) => {
    const ref = doc(firestore, "reviews", reviewId);
    

    // await updateDoc(ref, { status });

    await updateDoc(ref, {
      status,
      ...(status === 'approved' && { isRevealed: true }),
    });

    // ADD after updateDoc — only on approve:
    if (status === 'approved') {
      const reviewData = (await getDoc(ref)).data();
      const toUserId = reviewData?.toUserId;

      const snap = await getDocs(
        query(
          collection(firestore, 'reviews'),
          where('toUserId', '==', toUserId),
          where('status', '==', 'approved'),
        )
      );

      if (!snap.empty) {
        const total = snap.docs.reduce((sum, d) => sum + (d.data().rating ?? 0), 0);
        const avg = parseFloat((total / snap.docs.length).toFixed(1));
        await updateDoc(doc(firestore, 'users', toUserId), {
          'profile.rating': avg,
          'profile.reviewsCount': snap.docs.length,
        });
      }
    }

    return { reviewId };
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPendingReviews.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPendingReviews.fulfilled, (state, action) => {
      state.loading = false;
      state.reviews = action.payload;
    });

    builder.addCase(updateReviewStatus.fulfilled, (state, action) => {
      state.reviews = state.reviews.filter(
        (r) => r.id !== action.payload.reviewId
      );
    });
  },
});

export default reviewsSlice.reducer;