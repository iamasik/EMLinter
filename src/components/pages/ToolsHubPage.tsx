import React from 'react';
import {
    CheckCircleIcon,
    WandIcon,
    CodeIcon,
    MoonIcon,
    CursorClickIcon,
    ImageIcon,
    ScaleIcon,
    TemplateIcon,
} from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const tools = [
    {
        id: 'code-fix',
        label: 'HTML Email Linter',
        description: 'Validate HTML for unclosed tags, CSS errors, and Outlook-specific rendering bugs before you hit send.',
        icon: CheckCircleIcon,
        tone: 'from-pink-500/20 to-pink-500/5 text-pink-300 ring-pink-400/20',
    },
    {
        id: 'beautify-code',
        label: 'HTML Beautifier',
        description: 'Format minified or messy HTML email code into clean, indented, readable structure for fast debugging.',
        icon: WandIcon,
        tone: 'from-amber-500/20 to-amber-500/5 text-amber-300 ring-amber-400/20',
    },
    {
        id: 'html-minifier',
        label: 'HTML Email Minifier',
        description: 'Compress your HTML to slide under Gmail’s 102KB clipping limit and improve open and load times.',
        icon: CodeIcon,
        tone: 'from-violet-500/20 to-violet-500/5 text-violet-300 ring-violet-400/20',
    },
    {
        id: 'dark-mode-checker',
        label: 'Dark Mode Email Tester',
        description: 'Simulate iOS, Outlook, and Gmail dark modes side-by-side and auto-flag low-contrast text.',
        icon: MoonIcon,
        tone: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300 ring-indigo-400/20',
    },
    {
        id: 'design-copier',
        label: 'Design Copier',
        description: 'Copy a rendered email design as a rich-content block, ready to paste into Gmail or Outlook.',
        icon: CursorClickIcon,
        tone: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/20',
    },
    {
        id: 'svg-to-png',
        label: 'SVG Viewer & to PNG',
        description: 'Preview SVG code, resize, flip, rotate, and recolor it, then convert SVG to PNG at up to 4x or copy a data URI.',
        icon: ImageIcon,
        tone: 'from-sky-500/20 to-sky-500/5 text-sky-300 ring-sky-400/20',
    },
    {
        id: 'relative-image-scaler',
        label: 'Relative Image Scaler',
        description: 'Set a parent image target size and get every child element resized by the same ratio, with a live visual proof.',
        icon: ScaleIcon,
        tone: 'from-teal-500/20 to-teal-500/5 text-teal-300 ring-teal-400/20',
    },
    {
        id: 'html-to-image',
        label: 'HTML to Image',
        description: 'Paste HTML and CSS, preview it live, then convert HTML to a transparent PNG or a JPG at up to 4x — all in the browser.',
        icon: TemplateIcon,
        tone: 'from-rose-500/20 to-rose-500/5 text-rose-300 ring-rose-400/20',
    },
];

const faqs = [
    {
        question: 'Which HTML email developer tools do I actually need?',
        answer: 'Every email developer needs four things in their workflow: a linter to catch errors, a beautifier or minifier to control file size, a dark-mode preview, and an Outlook fallback generator. EMLinter ships all four for free in one browser tab.',
    },
    {
        question: 'How is a free HTML email linter different from a code editor?',
        answer: 'A code editor like VS Code understands generic HTML — it does not know that <div> inside <td> breaks Outlook, that style tags get stripped by Yahoo, or that 102KB triggers Gmail clipping. An HTML email linter is rule-tuned for email clients, not browsers.',
    },
    {
        question: 'Do these tools work offline or require an account?',
        answer: 'All EMLinter developer tools run entirely client-side in your browser. No account, no upload, no server processing. Your HTML never leaves your device.',
    },
    {
        question: 'Can I use these tools alongside Mailchimp, Klaviyo, or HubSpot?',
        answer: 'Yes — the toolkit is ESP-agnostic. Validate and optimize your HTML here, then paste the result into Mailchimp, Klaviyo, HubSpot, Campaign Monitor, Salesforce Marketing Cloud, ActiveCampaign, Brevo, or any other email platform.',
    },
    {
        question: 'What is the difference between beautifying and minifying email HTML?',
        answer: 'Beautifying adds indentation and line breaks so the code is readable for debugging. Minifying strips comments, whitespace, and line breaks so the file ships as small as possible — critical for staying under the 102KB Gmail clipping threshold.',
    },
    {
        question: 'How do I test how my email renders in dark mode?',
        answer: 'Upload your HTML to the Dark Mode Email Tester. It simulates the inverted-color treatment that Outlook and Gmail apply automatically, and surfaces every text/background pair that fails WCAG AA contrast in either light or dark mode.',
    },
];

const ToolsHubPage: React.FC = () => (
    <div>
        <PageHero
            eyebrow="HTML Email Developer Tools"
            title={
                <>
                    Eight free tools every <span className="gradient-text">email developer</span> keeps open in a tab.
                </>
            }
            subtitle="Lint, beautify, minify, dark-mode test, copy email designs, convert SVG to PNG, turn HTML into an image, and scale image elements without leaving the browser. No signups, no uploads — every tool runs locally on your machine."
        >
            <a href="/tools/code-fix" className="btn-primary">Open the linter</a>
            <a href="/templates" className="btn-secondary">Free templates</a>
        </PageHero>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {tools.map(({ id, label, description, icon: Icon, tone }) => (
                <a
                    key={id}
                    href={`/tools/${id}`}
                    className="group card p-7 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                    <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${tone} opacity-60 blur-2xl group-hover:opacity-90 transition-opacity`} />
                    <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${tone} ring-1 mb-5`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="relative text-xl font-display font-bold text-white mb-2">{label}</h3>
                    <p className="relative text-sm text-ink-300 leading-relaxed">{description}</p>
                    <span className="relative inline-flex items-center gap-1 text-sm font-medium text-brand-300 mt-5 group-hover:text-brand-200">
                        Launch tool
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                </a>
            ))}
        </section>

        <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
            <h2 className="section-title mb-5">Why a code-first toolkit beats a drag-and-drop builder</h2>
            <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                <p>
                    Drag-and-drop email builders generate roughly 30–50% more HTML than a hand-coded template. That bloat eats into Gmail's 102KB clipping budget, slows mobile load, and hides rendering bugs behind layers of nested tables you didn't write.
                </p>
                <p>
                    A code-first toolkit is the opposite philosophy. You write or maintain the HTML yourself, and EMLinter gives you fast utilities — linter, beautifier, minifier, dark-mode preview — to keep that code clean. Result: smaller emails, fewer rendering surprises, and full control over every byte.
                </p>
            </div>
        </section>

        <SeoFaq title="Developer Tools FAQs" items={faqs} />
    </div>
);

export default ToolsHubPage;
