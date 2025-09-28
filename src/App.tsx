import { useState, useEffect } from 'react';
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
import NotFoundPage from './pages/NotFoundPage';
import { getAppSettings } from './services/firebase';


const pageMetadata: { [key: string]: { title: string; description: string } } = {
    home: {
        title: 'EMLinter - The Ultimate Toolkit for HTML Email Development',
        description: 'Validate, visually edit, and build flawless responsive HTML emails with our intelligent linter, no-code editor, Outlook compatibility tools, and free template library.'
    },
    'templates': {
        title: 'Free & Responsive HTML Email Templates | EMLinter',
        description: 'Browse professionally designed, responsive HTML email templates for newsletters, e-commerce, and more. All templates are tested and Vibe-compatible.'
    },
    'code-fix': {
        title: 'Free HTML Email Linter & Validator | EMLinter',
        description: 'Instantly validate your HTML email against Outlook & Gmail bugs. Our free linter checks for unclosed tags, CSS errors, and compatibility issues to ensure perfect rendering.'
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
        title: 'No-Code HTML Visual Editor (Vibe) | EMLinter',
        description: 'Empower your team to edit coded HTML emails with Vibe, our revolutionary no-code visual editor. Modify text, images, and links without writing a single line of code.'
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
        title: 'Contact Us - EMLinter Professional Services',
        description: "Get in touch for professional email development services, project collaborations, or questions about the EMLinter toolkit. Let's connect."
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
    },
    'not-found': {
        title: '404 - Page Not Found | EMLinter',
        description: 'The page you are looking for does not exist. Return to the EMLinter homepage to explore our HTML email toolkit.'
    }
};

const setMetaTag = (property: string, content: string, isOg: boolean = true) => {
    const selector = isOg ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let element = document.querySelector<HTMLMetaElement>(selector);
    if (!element) {
        element = document.createElement('meta');
        if (isOg) {
            element.setAttribute('property', property);
        } else {
            element.setAttribute('name', property);
        }
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const setLinkTag = (rel: string, href: string) => {
    let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
    }
    element.setAttribute('href', href);
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [initialPageState, setInitialPageState] = useState<any>(history.state);
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
    // Listen for browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
        setPath(window.location.pathname);
        setInitialPageState(event.state);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  const handleNavigate = (newPath: string, state?: any) => {
    // Update URL and state
    window.history.pushState(state || null, '', newPath);
    setPath(newPath);
    if (state) {
        setInitialPageState(state);
    } else {
        setInitialPageState(null); // Clear state on normal navigation
    }
    window.scrollTo(0, 0);
  };

  const activePage = path === '/' ? 'home' : path.substring(1);

  useEffect(() => {
    const [pageBase, pageSlug] = activePage.split('/');
    let metadata;
    const baseUrl = 'https://emlinter.app';
    const fullUrl = `${baseUrl}${path}`;
    const defaultOgImage = `${baseUrl}/og-image.png`;

    if (pageBase === 'templates' && pageSlug) {
        // A generic title for the detail page. The page itself will update it with the specific template title upon fetching.
        metadata = {
            title: 'Email Template Details | EMLinter',
            description: 'View the details, previews, and download this professionally designed HTML email template.',
            ogImage: defaultOgImage
        };
    } else if (pageBase === 'blog' && pageSlug) {
        // Generic title for blog posts. The page itself will update it.
        metadata = {
            title: 'Blog Post | EMLinter',
            description: 'Read insights, tutorials, and updates on HTML email development from the EMLinter team.',
            ogImage: defaultOgImage
        };
    } else {
        const pageKey = pageMetadata.hasOwnProperty(pageBase) ? pageBase : 'not-found';
        metadata = {
            ...pageMetadata[pageKey],
            ogImage: defaultOgImage
        };
    }
    
    document.title = metadata.title;
    setMetaTag('description', metadata.description, false);
    setLinkTag('canonical', fullUrl);
    
    // Update Open Graph tags
    setMetaTag('og:title', metadata.title);
    setMetaTag('og:description', metadata.description);
    setMetaTag('og:url', fullUrl);
    setMetaTag('og:image', metadata.ogImage);

    // Update Twitter tags
    setMetaTag('twitter:title', metadata.title, false);
    setMetaTag('twitter:description', metadata.description, false);
    setMetaTag('twitter:image', metadata.ogImage, false);

  }, [activePage, path]);

  const renderPage = () => {
    const [pageBase, pageSlug] = activePage.split('/');
	console.log("My Firebase Project ID is:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

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
            return <OurExpertsPage />;
        default:
            return <NotFoundPage onNavigate={handleNavigate} />;
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