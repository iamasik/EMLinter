import { $ as $$BaseLayout } from './BaseLayout_CLZKUz5E.mjs';
import { c as createComponent } from './astro-component_DyprLGAi.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_BgjnLLDV.mjs';
import { $ as $$SeoFallback } from './SeoFallback_BaCjZX_7.mjs';

const $$HtmlEmailTest = createComponent(($$result, $$props, $$slots) => {
  const faqSchema = [
    { question: "How does the HTML Email Test work?", answer: "You provide a sender email (typically Gmail with an App Password), receiver address(es), a subject, and your HTML content. The tool sends a real email through your provider so you can preview rendering in the actual target inbox." },
    { question: "Why an App Password and not my normal Google password?", answer: "Google has required App Passwords for SMTP-style logins since 2022. They are randomly-generated 16-character codes scoped to a single app, revocable any time, and safer than your real password." },
    { question: "Are my credentials stored on your servers?", answer: "No. Credentials are stored only in your browser's localStorage on your device. The send request goes from your browser to our serverless email proxy which uses them once and discards them." },
    { question: "Can I send to multiple recipients at once?", answer: "Yes. Add as many receiver emails as you like — they're queued and sent sequentially with a small delay." },
    { question: "What's the difference between this and Litmus or Email on Acid?", answer: "Litmus and Email on Acid render previews using virtual machines for every email client. This tool sends a real email to your real inbox — cheaper and faster for spot-checks." },
    { question: "Why isn't my test email arriving?", answer: "Check spam first. If still missing, verify your App Password is correct, the sender domain isn't blocked, and your subject line isn't triggering aggressive filters." }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "HTML Email Test — Send Real Test Emails | EMLinter", "description": "Free HTML email test tool. Send a real test email to Gmail, Outlook, Apple Mail & Yahoo via your Gmail App Password to check rendering before you ship.", "keywords": "html email test, test html email, send test email, email rendering test, inbox preview test", "faqSchema": faqSchema }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HtmlEmailTestPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/components/pages/HtmlEmailTestPage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${renderComponent($$result3, "SeoFallback", $$SeoFallback, { "slot": "fallback", "heading": "Send a real test email and see the truth.", "intro": "Send your HTML email to a real inbox via your own Gmail App Password. Check Gmail, Outlook, Apple Mail, or Yahoo rendering with one click — no virtual machines, no Litmus subscription.", "links": [
    { href: "/solutions/outlook-button-generator", label: "Outlook Button Generator" },
    { href: "/tools/dark-mode-checker", label: "Dark Mode Tester" },
    { href: "/solutions", label: "All Outlook Solutions" }
  ] })}` })} ` })}`;
}, "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/html-email-test.astro", void 0);

const $$file = "C:/Users/DH Asik/Desktop/Project/emlinter-astro/src/pages/solutions/html-email-test.astro";
const $$url = "/solutions/html-email-test";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HtmlEmailTest,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
