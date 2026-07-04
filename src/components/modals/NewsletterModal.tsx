import React, { useEffect } from 'react';
import { CloseIcon } from '../Icons';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Inject Mailchimp CSS
      const link = document.createElement('link');
      link.id = 'mailchimp-css';
      link.href = '//cdn-images.mailchimp.com/embedcode/classic-061523.css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);

      // Inject Mailchimp validation script
      const script = document.createElement('script');
      script.id = 'mailchimp-script';
      script.src = '//s3.amazonaws.com/downloads/mailchimp.com/js/mc-validate.js';
      script.type = 'text/javascript';
      document.body.appendChild(script);

      // Inject Mailchimp jQuery config script
      const configScript = document.createElement('script');
      configScript.id = 'mailchimp-config';
      configScript.type = 'text/javascript';
      configScript.innerHTML = `(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[1]='FNAME';ftypes[1]='text';fnames[0]='EMAIL';ftypes[0]='email';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='ADDRESS';ftypes[3]='address';fnames[4]='PHONE';ftypes[4]='phone';fnames[5]='BIRTHDAY';ftypes[5]='birthday';}(jQuery));var $mcj = jQuery.noConflict(true);`;
      
      // We need to wait for mc-validate.js to load jQuery
      script.onload = () => {
        document.body.appendChild(configScript);
      };

      return () => {
        // Cleanup on modal close
        document.getElementById('mailchimp-css')?.remove();
        document.getElementById('mailchimp-script')?.remove();
        document.getElementById('mailchimp-config')?.remove();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        {/* Custom Mailchimp Form Styles */}
        <style>{`
          #mc_embed_signup {
            background: transparent;
            width: 100%;
            padding: 2.5rem 1.5rem 1.5rem 1.5rem; /* 40px 24px 24px 24px */
            color: #D1D5DB; /* text-gray-300 */
          }
          #mc_embed_signup h2 {
            font-size: 1.5rem; /* 24px */
            line-height: 2rem; /* 32px */
            font-weight: 600;
            color: #F9FAFB; /* text-gray-50 */
            margin-bottom: 1rem; /* 16px */
            text-align: center;
          }
          #mc_embed_signup .mc-field-group {
            margin-bottom: 1rem;
            padding-bottom: 0;
            width: 100% !important;
          }
          #mc_embed_signup .mc-field-group label {
            display: block;
            margin-bottom: 0.5rem; /* 8px */
            font-size: 0.875rem; /* 14px */
            font-weight: 500;
            color: #9CA3AF; /* text-gray-400 */
          }
          #mc_embed_signup .mc-field-group input {
            width: 100%;
            padding: 0.75rem; /* 12px */
            font-size: 0.875rem; /* 14px */
            color: #F9FAFB; /* text-gray-50 */
            background-color: #1F2937; /* bg-gray-800 */
            border: 1px solid #4B5563; /* border-gray-600 */
            border-radius: 0.5rem; /* rounded-lg */
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          #mc_embed_signup .mc-field-group input:focus {
            outline: none;
            border-color: #EC4899; /* border-pink-500 */
            box-shadow: 0 0 0 2px #be185d; /* ring-2 ring-pink-500 */
          }
          #mc_embed_signup .indicates-required {
            text-align: right;
            font-size: 0.75rem; /* 12px */
            color: #9CA3AF; /* text-gray-400 */
          }
          #mc_embed_signup #mc-embedded-subscribe {
            width: 100%;
            height: auto !important; /* Override fixed height from Mailchimp CSS */
            margin-top: 1.5rem; /* 24px */
            padding: 0.85rem 1rem; /* ~14px 16px */
            font-weight: 600;
            color: white;
            background-image: linear-gradient(to right, #db2777, #7e22ce); /* from-pink-600 to-violet-600 */
            border: none;
            cursor: pointer;
            border-radius: 0.5rem; /* rounded-lg */
            transition: all 0.2s;
          }
          #mc_embed_signup #mc-embedded-subscribe:hover {
            background-image: linear-gradient(to right, #be185d, #6b21a8); /* from-pink-700 to-violet-700 */
          }
          /* Hide the Mailchimp referral badge */
          #mc_embed_signup p a[href*="eepurl.com"] {
            display: none !important;
          }
          #mc_embed_signup #mce-responses .response {
            margin: 1em 0;
            padding: 1em .5em .5em 0;
            font-weight: bold;
          }
          #mc_embed_signup #mce-error-response {
            background-color: #ef4444; /* bg-red-500 */
            color: white;
            padding: 1em;
            border-radius: 0.5rem;
          }
          #mc_embed_signup #mce-success-response {
            background-color: #22c55e; /* bg-green-500 */
            color: white;
            padding: 1em;
            border-radius: 0.5rem;
          }
        `}</style>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div id="mc_embed_signup">
          <form action="https://gmail.us2.list-manage.com/subscribe/post?u=d626ff05627d1d76774c4c926&amp;id=ee8c8cb73f&amp;f_id=006991e3f0" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank">
            <div id="mc_embed_signup_scroll">
              <h2>Stay Ahead – Get Essential Updates First!</h2>
              <div className="indicates-required"><span className="asterisk">*</span> indicates required</div>
              <div className="mc-field-group">
                <label htmlFor="mce-FNAME">First Name <span className="asterisk">*</span></label>
                <input type="text" name="FNAME" className="required text" id="mce-FNAME" defaultValue="" required={true} />
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">Email Address <span className="asterisk">*</span></label>
                <input type="email" name="EMAIL" className="required email" id="mce-EMAIL" required={true} defaultValue="" />
              </div>
              <div id="mce-responses" className="clear foot">
                <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                <input type="text" name="b_d626ff05627d1d76774c4c926_ee8c8cb73f" tabIndex={-1} defaultValue="" />
              </div>
              <div className="optionalParent">
                <div className="clear foot">
                  <input type="submit" name="subscribe" id="mc-embedded-subscribe" className="button" value="Subscribe" />
                  <p style={{ margin: '0px auto' }}>
                    <a href="http://eepurl.com/iRhlU6" title="Mailchimp - email marketing made easy and fun">
                      <span style={{ display: 'inline-block', backgroundColor: 'transparent', borderRadius: '4px' }}>
                        <img className="refferal_badge" src="https://digitalasset.intuit.com/render/content/dam/intuit/mc-fe/en_us/images/intuit-mc-rewards-text-dark.svg" alt="Intuit Mailchimp" style={{ width: '220px', height: '40px', display: 'flex', padding: '2px 0px', justifyContent: 'center', alignItems: 'center' }} />
                      </span>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;