import { useState, useEffect, type ChangeEvent } from "react";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Upload } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, firestore } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateProfileInfo,
  updateProfilePicture,
} from "../store/features/adminSlice";
import {
  updateUserPassword,
  resetPasswordState,
} from "../store/features/updatePasswordSlice";

// Tab options
const tabs = ["Profile", "Security"];

// Typed Redux state
interface RootState {
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture: string;
  };
  password: {
    loading: boolean;
    success: boolean;
    error: string | null;
  };
}

// Typed useSelector
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function SettingsPage() {
  const dispatch = useDispatch(); // useDispatch correctly
  const navigate = useNavigate();

  const admin = useTypedSelector((state) => state.admin);
  const { loading, success, error } = useTypedSelector((state) => state.password);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile");

  const [firstName, setFirstName] = useState(admin.firstName || "");
  const [lastName, setLastName] = useState(admin.lastName || "");
  const [email, setEmail] = useState(admin.email || "");
  const [phone, setPhone] = useState(admin.phone || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch admin data
  useEffect(() => {
    const fetchAdmin = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const adminRef = doc(firestore, "admin", uid);
      const snapshot = await getDoc(adminRef);

      if (snapshot.exists()) {
        dispatch(updateProfileInfo(snapshot.data()));
        dispatch(updateProfilePicture(snapshot.data().profilePicture));
      }
    };
    fetchAdmin();
  }, [dispatch]);

  // Profile image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const storage = getStorage();
    const storageRef = ref(storage, `admin/${uid}-${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      dispatch(updateProfilePicture(downloadURL));

      const adminRef = doc(firestore, "admin", uid);
      await updateDoc(adminRef, { profilePicture: downloadURL });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Profile update
  const handleProfileUpdate = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const updatedData = {
      firstName: firstName || admin.firstName,
      lastName: lastName || admin.lastName,
      email: email || admin.email,
      phone: phone || admin.phone,
    };

    dispatch(updateProfileInfo(updatedData));

    try {
      const adminRef = doc(firestore, "admin", uid);
      await updateDoc(adminRef, updatedData);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Password success handler
  useEffect(() => {
    if (success) {
      alert("Password updated successfully. Please login again.");
      dispatch(resetPasswordState());
      navigate("/login");
    }
  }, [success, dispatch, navigate]);

  // Password update
  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields required");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    dispatch(updateUserPassword({ currentPassword, newPassword }));
  };

  return (
    <div className="flex min-h-screen bg-[#141414] text-gray-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Settings"
          subtitle="Manage your account and platform settings"
        />
        <main className="p-4 md:p-6 space-y-5 overflow-x-hidden">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#1f1f1f] p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#FBB040] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Profile Tab */}
          {activeTab === "Profile" && (
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="font-semibold mb-1">Profile Picture</h3>
                <p className="text-xs text-gray-400 mb-4">
                  This Will Be Displayed On Your Public Profile
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      admin.profilePicture ||
                      "https://media.istockphoto.com/id/1448167415/photo/smiling-indian-businessman-in-suit-and-glasses-with-laptop-near-office-building.jpg?s=612x612&w=0&k=20&c=vuUgcc-IlZewhnRm7yNOIuEfAvTnyJdMsPbnvkAnZjc="
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-[#2a2a2a] rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                    >
                      Upload New Photo <Upload size={14} />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">
                      JPG, PNG Or GIF. Max Size 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="font-semibold mb-1">Personal Information</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Update Your Personal Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder={admin.firstName}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder={admin.lastName}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder={admin.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder={admin.phone}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>
                </div>
                <button
                  onClick={handleProfileUpdate}
                  className="mt-5 px-5 py-2.5 cursor-pointer hover:bg-amber-500 bg-[#FBB040] text-black rounded-lg text-sm font-medium hover:bg-[#f5a623] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notification Tab */}
          {/* {activeTab === "Notification" && (
            <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="font-semibold mb-1">Notification Preferences</h3>
              <p className="text-xs text-gray-400 mb-6">
                Choose How You Want To Be Notified
              </p>
              <div className="space-y-4">
                {notifications.map((setting, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-[#2a2a2a] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{setting.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {setting.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleNotification(index)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        setting.enabled ? "bg-[#4CAF50]" : "bg-[#3a3a3a]"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          setting.enabled ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Security Tab */}
          {activeTab === "Security" && (
            <div className="space-y-4">
              {/* Change Password */}
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="font-semibold mb-1">Change Password</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Update Your Password To Keep Your Account Secure
                </p>

                <div className="space-y-4 max-w-xl">
                  {/* Current Password */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:outline-none focus:border-[#FBB040]/50"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="mt-5 px-5 py-2.5 border border-[#FBB040] text-[#FBB040] rounded-lg hover:bg-[#FBB040]/10 transition-colors"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

                {/* Error message */}
                {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
              </div>
            </div>
          )}

          {/* Billing Tab */}

          {/* {activeTab === "Billing" && (
            <div className="space-y-4">
              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="font-semibold mb-1">Current Plan</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Manage Your Subscription
                </p>
                <div className="bg-[#FBB040] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs bg-black/20 text-black px-2 py-1 rounded">
                      Admin
                    </span>
                    <h4 className="text-lg font-bold text-black mt-2">
                      Enterprise Plan
                    </h4>
                    <p className="text-xs text-black/70">
                      Unlimited Access To All Features
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-black">€25</span>
                    <span className="text-black/70">/Hr</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="font-semibold mb-1">Payment Method</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Manage Your Payment Details
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FBB040]/20 rounded-lg">
                      <CreditCard size={20} className="text-[#FBB040]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-gray-400">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#FBB040] text-black rounded-lg text-sm font-medium hover:bg-[#f5a623] transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </main>
      </div>
    </div>
  );
}
