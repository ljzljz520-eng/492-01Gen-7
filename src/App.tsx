import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useInitializeData } from "@/hooks/useInitializeData";
import ProtectedRoute from "@/components/ProtectedRoute";
import LeaderLayout from "@/components/layout/LeaderLayout";
import WorkerLayout from "@/components/layout/WorkerLayout";
import LoginPage from "@/pages/login/LoginPage";
import LeaderDashboard from "@/pages/leader/LeaderDashboard";
import StyleManagement from "@/pages/leader/StyleManagement";
import ProductionEntry from "@/pages/leader/ProductionEntry";
import ReportsPage from "@/pages/leader/ReportsPage";
import ExportPage from "@/pages/leader/ExportPage";
import WorkerHome from "@/pages/worker/WorkerHome";
import WorkerHistory from "@/pages/worker/WorkerHistory";
import WorkerProfile from "@/pages/worker/WorkerProfile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/leader/*"
        element={
          <ProtectedRoute allowedRoles={["leader"]}>
            <LeaderLayout>
              <Routes>
                <Route path="dashboard" element={<LeaderDashboard />} />
                <Route path="styles" element={<StyleManagement />} />
                <Route path="entry" element={<ProductionEntry />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="export" element={<ExportPage />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </LeaderLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker/*"
        element={
          <ProtectedRoute allowedRoles={["worker"]}>
            <WorkerLayout>
              <Routes>
                <Route path="home" element={<WorkerHome />} />
                <Route path="history" element={<WorkerHistory />} />
                <Route path="profile" element={<WorkerProfile />} />
                <Route path="" element={<Navigate to="home" replace />} />
              </Routes>
            </WorkerLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const { isInitialized } = useInitializeData();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
