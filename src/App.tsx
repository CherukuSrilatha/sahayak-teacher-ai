import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ContentGenerator from "./pages/ContentGenerator";
import WorksheetDifferentiator from "./pages/WorksheetDifferentiator";
import QuickExplainer from "./pages/QuickExplainer";
import VisualAidCreator from "./pages/VisualAidCreator";
import LessonPlanner from "./pages/LessonPlanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/content-generator" element={<ContentGenerator />} />
          <Route path="/worksheet-differentiator" element={<WorksheetDifferentiator />} />
          <Route path="/quick-explainer" element={<QuickExplainer />} />
          <Route path="/visual-aid-creator" element={<VisualAidCreator />} />
          <Route path="/lesson-planner" element={<LessonPlanner />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
