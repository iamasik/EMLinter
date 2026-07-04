import React, { useState } from 'react';
import { CloseIcon } from '../Icons';
import ActionInfoModal from './ActionInfoModal';

const InstructionsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  if (!isOpen) return null;

  // New class for highlighting special vibe classes
  const highlightClass = "bg-pink-900/50 text-pink-400 px-1.5 py-1 rounded-md text-xs border border-pink-700/50 font-mono";
  const codeBlockHighlightClass = "text-pink-400 font-bold";

  // Raw code strings
  const rawImgExample = `<img src="..." class="vibe-img" ... />`;
  const rawTextExample = `<tr>
  <td class="vibe-text" style="font-family:Arial,sans-serif; font-size:16px; color:#000000;">
    Message from the General Manager
  </td>
</tr>`;
  const rawSectionExample = `<tr class="vibe-section">
  <td style="padding: 10px 30px; background-color: #db1d36;">
    <table width="100%">
      <tr>
        <td>
          <a href="...">
            <img class="vibe-img" src="..." ... />
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
  const rawBgExample = `<tr class="vibe-section">
  <td class="vibe-bg" bgcolor="#F2F2F2" background="..." style="background: url(...);">
    <!--[if gte mso 9]>
    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
      <v:fill type="frame" src="..." color="#F2F2F2" />
      <v:textbox inset="0,0,0,0">
    <![endif]-->
    <div>
      <!-- Your content here -->
    </div>
    <!--[if gte mso 9]>
      </v:textbox>
    </v:rect>
    <![endif]-->
  </td>
</tr>`;
 const rawPreviewTextExample = `<body ...>
  <span class="PreviewText" style="display:none; ...">Your preview text here...</span>
  <table ...>
    ...
  </table>
</body>`;


  // Function to create highlighted HTML from a raw code string
  const createHighlightedCode = (code: string) => {
    const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    return escapedCode
        .replace(/class="vibe-img"/g, `class="<span class='${codeBlockHighlightClass}'>vibe-img</span>"`)
        .replace(/class="vibe-text"/g, `class="<span class='${codeBlockHighlightClass}'>vibe-text</span>"`)
        .replace(/class="vibe-section"/g, `class="<span class='${codeBlockHighlightClass}'>vibe-section</span>"`)
        .replace(/class="vibe-bg"/g, `class="<span class='${codeBlockHighlightClass}'>vibe-bg</span>"`)
        .replace(/class="PreviewText"/g, `class="<span class='${codeBlockHighlightClass}'>PreviewText</span>"`);
  };

  return (
    <>
      <ActionInfoModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        actionType="hireMe"
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col p-6 relative" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex-shrink-0">
            <div className="flex justify-between items-start mb-4 gap-4">
                <h2 className="text-2xl font-semibold text-gray-200">How to Make Your Template Editable</h2>
                <div className="flex items-start gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-300">Need help with compatibility?</p>
                        <button onClick={() => setIsActionModalOpen(true)} className="text-xs text-pink-400 hover:underline font-semibold">
                            Hire me to make your template fully editable &rarr;
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <p className="text-gray-400 mb-6">
              To make elements in your HTML email visually editable with Vibe, you need to add specific class names. This allows our editor to identify which parts you want to change.
            </p>
          </div>

          <div className="space-y-6 flex-grow overflow-y-auto pr-4">
            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">1. Image Editing</h3>
              <p className="text-gray-300 mb-3">
                For any image (<code className="bg-gray-700 px-1 py-0.5 rounded text-xs">&lt;img&gt;</code>), add the class <code className={highlightClass}>vibe-img</code>.
              </p>
              <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: createHighlightedCode(rawImgExample) }} />
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">2. Text & Link Editing</h3>
              <p className="text-gray-300 mb-3">
                For any element containing text (<code className="bg-gray-700 px-1 py-0.5 rounded text-xs">&lt;td&gt;</code>, <code className="bg-gray-700 px-1 py-0.5 rounded text-xs">&lt;p&gt;</code>, etc.), add the class <code className={highlightClass}>vibe-text</code>.
              </p>
              <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: createHighlightedCode(rawTextExample) }} />
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">3. Section Editing</h3>
              <p className="text-gray-300 mb-3">
                To make a whole section (like a <code className="bg-gray-700 px-1 py-0.5 rounded text-xs">&lt;tr&gt;</code>) editable, add the class <code className={highlightClass}>vibe-section</code>.
              </p>
              <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: createHighlightedCode(rawSectionExample) }} />
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">4. Background Editing</h3>
              <p className="text-gray-300 mb-3">
                  To make a table cell's (<code className="bg-gray-700 px-1 py-0.5 rounded text-xs">&lt;td&gt;</code>) background editable, add the class <code className={highlightClass}>vibe-bg</code>. Ensure your HTML includes the VML code for Outlook compatibility.
              </p>
              <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: createHighlightedCode(rawBgExample) }} />
              </pre>
            </div>
             <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">5. Preview Text</h3>
              <p className="text-gray-300 mb-3">
                Email preview text (or preheader) is the snippet shown after the subject line. Use the "Preview Text" tool in the editor to add or update it. This tool looks for a <code className="bg-gray-700 px-1 py-0.5 rounded text-xs">&lt;span&gt;</code> with the class <code className={highlightClass}>PreviewText</code>.
              </p>
              <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: createHighlightedCode(rawPreviewTextExample) }} />
              </pre>
            </div>
          </div>

          <div className="mt-6 text-right flex-shrink-0">
            <button onClick={onClose} className="px-6 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors duration-200">
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default InstructionsModal;