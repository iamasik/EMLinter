import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import HomePage from './pages/HomePage';
import CodeFixPage from './pages/CodeFixPage';
import VisualEditorPage from './pages/VisualEditorPage';
import ContactUsPage from './pages/ContactUsPage';
import BeautifyCodePage from './pages/BeautifyCodePage';
import OutlookButtonGeneratorPage from './pages/OutlookButtonGeneratorPage';
import OutlookBackgroundGeneratorPage from './pages/OutlookBackgroundGeneratorPage';
import OutlookReadyHtmlPage from './pages/OutlookReadyHtmlPage';
import DesignCopierPage from './pages/DesignCopierPage';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FaqPage from './pages/OurExpertsPage';
import HtmlMinifierPage from './pages/HtmlMinifierPage';
import DarkModeCheckerPage from './pages/DarkModeCheckerPage';
import NotFoundPage from './pages/NotFoundPage';
import { getAppSettings } from './services/firebase';
import type { AppSettings } from './types';

export default function App() {
  const [announcement, setAnnouncement] = useState<{ text: string; isEnabled: boolean; } | null>(null);
  const [isLoadingAnnouncement, setIsLoadingAnnouncement] = useState(true);

  useEffect(() => {
    // Fetch app settings once on initial load
    const fetchSettings = async () => {
        try {
            const appSettings = await getAppSettings();
            if (appSettings?.announcement) {
                setAnnouncement(appSettings.announcement);
            }
        } catch (error) {
            console.error("Could not fetch app settings:", error);
        } finally {
            setIsLoadingAnnouncement(false);
        }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // On route change, scroll to top
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col overflow-x-hidden">
      <AnnouncementBar announcement={announcement} isLoading={isLoadingAnnouncement} />
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:slug" element={<TemplateDetailPage />} />
            <Route path="/code-fix" element={<CodeFixPage />} />
            <Route path="/beautify-code" element={<BeautifyCodePage />} />
            <Route path="/html-minifier" element={<HtmlMinifierPage />} />
            <Route path="/dark-mode-checker" element={<DarkModeCheckerPage />} />
            <Route path="/design-copier" element={<DesignCopierPage />} />
            <Route path="/visual-editor" element={<VisualEditorPage />} />
            <Route path="/visual-editor/:slug" element={<VisualEditorPage />} />
            <Route path="/outlook-button-generator" element={<OutlookButtonGeneratorPage />} />
            <Route path="/outlook-background-generator" element={<OutlookBackgroundGeneratorPage />} />
            <Route path="/outlook-ready-html" element={<OutlookReadyHtmlPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}