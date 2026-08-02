import { Suspense, lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "react-hot-toast";
import Loader from "./components/ui/Loader.jsx";
import { ScrollToTop } from "./components/common/ScrollToTop.jsx";

const AppRoutes = lazy(() => import("./routes/AppRoutes.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider>
            <ScrollToTop />
            <Suspense fallback={<Loader fullScreen />}>
              <AppRoutes />
            </Suspense>
            <Toaster
              position="top-right"
              gutter={10}
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#151A24",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  fontSize: "14px",
                  padding: "12px 16px",
                  boxShadow: "0 12px 32px -12px rgba(0,0,0,0.55)",
                },
                success: {
                  iconTheme: { primary: "#22C55E", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#EF4444", secondary: "#fff" },
                },
              }}
            />
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
