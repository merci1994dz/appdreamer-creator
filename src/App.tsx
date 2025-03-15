
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Countries from "./pages/Countries";
import CountryChannels from "./pages/CountryChannels";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";
import UserSettings from "./pages/UserSettings";
import { useEffect } from "react";
import { setupSettingsListener } from "./services/sync/settingsSync";

const queryClient = new QueryClient();

const App = () => {
  // تهيئة مستمع الإعدادات عند بدء التطبيق
  useEffect(() => {
    const cleanupSettingsListener = setupSettingsListener();
    return () => cleanupSettingsListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/home" element={
                <>
                  <Home />
                  <Navigation />
                </>
              } />
              <Route path="/categories" element={
                <>
                  <Categories />
                  <Navigation />
                </>
              } />
              <Route path="/countries" element={
                <>
                  <Countries />
                  <Navigation />
                </>
              } />
              <Route path="/country/:countryId" element={
                <>
                  <CountryChannels />
                  <Navigation />
                </>
              } />
              <Route path="/search" element={
                <>
                  <Search />
                  <Navigation />
                </>
              } />
              <Route path="/favorites" element={
                <>
                  <Favorites />
                  <Navigation />
                </>
              } />
              {/* إضافة مسار صفحة الإعدادات الجديدة */}
              <Route path="/settings" element={
                <>
                  <UserSettings />
                  <Navigation />
                </>
              } />
              {/* مسار المشرف لا يزال موجودًا ولكنه مخفي من التنقل */}
              <Route path="/admin" element={
                <>
                  <Admin />
                  <Navigation />
                </>
              } />
              {/* أضف جميع المسارات المخصصة فوق مسار الالتقاط "*" */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
