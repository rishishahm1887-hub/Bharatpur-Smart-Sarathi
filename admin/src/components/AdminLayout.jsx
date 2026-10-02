import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="ml-64 min-h-screen">

        {/* Topbar */}
        <Topbar />

        {/* Page */}
        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;