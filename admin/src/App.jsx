import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn } from "@clerk/react";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Places from "./pages/Places";
import Categories from "./pages/Categories";
import Trips from "./pages/Trips";
import Reviews from "./pages/Reviews";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/admin" replace />}
        />

        <Route
          path="/login"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
              <SignIn />
            </div>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="places"
            element={<Places />}
          />

          <Route
            path="categories"
            element={<Categories />}
          />

          <Route
            path="trips"
            element={<Trips />}
          />

          <Route
            path="reviews"
            element={<Reviews />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/admin" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;