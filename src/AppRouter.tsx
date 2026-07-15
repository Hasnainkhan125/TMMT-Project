import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router';

import History from './pages/History';

import Header from '@/components/Header/Header';
import { Toaster } from '@/components/ui/sonner';
import Profile from '@/pages/Profile/Profile';
// import IssuerDashboard from './pages/Dashboards/IssuerDashboard/IssuerDashboard';
import { AdminRoute, AmerRoute, ProtectedRoute, UserRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ProjectDetails from './components/TokenCard/ProjectDetails';
import Applications from './pages/Applications/Applications';
import AuthPage from './pages/Auth/AuthPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import AmerDashboard from './pages/BackOffice/AmerDashboard';
import BackOffice from './pages/BackOffice/BackOffice';
import ChatTestPage from './pages/Chat/ChatTestPage';
import CompliancePage from './pages/Portfolios/InvestorPortfolio/CompliancePage';
import DocumentsPage from './pages/Portfolios/InvestorPortfolio/DocumentPage';
import ProfilePage from './pages/Portfolios/InvestorPortfolio/ProfilePage';
import UAEStatisticsPage from './pages/Dashboards/UAEStatisticsPage';
import HomePage from './pages/Home/HomePageBrand';
import TammatHomePage, { SiteHeader } from './pages/Home/TammatHomePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import FamilyPage from './pages/Family/FamilyPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import KnowledgeHubPage from './pages/Knowledge/KnowledgeHubPage';
import AdminControlPanel from './pages/BackOffice/AdminControlPanel';
import OfficerDashboard from './pages/BackOffice/OfficerDashboard';
import { useEffect, useState } from 'react';
import Marketplace from './pages/Marketplace/Marketplace';
import AdvancedInvestorPortfolio from './pages/Portfolios/InvestorPortfolio/AdvancedInvestorPortfolio';
import IssuerDashboard from './pages/Portfolios/IssuerPortfolio/IssuerDashboard';
import IssuerPortfolio from './pages/Portfolios/IssuerPortfolio/IssuerPortfolio';
import EnhancedServicePage from './pages/Services/EnhancedServicePage';
import ServicePage from './pages/Services/ServicePage';
import AboutPage from './pages/About/AboutPage';
import ApplyPage from './pages/Apply/ApplyPage';
import Brand from './pages/Brand/Brand';
import ServicesPage from './pages/Services/ServicePage';
import FAQsPage from './pages/FAQs/FAQsPage';
import InquiryPage from './pages/Inquiry/InquiryPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CustomerDashboard from './pages/Dashboard/CustomerDashboard';
import { FormProvider } from '@/contexts/FormContext';
import { ApplicationsProvider } from '@/contexts/ApplicationsContext';
import { ServicesGrid } from './components/Services/Service-Grid';
import ApplicationSection from './components/Dashboard/ApplicationSection';
import { UserProvider } from './lib/user-context';
import SubscriptionPage from './pages/subscription/SubscriptionPage';

// Import the DashboardContent from AdvancedInvestorPortfolio or create a wrapper
// If you can't export DashboardContent, create a wrapper component
const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return <AdvancedInvestorPortfolio>{children}</AdvancedInvestorPortfolio>;
};

