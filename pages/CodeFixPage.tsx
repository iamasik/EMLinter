import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { HtmlValidationError } from '../types';
import { validateHtml } from '../services/htmlValidator';
import { beautifyHtml } from '../services/htmlBeautifier';
import { 
    AlertTriangleIcon, SpinnerIcon, CheckCircleIcon, UploadIcon
} from '../components/Icons';
import UploadHtmlModal from '../components/modals/UploadHtmlModal';

const initialHtml = `<!-- This is a sample HTML email with intentional errors -->
<table width="600" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <h1>Welcome!</h1>
      <p>Here is some content.</p>
      <table>
        <tr>
          <td>Nested Content Cell 1</td>
      </table> <!-- Error: Missing </tr> and </td> -->
    </td>
  </tr>
  <tr>
    <td>
      <img src="https://picsum.photos/600/150" alt="Banner">
    </td>
  </tr>
</table>
`;

interface HighlightedCodeViewProps {
  htmlContent: string;
  errors: HtmlValidationError[];
}

const HighlightedCodeView: React.FC<HighlightedCodeViewProps> = ({ htmlContent, errors }) => {
  const errorMap = useMemo(() => {
    const map = new Map<number, HtmlValidationError>();
    errors.forEach(error => map.set(error.lineNumber, error));
    return map;
  }, [errors]);

  const lines = useMemo(() => htmlContent.split('\n'), [htmlContent]);

  return (
    <div className="bg-[#282c34] rounded-lg shadow-lg overflow-hidden w-full">
      <div className="p-4 border-b border-gray-600 flex items-center justify-between">
        <h3 className="font-semibold text-gray-300">Body (HTML)</h3>
      </div>
      <div className="font-mono text-sm">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const error = errorMap.get(lineNumber);
          
          if (error && error.errorTag) {
            const safeLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeErrorTag = error.errorTag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            const parts = safeLine.split(safeErrorTag);
            let highlightedHtml = safeLine;
            
            if (parts.length > 1) {
              highlightedHtml = parts.reduce((acc, part, i) => {
                if (i < parts.length - 1) {
                  return acc + part + `<span class="bg-pink-600 text-white rounded px-1 py-0.5">${safeErrorTag}</span>`;
                }
                return acc + part;
              }, '');
            }

            return (
              <div key={lineNumber} className={`flex ${error ? 'bg-pink-900/20' : ''}`}>
                <span className="w-12 text-right pr-4 text-gray-500 select-none">{lineNumber}</span>
                <pre className="flex-1 whitespace-pre-wrap text-gray-300" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
              </div>
            );
          }

          return (
            <div key={lineNumber} className={`flex`}>
              <span className="w-12 text-right pr-4 text-gray-500 select-none">{lineNumber}</span>
              <pre className="flex-1 whitespace-pre-wrap text-gray-300">{line}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const CodeFixPage = () => {
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
  const [errors, setErrors] = useState<HtmlValidationError[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [analysisPerformed, setAnalysisPerformed] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const timeoutIdRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "EMLinter - HTML Email Linter",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web/Online",
      "description": "Instantly validate your HTML email code. Our linter finds and helps you fix unclosed tags, CSS errors, and Outlook-specific bugs. Get a perfect render every time.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "browserRequirements": "Requires a modern web browser with JavaScript enabled."
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'tool-schema';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('tool-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);


  const handleBeautifyAndValidate = useCallback(() => {
    setIsChecking(true);
    setErrors([]);
    setAnalysisPerformed(false);
    
    if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
    }

    const beautifiedHtml = beautifyHtml(htmlContent);
    setHtmlContent(beautifiedHtml);

    timeoutIdRef.current = window.setTimeout(() => {
        const validationErrors = validateHtml(beautifiedHtml);
        setErrors(validationErrors);
        setIsChecking(false);
        setAnalysisPerformed(true);
    }, 500);
  }, [htmlContent]);
  
  const handleValidateOnly = useCallback(() => {
    setIsChecking(true);
    setErrors([]);
    setAnalysisPerformed(false);
  
    if (timeoutIdRef.current) {
      window.clearTimeout(timeoutIdRef.current);
    }
  
    timeoutIdRef.current = window.setTimeout(() => {
      const validationErrors = validateHtml(htmlContent);
      setErrors(validationErrors);
      setIsChecking(false);
      setAnalysisPerformed(true);
    }, 500);
  }, [htmlContent]);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    setAnalysisPerformed(false);
    setErrors([]);
  };
  
  const handleUpload = (html: string) => {
    setHtmlContent(html);
    setAnalysisPerformed(false);
    setErrors([]);
  };

  return (
    <>
      <title>HTML Email Linter & Code Fixer | EMLinter</title>
      <meta name="description" content="Instantly validate your HTML email code. Our linter finds and helps you fix unclosed tags, CSS errors, and Outlook-specific bugs. Get a perfect render every time." />
      <link rel="canonical" href="https://emlinter.app/code-fix" />
      <UploadHtmlModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
          HTML Email Linter
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Validate your email's HTML for tag errors to ensure perfect rendering across all clients.
        </p>
      </header>

      <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="html-input" className="block text-lg font-medium text-gray-300">
              Paste your HTML code below
            </label>
            <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-800/30 rounded-lg hover:bg-violet-800/60 transition-colors duration-200"
            >
                <UploadIcon className="w-4 h-4" />
                <span>Upload Template</span>
            </button>
        </div>
        <textarea
          id="html-input"
          value={htmlContent}
          onChange={handleHtmlChange}
          className="w-full h-64 p-4 font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 resize-y"
          placeholder="<table>...</table>"
        />
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleValidateOnly}
              disabled={isChecking}
              className="px-8 py-3 w-full sm:w-auto font-semibold text-violet-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Validate HTML
            </button>
            <button
              onClick={handleBeautifyAndValidate}
              disabled={isChecking}
              className="px-8 py-3 w-full sm:w-auto font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 rounded-lg hover:from-pink-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform duration-200 shadow-lg flex items-center justify-center"
            >
              {isChecking ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Checking...
                </>
              ) : (
                'Beautify & Validate'
              )}
            </button>
        </div>
      </div>

      <div className="mt-12">
        {isChecking && (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 text-center">Analyzing...</h2>
                <p className="text-gray-400">Please wait while we check your code for errors.</p>
            </div>
        )}

        {analysisPerformed && !isChecking && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Analysis Results</h2>
            {errors.length === 0 ? (
              <div className="bg-gray-800/50 rounded-xl shadow-lg p-8 border-green-500/30 border text-center">
                <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100">All Clear!</h3>
                <p className="text-gray-400 mt-2">
                  We've scanned your HTML and found no mismatched or unclosed tags.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <HighlightedCodeView htmlContent={htmlContent} errors={errors} />
                <div className="bg-gray-800/50 rounded-xl shadow-lg p-6 border border-yellow-500/30">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center">
                    <AlertTriangleIcon className="w-6 h-6 mr-2" />
                    Found {errors.length} Error(s)
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-yellow-400 text-gray-900 font-bold rounded-full w-6 h-6 text-sm flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold">{error.message}</p>
                          <p className="text-sm text-gray-400 font-mono">
                            Line {error.lineNumber}: <code>{error.lineContent.trim()}</code>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
export default CodeFixPage;