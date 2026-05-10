import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { EditModeProvider } from "@/hooks/useEditMode";
import { PreferencesProvider } from "@/hooks/usePreferences";

import EditModeToggle from "@/components/editable/EditModeToggle";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import StaffRoute from "@/components/StaffRoute";
import SuperviseeRoute from "@/components/SuperviseeRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Education from "./pages/Education";
import Therapy from "./pages/Therapy";
import Families from "./pages/Families";
import Organisations from "./pages/Organisations";
import Supervision from "./pages/Supervision";
import OfferDetail from "./pages/OfferDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import SearchPage from "./pages/Search";
import ScrollToTop from "./components/ScrollToTop";
// Client portal
import Dashboard from "./pages/portal/Dashboard";
import Resources from "./pages/portal/Resources";
import Messages from "./pages/portal/Messages";
import Booking from "./pages/portal/Booking";
import Toolkit from "./pages/portal/Toolkit";
import ProactiveAssistant from "./components/ProactiveAssistant";
import ToolkitACTMatrix from "./pages/portal/ToolkitACTMatrix";
import ToolkitPomodoro from "./pages/portal/ToolkitPomodoro";
import MindfulnessSounds from "./pages/portal/MindfulnessSounds";
import Productivity from "./pages/portal/Productivity";
import FBAIntake from "./pages/portal/FBAIntake";
import PortalSupportPathway from "./pages/portal/SupportPathway";
import SupportAgreement from "./pages/portal/SupportAgreement";
import BetweenSessions from "./pages/portal/BetweenSessions";
import PathwayTemplateManager from "./pages/admin/PathwayTemplateManager";
// Admin portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCalendar from "./pages/admin/AdminCalendar";
import ClientDetail from "./pages/admin/ClientDetail";
import ClientsOverview from "./pages/admin/ClientsOverview";
import TeamRequests from "./pages/admin/TeamRequests";
import HeroImageManager from "./pages/admin/HeroImageManager";
import SiteContentManager from "./pages/admin/SiteContentManager";
import TeamMemberManager from "./pages/admin/TeamMemberManager";
import ServiceOptionsManager from "./pages/admin/ServiceOptionsManager";
import UnifiedUserManagement from "./pages/admin/UnifiedUserManagement";
import AuthSettings from "./pages/admin/AuthSettings";
import SecurityDashboard from "./pages/admin/SecurityDashboard";
import BusinessDashboard from "./pages/admin/BusinessDashboard";
import TherapistPayouts from "./pages/admin/TherapistPayouts";
// Staff portal
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffACTMatrix from "./pages/staff/StaffACTMatrix";
import TodoManager from "./pages/admin/TodoManager";
import StaffTodoManager from "./pages/admin/StaffTodoManager";
import TaskBoardPage from "./pages/admin/TaskBoard";
import SettingsPage from "./pages/portal/Settings";
import MobileBottomNav from "./components/mobile/MobileBottomNav";
import SwipeBackDetector from "./components/mobile/SwipeBackDetector";
// Clinical tools
import ClinicalTools from "./pages/staff/ClinicalTools";
import ABCDataSheet from "./pages/staff/ABCDataSheet";
import FunctionalAssessment from "./pages/staff/FunctionalAssessment";
import ValuesBullsEye from "./pages/staff/ValuesBullsEye";
import HexaflexTracker from "./pages/staff/HexaflexTracker";
import BehaviourLog from "./pages/staff/BehaviourLog";
import CaseFormulation from "./pages/staff/CaseFormulation";
import FBAIntakes from "./pages/staff/FBAIntakes";
// Courses
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseManager from "./pages/admin/CourseManager";
import CourseLessonManager from "./pages/admin/CourseLessonManager";
// Supervisee portal
import SuperviseeDashboard from "./pages/supervisee/SuperviseeDashboard";
import CaseLogs from "./pages/supervisee/CaseLogs";
import SuperviseeDocuments from "./pages/supervisee/SuperviseeDocuments";
import SuperviseeCompetencies from "./pages/supervisee/SuperviseeCompetencies";
import SupervisionTrackerAdmin from "./pages/admin/SupervisionTracker";
// Blog / Insights
import InsightsHub from "./pages/insights/InsightsHub";
import ArticlePage from "./pages/insights/ArticlePage";
import CategoryPage from "./pages/insights/CategoryPage";
import TagPage from "./pages/insights/TagPage";
import AuthorPage from "./pages/insights/AuthorPage";
import BlogManager from "./pages/admin/BlogManager";
import BadgeManager from "./pages/admin/BadgeManager";
import NoteTemplates from "./pages/admin/NoteTemplates";
import ManualClients from "./pages/admin/ManualClients";
import AssistantManager from "./pages/admin/AssistantManager";
import FBAReportTool from "./pages/admin/FBAReportTool";
import StoryEngine from "./pages/admin/StoryEngine";

