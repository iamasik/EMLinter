import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { HtmlValidationError } from '../../types';
import { validateHtml } from '../../services/htmlValidator';
import { beautifyHtml } from '../../services/htmlBeautifier';
import { AlertTriangleIcon, SpinnerIcon, CheckCircleIcon, UploadIcon } from '../Icons';
import UploadHtmlModal from '../modals/UploadHtmlModal';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const initialHtml = `<!-- A sample HTML email with intentional errors -->
<table width="600" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <h1>Welcome!</h1>
      <p>Here is some content.</p>
      <table>
        <tr>
          <td>Nested Content Cell 1</td>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      <img src="https://picsum.photos/600/150" alt="Banner">
    </td>
  </tr>
</table>
`;

const faqs = [
    {
        question: 'What does an HTML email linter check for?',
        answer: 'A purpose-built HTML email linter checks for unclosed and mismatched tags, broken table nesting, missing alt attributes on images, missing role="presentation" on layout tables, and Outlook-specific bugs like <div> inside <td> or unsupported CSS properties. Browser-grade validators miss most of these because they only check generic HTML5.',
    },
    {
        question: 'How is this different from a regular HTML validator?',
        answer: 'A regular HTML validator (like the W3C tool) enforces HTML5 spec compliance — useful for websites, mostly irrelevant for email. Email clients use 1999-era rendering engines, strip CSS aggressively, and break on patterns modern browsers accept. EMLinter\'s linter is rule-tuned for email, not the web.',
    },
    {
        question: 'Will fixing the errors guarantee my email renders perfectly?',
        answer: 'It eliminates the most common rendering bugs — broken layouts from malformed tables, mysterious gaps from unclosed tags, Outlook-only formatting failures. For a true render guarantee, also use the dark-mode tester and the Outlook generators on this site. Then send a real test with our HTML Email Test tool.',
    },
    {
        question: 'Can I beautify the code while validating?',
        answer: 'Yes. The "Beautify & Validate" button runs both steps in sequence: format the code into clean indentation, then run the validator on the cleaned version. Helpful when you\'re working with minified or copy-pasted templates where errors are hard to spot.',
    },
    {
        question: 'Does the linter handle Outlook VML and conditional comments?',
        answer: 'Yes. Conditional comments and VML blocks are recognized and excluded from standard tag-pair validation — they\'re intentionally malformed to non-Outlook clients, so flagging them would be a false positive.',
    },
    {
        question: 'Is my HTML code uploaded to a server when I lint it?',
        answer: 'Never. The linter runs 100% in your browser. Your code, including any unreleased campaigns, never leaves your device. Same goes for the beautifier, minifier, dark-mode tester, and Outlook generators on this site.',
    },
];

interface HighlightedCodeViewProps {
    htmlContent: string;
    errors: HtmlValidationError[];
}

