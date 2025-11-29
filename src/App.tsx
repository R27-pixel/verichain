import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import Recruiter from "./pages/Recruiter";
import UniversityRegistration from "./pages/UniversityRegistration";
import UniversityRegistrationSuccess from "./pages/UniversityRegistrationSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/university/register" element={<UniversityRegistration />} />
          <Route path="/university/success" element={<UniversityRegistrationSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
