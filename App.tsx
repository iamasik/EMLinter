import React, { useState, useEffect } from 'react';
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
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import HowItWorksPage from './pages/HowItWorksPage';
import OurExpertsPage from './pages/OurExpertsPage';
import HtmlMinifierPage from './pages/HtmlMinifierPage';
import { getAppSettings } from './services/firebase';
import type { AppSettings } from './types';


const pageMetadata: { [key: string]: { title: string; description: string } } = {
    home: {
        title: 'EMLinter - The Ultimate Toolkit for HTML Email Development',
        description: 'Validate, visually edit, and build flawless responsive HTML emails with our intelligent linter, no-code editor, Outlook compatibility tools, and free template library.'
    },
    'templates': {
        title: 'HTML Email Templates | EMLinter',
        description: 'Browse our collection of professionally designed, responsive HTML email templates for various industries and use cases.'
    },
    'code-fix': {
        title: 'HTML Email Linter - Code Fix Tool | EMLinter',
        description: 'Validate your HTML email for tag errors, CSS issues, and ensure perfect rendering across all clients with our intelligent linter.'
    },
    'beautify-code': {
        title: 'HTML Email Beautifier & Formatter | EMLinter',
        description: 'Clean up and reformat your messy or minified HTML email code into a readable, well-structured format with our code beautifier.'
    },
    'html-minifier': {
        title: 'HTML Minifier - Compress Email Code | EMLinter',
        description: 'Reduce the file size of your HTML emails by removing comments, whitespace, and line breaks with our powerful minifier tool.'
    },
    'visual-editor': {
        title: 'Visual Email Editor (Vibe) | EMLinter',
        description: 'Visually edit text, images, and sections of your coded HTML email templates without touching a single line of code. Empower your team.'
    },
    'outlook-button-generator': {
        title: 'Outlook VML Button Generator | EMLinter',
        description: 'Create beautiful, bulletproof VML buttons that render perfectly in all versions of Microsoft Outlook.'
    },
    'outlook-background-generator': {
        title: 'Bulletproof Outlook Background Image Generator | EMLinter',
        description: 'Effortlessly create VML-based background images that render perfectly in all versions of Microsoft Outlook, ensuring your designs look stunning everywhere.'
    },
    'outlook-ready-html': {
        title: 'Outlook HTML Sanitizer - Fix Spacing & Rendering Issues | EMLinter',
        description: 'Automatically add required margins and padding to your tables, rows, and cells to fix common spacing and border-collapse issues in Microsoft Outlook.'
    },
    'contact-us': {
        title: 'Contact Us | EMLinter',
        description: 'Connect with the developer behind EMLinter. Get in touch for questions, project ideas, or collaborations.'
    },
    'blog': {
        title: 'Blog | EMLinter',
        description: 'Insights, tutorials, and updates on HTML email development from the EMLinter team.'
    },
    'how-it-works': {
        title: 'How It Works | EMLinter',
        description: 'Learn how to use EMLinter\'s powerful toolkit to validate, fix, and visually edit your HTML emails.'
    },
    'our-experts': {
        title: 'Our Experts | EMLinter',
        description: 'Meet the team of experts behind the EMLinter toolkit.'
    }
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [initialPageState, setInitialPageState] = useState<any>(null);
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


  const handleNavigate = (page: string, state?: any) => {
    setActivePage(page);
    if (state) {
        setInitialPageState(state);
    } else {
        setInitialPageState(null); // Clear state on normal navigation
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const [pageBase, pageSlug] = activePage.split('/');
    let metadata;

    if (pageBase === 'templates' && pageSlug) {
        // A generic title for the detail page. The page itself will update it with the specific template title upon fetching.
        metadata = {
            title: 'Email Template Details | EMLinter',
            description: 'View the details, previews, and download this professionally designed HTML email template.'
        };
    } else if (pageBase === 'blog' && pageSlug) {
        // Generic title for blog posts. The page itself will update it with the specific post title.
        metadata = {
            title: 'Blog Post | EMLinter',
            description: 'Read insights, tutorials, and updates on HTML email development from the EMLinter team.'
        };
    } else {
        const pageKey = pageMetadata.hasOwnProperty(pageBase) ? pageBase : 'home';
        metadata = pageMetadata[pageKey];
    }
    
    document.title = metadata.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', metadata.description);
    }
  }, [activePage]);

  const renderPage = () => {
    const [pageBase, pageSlug] = activePage.split('/');

    switch (pageBase) {
        case 'home':
            return <HomePage onNavigate={handleNavigate} />;
        case 'templates':
            if (pageSlug) {
                return <TemplateDetailPage slug={pageSlug} onNavigate={handleNavigate} />;
            }
            return <TemplatesPage onNavigate={handleNavigate} initialFilter={initialPageState} />;
        case 'code-fix':
            return <CodeFixPage />;
        case 'beautify-code':
            return <BeautifyCodePage />;
        case 'html-minifier':
            return <HtmlMinifierPage />;
        case 'visual-editor':
            if (pageSlug) {
                return <VisualEditorPage slug={pageSlug} />;
            }
            return <VisualEditorPage />;
        case 'outlook-button-generator':
            return <OutlookButtonGeneratorPage />;
        case 'outlook-background-generator':
            return <OutlookBackgroundGeneratorPage />;
        case 'outlook-ready-html':
            return <OutlookReadyHtmlPage />;
        case 'contact-us':
            return <ContactUsPage />;
        case 'blog':
            if (pageSlug) {
                return <BlogPostPage slug={pageSlug} onNavigate={handleNavigate} />;
            }
            return <BlogPage onNavigate={handleNavigate} />;
        case 'how-it-works':
            return <HowItWorksPage />;
        case 'our-experts':
            // FIX: Removed onNavigate prop as OurExpertsPage does not use it.
            return <OurExpertsPage />;
        default:
            return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col overflow-x-hidden">
      <AnnouncementBar announcement={announcement} isLoading={isLoadingAnnouncement} />
      <Header activePage={activePage} onNavigate={handleNavigate} />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}