function AppRouter() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <Router>
            <SiteHeader />
            <AnnouncementBanner />
            <Routes>
              {/* Authentication Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Public Routes */}
              <Route path="/" element={<TammatHomePage />} />
              <Route path="/original" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/apply" element={<ApplyPage />} />
              <Route path="/inquiry/:id" element={<InquiryPage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/services/enhanced/:id" element={<EnhancedServicePage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/brand" element={<Brand />} />

              {/* Protected Routes - Require Authentication */}
              <Route path="/dashboard" element={
                <UserRoute>
                  <DashboardPage />
                </UserRoute>
              } />

              <Route path="/subscription" element={
                <SubscriptionPage />
              } />
              
              <Route path="/customer-dashboard" element={
                <FormProvider>
                  <UserProvider>
                    <ApplicationsProvider>
                      <ServicesGrid />
                      <ApplicationSection />
                    </ApplicationsProvider>
                  </UserProvider>
                </FormProvider>
              } />

              {/* 🔥 FIX: All investor routes now use AdvancedInvestorPortfolio as wrapper */}
              <Route path="/user/dashboard" element={
                <UserRoute>
                  <AdvancedInvestorPortfolio />
                </UserRoute>
              } />

              <Route path="/user/documents" element={
                <UserRoute>
                  <AdvancedInvestorPortfolio>
                    <DocumentsPage />
                  </AdvancedInvestorPortfolio>
                </UserRoute>
              } />

              <Route path="/investor/documents" element={
                <UserRoute>
                  <AdvancedInvestorPortfolio>
                    <DocumentsPage />
                  </AdvancedInvestorPortfolio>
                </UserRoute>
              } />

              <Route path="/investor/compliance" element={
                <UserRoute>
                  <AdvancedInvestorPortfolio>
                    <CompliancePage />
                  </AdvancedInvestorPortfolio>
                </UserRoute>
              } />

              <Route path="/user/profile" element={
                <UserRoute>
                  <AdvancedInvestorPortfolio>
                    <ProfilePage />
                  </AdvancedInvestorPortfolio>
                </UserRoute>
              } />

              <Route path="/investor/profile" element={
                <UserRoute>
                  <AdvancedInvestorPortfolio>
                    <ProfilePage />
                  </AdvancedInvestorPortfolio>
                </UserRoute>
              } />

              {/* Other routes */}
              <Route path="/notifications" element={
                <UserRoute>
                  <NotificationsPage />
                </UserRoute>
              } />
              
              <Route path="/family" element={
                <UserRoute>
                  <FamilyPage />
                </UserRoute>
              } />
              
              <Route path="/payments" element={
                <UserRoute>
                  <PaymentsPage />
                </UserRoute>
              } />
              
              <Route path="/knowledge" element={<KnowledgeHubPage />} />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminControlPanel />
                </AdminRoute>
              } />
              
              <Route path="/officer" element={
                <AmerRoute>
                  <OfficerDashboard />
                </AmerRoute>
              } />

              <Route path="/issuer/portfolio" element={
                <ProtectedRoute>
                  <IssuerPortfolio />
                </ProtectedRoute>
              } />
              
              <Route path="/issuer/dashboard" element={
                <ProtectedRoute>
                  <IssuerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/setting" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              
              <Route path="/backoffice" element={
                <ProtectedRoute>
                  <BackOffice />
                </ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              } />
              
              <Route path="/chat-test" element={
                <ProtectedRoute>
                  <ChatTestPage />
                </ProtectedRoute>
              } />
              
              <Route path="/amer-dashboard" element={
                <AmerRoute>
                  <AmerDashboard />
                </AmerRoute>
              } />
              
              <Route path="/uae-statistics" element={
                <ProtectedRoute>
                  <UAEStatisticsPage />
                </ProtectedRoute>
              } />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </Router>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppRouter;

function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  useEffect(()=>{
    (async ()=>{
      try {
        const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
        const token = localStorage.getItem('authToken') || ''
        const res = await fetch(`${base}/api/v1/admin/announcements`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        const data = await res.json()
        if (res.ok) setAnnouncements(data?.data?.announcements || [])
      } catch {}
    })()
  }, [])
  if (!announcements.length) return null
  return (
    <div className="sticky top-0 z-40">
      {announcements.map((a)=> (
        <div key={a._id} className={`w-full text-center py-2 text-sm ${a.level==='critical'?'bg-red-600 text-white':a.level==='warning'?'bg-yellow-400 text-black':'bg-blue-600 text-white'}`}>
          {a.title ? (<strong className="mr-2">{a.title}:</strong>) : null}{a.message}
        </div>
      ))}
    </div>
  )
}