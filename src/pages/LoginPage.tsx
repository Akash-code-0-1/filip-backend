// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { loginAdmin } from "../store/features/authSlice";
// import { useNavigate } from "react-router-dom";
// import type { RootState, AppDispatch } from "../store";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const { admin, loading, error } = useSelector(
//     (state: RootState) => state.auth,
//   );

//   // // Use React.SyntheticEvent for submit
//   // const handleLogin = (e: React.SyntheticEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
//   //   dispatch(loginAdmin({ email, password }));
//   // };

//   const handleLogin = (e: React.SyntheticEvent) => {
//     e.preventDefault();
//     dispatch(loginAdmin({ email, password }));
//   };

//   useEffect(() => {
//     if (admin) {
//       navigate("/"); // redirect after login
//     }
//   }, [admin, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
//           Admin Login
//         </h2>

//         <form onSubmit={handleLogin}>
//           <div className="mb-4">
//             <label
//               className="block text-sm font-semibold text-gray-700 mb-2"
//               htmlFor="email"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 bg-gray-100 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               placeholder="Enter your email"
//             />
//           </div>

//           <div className="mb-6">
//             <label
//               className="block text-sm font-semibold text-gray-700 mb-2"
//               htmlFor="password"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 bg-gray-100 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               placeholder="Enter your password"
//             />
//           </div>

//           <button
//             type="submit"
//             className={`w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 cursor-pointer ${
//               loading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         {error && (
//           <div className="mt-4 text-red-500 text-sm text-center">
//             <p>{error}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "../store/features/authSlice";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { admin, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(loginAdmin({ email, password }));
  };

  useEffect(() => {
    if (admin) {
      navigate("/"); // redirect after login
    }
  }, [admin, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#141414] via-[#1f1f1f] to-[#000000] px-4">
      
      {/* Project Name */}
      <span
        className="
          font-bold not-italic
          text-[40px] leading-[1]
          tracking-[0]
          capitalize
          bg-[linear-gradient(90deg,#CDAC61_0%,#F9F1BA_23.88%,#BA943E_48.95%,#FAF4BB_74.38%,#B88D3D_100%)]
          bg-clip-text text-transparent
          text-center mb-10
        "
      >
        GoldShift
      </span>

      {/* Login Card */}
      <div className="bg-[#1f1f1f] p-8 rounded-2xl shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-[#141414] border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CDAC61] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 bg-[#141414] border border-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CDAC61] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 font-semibold rounded-md
              text-black bg-gradient-to-r from-[#f7c653] via-[#f7e46e] to-[#eebd4b]
              hover:brightness-110 transition 
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-500 text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}