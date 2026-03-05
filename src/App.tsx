// import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage'; // Ensure this is correct path
// import Dashboard from './pages/Dashboard';
// import Workers from './pages/Workers';
// import Employers from './pages/Employers';
// import Availability from './pages/Availability';
// import SettingsPage from './pages/Settings';

// export default function App() {
//   const isLoggedIn = localStorage.getItem('admin'); // Check if admin is logged in

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Route for LoginPage */}
//         <Route path="/login" element={<LoginPage />} />

//         {/* Protect other routes by checking if admin is logged in */}
//         <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
//         <Route path="/workers" element={isLoggedIn ? <Workers /> : <Navigate to="/login" />} />
//         <Route path="/employers" element={isLoggedIn ? <Employers /> : <Navigate to="/login" />} />
//         <Route path="/availability" element={isLoggedIn ? <Availability /> : <Navigate to="/login" />} />
//         <Route path="/settings" element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


// import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "./store";

// import LoginPage from "./pages/LoginPage";
// import Dashboard from "./pages/Dashboard";
// import Users from "./pages/Users";
// // import Employers from "./pages/Employers";
// import Availability from "./pages/Availability";
// import SettingsPage from "./pages/Settings";

// function App() {
//   const admin = useSelector((state: RootState) => state.auth.admin);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />

//         <Route
//           path="/"
//           element={admin ? <Dashboard /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/users"
//           element={admin ? <Users /> : <Navigate to="/login" />}
//         />
//         {/* <Route
//           path="/employers"
//           element={admin ? <Employers /> : <Navigate to="/login" />}
//         /> */}
//         <Route
//           path="/availability"
//           element={admin ? <Availability /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/settings"
//           element={admin ? <SettingsPage /> : <Navigate to="/login" />}
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Availability from "./pages/Availability";
import SettingsPage from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/availability"
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;