const HighlightedCodeView: React.FC<HighlightedCodeViewProps> = ({ htmlContent, errors }) => {
    const errorMap = useMemo(() => {
        const map = new Map<number, HtmlValidationError>();
        errors.forEach((e) => map.set(e.lineNumber, e));
        return map;
    }, [errors]);
    const lines = useMemo(() => htmlContent.split('\n'), [htmlContent]);

    return (
        <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-ink-900/40">
                <h3 className="text-sm font-semibold text-ink-200 uppercase tracking-wider">Annotated HTML</h3>
                <span className="text-xs text-ink-400">{errors.length} {errors.length === 1 ? 'issue' : 'issues'}</span>
            </div>
            <div className="font-mono text-xs md:text-sm bg-ink-950/80 max-h-[600px] overflow-auto custom-scrollbar">
                {lines.map((line, index) => {
                    const lineNumber = index + 1;
                    const error = errorMap.get(lineNumber);
                    if (error && error.errorTag) {
                        const safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        const tag = error.errorTag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        const highlighted = safe.split(tag).reduce((acc, part, i, arr) => {
                            return i < arr.length - 1
                                ? acc + part + `<span class="bg-brand-500/30 text-white rounded px-1">${tag}</span>`
                                : acc + part;
                        }, '');
                        return (
                            <div key={lineNumber} className="flex bg-brand-500/10">
                                <span className="w-12 text-right pr-3 text-ink-500 select-none border-r border-white/5">{lineNumber}</span>
                                <pre className="flex-1 whitespace-pre-wrap text-ink-100 px-3" dangerouslySetInnerHTML={{ __html: highlighted }} />
                            </div>
                        );
                    }
                    return (
                        <div key={lineNumber} className="flex">
                            <span className="w-12 text-right pr-3 text-ink-500 select-none border-r border-white/5">{lineNumber}</span>
                            <pre className="flex-1 whitespace-pre-wrap text-ink-200 px-3">{line}</pre>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CodeFixPage: React.FC = () => {
    const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
    const [errors, setErrors] = useState<HtmlValidationError[]>([]);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [analysisPerformed, setAnalysisPerformed] = useState<boolean>(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const timeoutIdRef = useRef<number | undefined>(undefined);

    useEffect(() => () => { if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current); }, []);

    const handleBeautifyAndValidate = useCallback(() => {
        setIsChecking(true);
        setErrors([]);
        setAnalysisPerformed(false);
        if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
        const beautified = beautifyHtml(htmlContent);
        setHtmlContent(beautified);
        timeoutIdRef.current = window.setTimeout(() => {
            setErrors(validateHtml(beautified));
            setIsChecking(false);
            setAnalysisPerformed(true);
        }, 400);
    }, [htmlContent]);

    const handleValidateOnly = useCallback(() => {
        setIsChecking(true);
        setErrors([]);
        setAnalysisPerformed(false);
        if (timeoutIdRef.current) window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = window.setTimeout(() => {
            setErrors(validateHtml(htmlContent));
            setIsChecking(false);
            setAnalysisPerformed(true);
        }, 400);
    }, [htmlContent]);

    return (
        <div>
            <UploadHtmlModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={(html) => { setHtmlContent(html); setAnalysisPerformed(false); setErrors([]); }} />

            <PageHero
                eyebrow="HTML Email Linter"
                title={
                    <>
                        Find broken tags before <span className="gradient-text">Outlook does</span>.
                    </>
                }
                subtitle="A free HTML email linter that catches the bugs only email clients care about — unclosed tags, broken table nesting, and Outlook-specific rendering traps. Paste your HTML, get a line-by-line breakdown."
            >
                <a href="#editor" className="btn-primary">Open the linter</a>
                <a href="/tools/beautify-code" className="btn-secondary">Beautify first</a>
            </PageHero>

            <section id="editor" className="card p-6 md:p-8 mb-12">
                <div className="flex justify-between items-center mb-3">
                    <label htmlFor="html-input" className="text-base font-semibold text-white">Paste HTML to validate</label>
                    <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-accent-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <UploadIcon className="w-4 h-4" /> Upload template
                    </button>
                </div>
                <textarea
                    id="html-input"
                    value={htmlContent}
                    onChange={(e) => { setHtmlContent(e.target.value); setAnalysisPerformed(false); setErrors([]); }}
                    className="w-full h-64 p-4 font-mono text-sm bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-y custom-scrollbar"
                    placeholder="<table>...</table>"
                />
                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button onClick={handleValidateOnly} disabled={isChecking} className="btn-secondary w-full sm:w-auto disabled:opacity-50">Validate HTML</button>
                    <button onClick={handleBeautifyAndValidate} disabled={isChecking} className="btn-primary w-full sm:w-auto disabled:opacity-50">
                        {isChecking ? <><SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> Checking…</> : 'Beautify & Validate'}
                    </button>
                </div>
            </section>

            {isChecking && (
                <div className="text-center mb-12">
                    <SpinnerIcon className="animate-spin h-10 w-10 text-brand-500 mx-auto mb-3" />
                    <p className="text-ink-300 text-sm">Analyzing your HTML…</p>
                </div>
            )}

            {analysisPerformed && !isChecking && (
                <section className="mb-16">
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-center">Analysis results</h2>
                    {errors.length === 0 ? (
                        <div className="card p-10 border-emerald-400/30 text-center max-w-2xl mx-auto">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-300 grid place-items-center mb-4">
                                <CheckCircleIcon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-2">All clear</h3>
                            <p className="text-ink-300 text-sm">We scanned your HTML and found no mismatched or unclosed tags. Ready to send.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <HighlightedCodeView htmlContent={htmlContent} errors={errors} />
                            <div className="card p-6 border-amber-400/20">
                                <h3 className="text-lg font-display font-bold mb-4 text-amber-300 flex items-center gap-2">
                                    <AlertTriangleIcon className="w-5 h-5" />
                                    Found {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
                                </h3>
                                <ul className="space-y-3 text-sm text-ink-200">
                                    {errors.map((error, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="bg-amber-300 text-ink-950 font-bold rounded-full w-6 h-6 text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">{index + 1}</span>
                                            <div>
                                                <p className="font-semibold text-white">{error.message}</p>
                                                <p className="text-xs text-ink-400 font-mono mt-1">Line {error.lineNumber}: <code className="text-ink-300">{error.lineContent.trim()}</code></p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>
            )}

            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Why email needs its own linter</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        Email clients are not browsers. Gmail strips your <code>&lt;style&gt;</code> tag. Outlook ignores <code>border-radius</code>. Yahoo flattens your CSS-grid layout to a single column. The W3C HTML validator does not know any of this — it tells you your HTML is fine, then you ship and Outlook breaks the layout.
                    </p>
                    <p>
                        EMLinter's HTML email linter is rule-tuned for these clients. It flags broken table nesting (the #1 cause of Outlook layout collapse), unclosed tags (the #1 cause of "everything below this looks broken" bugs), missing image alt text (deliverability + accessibility), and the patterns email clients specifically choke on. It is the validator you'd use if you were writing a coding standard for an email-development team.
                    </p>
                </div>
            </section>

            <SeoFaq title="HTML Email Linter FAQs" items={faqs} />
        </div>
    );
};

export default CodeFixPage;