// Business Planner
import PlannerLayout from "./components/planner/PlannerLayout";
import IlanaDashboard from "./pages/planner/dashboard/IlanaDashboard";
import TMEMatrix from "./pages/planner/matrix/TMEMatrix";
import ComplianceRoadmap from "./pages/planner/roadmap/ComplianceRoadmap";
import AdminOperations from "./pages/planner/admin/AdminOperations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppLoader = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  // Email notifications are now handled server-side via database trigger
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <PreferencesProvider>
        <EditModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLoader>
                <ScrollToTop />
                <RouteErrorBoundary>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Index />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/therapy" element={<Therapy />} />
                  <Route path="/families" element={<Families />} />
                  <Route path="/organisations" element={<Organisations />} />
                  <Route path="/supervision" element={<Supervision />} />
                  <Route path="/:serviceArea/:offerSlug" element={<OfferDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/team/:slug" element={<TeamMemberProfile />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:slug" element={<CourseDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/search" element={<SearchPage />} />
                  {/* Blog / Insights */}
                  <Route path="/insights" element={<InsightsHub />} />
                  <Route path="/insights/article/:slug" element={<ArticlePage />} />
                  <Route path="/insights/category/:slug" element={<CategoryPage />} />
                  <Route path="/insights/tag/:slug" element={<TagPage />} />
                  <Route path="/insights/authors/:slug" element={<AuthorPage />} />

                  {/* Client portal */}
                  <Route path="/portal" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/portal/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                  <Route path="/portal/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/portal/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                  <Route path="/portal/toolkit" element={<ProtectedRoute><Toolkit /></ProtectedRoute>} />
                  <Route path="/portal/toolkit/act-matrix" element={<ProtectedRoute><ToolkitACTMatrix /></ProtectedRoute>} />
                  <Route path="/portal/toolkit/pomodoro" element={<ProtectedRoute><ToolkitPomodoro /></ProtectedRoute>} />
                  <Route path="/portal/toolkit/mindfulness" element={<ProtectedRoute><MindfulnessSounds /></ProtectedRoute>} />
                  <Route path="/portal/productivity" element={<ProtectedRoute><Productivity /></ProtectedRoute>} />
                  <Route path="/portal/fba-intake" element={<ProtectedRoute><FBAIntake /></ProtectedRoute>} />
                  <Route path="/portal/support-pathway" element={<ProtectedRoute><PortalSupportPathway /></ProtectedRoute>} />
                  <Route path="/portal/support-agreement" element={<ProtectedRoute><SupportAgreement /></ProtectedRoute>} />
                  <Route path="/portal/between-sessions" element={<ProtectedRoute><BetweenSessions /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                  {/* Admin portal */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/calendar" element={<AdminRoute><AdminCalendar /></AdminRoute>} />
                  <Route path="/admin/clients" element={<StaffRoute><ClientsOverview /></StaffRoute>} />
                  <Route path="/admin/clients/:clientId" element={<StaffRoute><ClientDetail /></StaffRoute>} />
                  <Route path="/admin/team-requests" element={<AdminRoute><TeamRequests /></AdminRoute>} />
                  <Route path="/admin/hero-images" element={<AdminRoute><HeroImageManager /></AdminRoute>} />
                  <Route path="/admin/site-content" element={<AdminRoute><SiteContentManager /></AdminRoute>} />
                  <Route path="/admin/team-members" element={<AdminRoute><TeamMemberManager /></AdminRoute>} />
                  <Route path="/admin/service-options" element={<AdminRoute><ServiceOptionsManager /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><UnifiedUserManagement /></AdminRoute>} />
                  <Route path="/admin/staff-todos" element={<AdminRoute><StaffTodoManager /></AdminRoute>} />
                  <Route path="/admin/task-board" element={<AdminRoute><TaskBoardPage /></AdminRoute>} />
                  <Route path="/admin/auth-settings" element={<AdminRoute><AuthSettings /></AdminRoute>} />
                  <Route path="/admin/security" element={<AdminRoute><SecurityDashboard /></AdminRoute>} />
                  <Route path="/admin/courses" element={<AdminRoute><CourseManager /></AdminRoute>} />
                  <Route path="/admin/courses/:courseId/lessons" element={<AdminRoute><CourseLessonManager /></AdminRoute>} />
                  <Route path="/admin/business" element={<AdminRoute><BusinessDashboard /></AdminRoute>} />
                  <Route path="/admin/payouts" element={<AdminRoute><TherapistPayouts /></AdminRoute>} />
                  <Route path="/admin/blog" element={<AdminRoute><BlogManager /></AdminRoute>} />
                  <Route path="/admin/badges" element={<AdminRoute><BadgeManager /></AdminRoute>} />
                  <Route path="/admin/note-templates" element={<AdminRoute><NoteTemplates /></AdminRoute>} />
                  <Route path="/admin/manual-clients" element={<AdminRoute><ManualClients /></AdminRoute>} />
                  <Route path="/admin/assistant" element={<AdminRoute><AssistantManager /></AdminRoute>} />
                  <Route path="/admin/fba-report" element={<AdminRoute><FBAReportTool /></AdminRoute>} />
                  <Route path="/admin/story-engine" element={<AdminRoute><StoryEngine /></AdminRoute>} />
                  <Route path="/admin/pathway-templates" element={<AdminRoute><PathwayTemplateManager /></AdminRoute>} />
                  <Route path="/admin/supervision" element={<AdminRoute><SupervisionTrackerAdmin /></AdminRoute>} />

                  {/* Staff/Therapist portal */}
                  <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
                  <Route path="/staff/clients" element={<StaffRoute><ClientsOverview /></StaffRoute>} />
                  <Route path="/staff/clients/:clientId" element={<StaffRoute><ClientDetail /></StaffRoute>} />
                  <Route path="/staff/calendar" element={<StaffRoute><AdminCalendar /></StaffRoute>} />
                  <Route path="/staff/todos" element={<StaffRoute><TodoManager /></StaffRoute>} />
                  <Route path="/staff/staff-todos" element={<StaffRoute><StaffTodoManager /></StaffRoute>} />
                  <Route path="/staff/resources" element={<StaffRoute><Resources /></StaffRoute>} />
                  <Route path="/staff/messages" element={<StaffRoute><Messages /></StaffRoute>} />
                  <Route path="/staff/booking" element={<StaffRoute><Booking /></StaffRoute>} />
                  <Route path="/staff/productivity" element={<StaffRoute><Productivity /></StaffRoute>} />
                  <Route path="/staff/toolkit" element={<StaffRoute><Toolkit /></StaffRoute>} />
                  <Route path="/staff/toolkit/act-matrix" element={<StaffRoute><StaffACTMatrix /></StaffRoute>} />
                  <Route path="/staff/toolkit/pomodoro" element={<StaffRoute><ToolkitPomodoro /></StaffRoute>} />
                  <Route path="/staff/toolkit/mindfulness" element={<StaffRoute><MindfulnessSounds /></StaffRoute>} />
                  <Route path="/staff/note-templates" element={<StaffRoute><NoteTemplates /></StaffRoute>} />
                  <Route path="/staff/clinical-tools" element={<StaffRoute><ClinicalTools /></StaffRoute>} />
                  <Route path="/staff/clinical/abc" element={<StaffRoute><ABCDataSheet /></StaffRoute>} />
                  <Route path="/staff/clinical/functional-assessment" element={<StaffRoute><FunctionalAssessment /></StaffRoute>} />
                  <Route path="/staff/clinical/values-bullseye" element={<StaffRoute><ValuesBullsEye /></StaffRoute>} />
                  <Route path="/staff/clinical/hexaflex" element={<StaffRoute><HexaflexTracker /></StaffRoute>} />
                  <Route path="/staff/clinical/behaviour-log" element={<StaffRoute><BehaviourLog /></StaffRoute>} />
                  <Route path="/staff/clinical/case-formulation" element={<StaffRoute><CaseFormulation /></StaffRoute>} />
                  <Route path="/staff/fba-intakes" element={<StaffRoute><FBAIntakes /></StaffRoute>} />

                  {/* Supervisee portal */}
                  <Route path="/supervisee" element={<SuperviseeRoute><SuperviseeDashboard /></SuperviseeRoute>} />
                  <Route path="/supervisee/case-logs" element={<SuperviseeRoute><CaseLogs /></SuperviseeRoute>} />
                  <Route path="/supervisee/documents" element={<SuperviseeRoute><SuperviseeDocuments /></SuperviseeRoute>} />
                  <Route path="/supervisee/calendar" element={<SuperviseeRoute><AdminCalendar /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical-tools" element={<SuperviseeRoute><ClinicalTools /></SuperviseeRoute>} />
                  <Route path="/supervisee/resources" element={<SuperviseeRoute><Resources /></SuperviseeRoute>} />
                  <Route path="/supervisee/todos" element={<SuperviseeRoute><TodoManager /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical/abc" element={<SuperviseeRoute><ABCDataSheet /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical/functional-assessment" element={<SuperviseeRoute><FunctionalAssessment /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical/values-bullseye" element={<SuperviseeRoute><ValuesBullsEye /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical/hexaflex" element={<SuperviseeRoute><HexaflexTracker /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical/behaviour-log" element={<SuperviseeRoute><BehaviourLog /></SuperviseeRoute>} />
                  <Route path="/supervisee/clinical/case-formulation" element={<SuperviseeRoute><CaseFormulation /></SuperviseeRoute>} />
                  <Route path="/supervisee/competencies" element={<SuperviseeRoute><SuperviseeCompetencies /></SuperviseeRoute>} />

                  {/* Business Planner */}
                  <Route path="/planner" element={<ProtectedRoute><PlannerLayout /></ProtectedRoute>}>
                    <Route index element={<IlanaDashboard />} />
                    <Route path="tme-matrix" element={<TMEMatrix />} />
                    <Route path="roadmap" element={<ComplianceRoadmap />} />
                    <Route path="admin" element={<AdminOperations />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
                </RouteErrorBoundary>
                <ProactiveAssistant />
                <MobileBottomNav />
                <SwipeBackDetector />
                <EditModeToggle />
              </AppLoader>
            </BrowserRouter>
          </TooltipProvider>
        </EditModeProvider>
        </PreferencesProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
