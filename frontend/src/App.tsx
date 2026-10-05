import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { PageTransition } from "@/components/PageTransition";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfileSetupDialog } from "@/components/ProfileSetupDialog";
import { ProfileProvider } from "@/context/ProfileContext";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import GradePage from "./pages/GradePage";
import StudyPage from "./pages/StudyPage";
import LevelsPage from "./pages/LevelsPage";
import PlayPage from "./pages/PlayPage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

/**
 * Configure TanStack Query client with optimized defaults
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 1 minute
      staleTime: 60 * 1000,
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <ProfileProvider>
            <AppHeader />
            <AnimatedRoutes>
              <Route path="/" data-genie-title="MathLand · Home" data-genie-key="Home" element={<PageTransition transition="slide-up"><Index /></PageTransition>} />
              <Route path="/grades/:grade" data-genie-title="Grade Topics" data-genie-key="Grade" element={<PageTransition transition="slide-up"><GradePage /></PageTransition>} />
              <Route path="/study/:grade/:topicId" data-genie-title="Study Guide" data-genie-key="Study" element={<PageTransition transition="slide-up"><StudyPage /></PageTransition>} />
              <Route path="/levels/:grade/:topicId" data-genie-title="Level Map" data-genie-key="Levels" element={<PageTransition transition="slide-up"><LevelsPage /></PageTransition>} />
              <Route path="/play/:grade/:topicId/:level" data-genie-title="Level Challenge" data-genie-key="Play" element={<PageTransition transition="fade"><PlayPage /></PageTransition>} />
              <Route path="/result/:resultId" data-genie-title="Level Result" data-genie-key="Result" element={<PageTransition transition="scale"><ResultPage /></PageTransition>} />
              <Route path="/history" data-genie-title="Result History" data-genie-key="History" element={<PageTransition transition="slide-up"><HistoryPage /></PageTransition>} />
              <Route path="/profile" data-genie-title="My Profile" data-genie-key="Profile" element={<PageTransition transition="slide-up"><ProfilePage /></PageTransition>} />
              <Route path="/about" data-genie-title="About" data-genie-key="About" element={<PageTransition transition="slide-up"><AboutPage /></PageTransition>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" data-genie-key="NotFound" data-genie-title="Not Found" element={<PageTransition transition="fade"><NotFound /></PageTransition>} />
            </AnimatedRoutes>
            <SiteFooter />
            <ProfileSetupDialog />
          </ProfileProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App
