import Layout from "../components/Layout";

const PrivacyPolicy = () => {

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-center font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Effective Date: May 8, 2025</p>

        <div className="prose prose-lg">
          <p className="mb-6">
            Amphytheatre ("we", "our", or "us") is committed to protecting your privacy and maintaining the confidentiality of your personal information in accordance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).
          </p>
          <p className="mb-8">
            This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services.
          </p>

          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect the following types of information:</p>
          
          <h3 className="text-xl font-semibold mb-2">a) User-Submitted Content</h3>
          <p className="mb-4">When you interact with our recommendation engine, we collect the prompts and text you submit (e.g., moods, scenes, or vibes) and the quotes you choose.</p>

          <h3 className="text-xl font-semibold mb-2">b) Session Analytics & Replays</h3>
          <p className="mb-4">We use PostHog to record anonymous session data, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Mouse movements, clicks, scroll behavior, and interaction patterns</li>
            <li>Pages visited and time spent</li>
            <li>Session duration and navigation flow</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">c) Technical and Usage Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Your device type, browser, operating system, and screen resolution</li>
            <li>IP address (used to infer approximate geographic location)</li>
            <li>Referral source (e.g., how you found us)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">d) Cookies and Tracking Technologies</h3>
          <p className="mb-4">We use cookies and local storage to maintain session continuity and gather usage analytics. You can disable cookies in your browser settings, but it may affect site functionality.</p>

          <h3 className="text-xl font-semibold mb-2">e) Email Address (if provided)</h3>
          <p className="mb-6">If you sign up or create an account, we collect your email address to provide services, send updates, and manage user preferences.</p>

          <h2 className="text-2xl font-semibold mb-4">2. Why We Collect Your Information</h2>
          <p className="mb-4">We collect and use personal information for the following purposes:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>To provide personalized movie recommendations</li>
            <li>To analyze and improve user experience and site performance</li>
            <li>To identify and fix usability issues through session replay analysis</li>
            <li>To communicate with users who sign up (e.g., for updates, feedback, or account support)</li>
            <li>To monitor traffic sources and improve marketing effectiveness</li>
            <li>To comply with legal obligations and ensure platform integrity</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">3. Consent</h2>
          <p className="mb-4">By using Amphytheatre, you consent to our collection, use, and disclosure of your personal information as described in this Privacy Policy.</p>
          <p className="mb-6">If you submit an email address or interact with our input forms, you provide implied consent under PIPEDA. If we require more sensitive data in the future, we will seek express consent.</p>

          <h2 className="text-2xl font-semibold mb-4">4. Disclosure of Personal Information</h2>
          <p className="mb-4">We do not sell or rent your data.</p>
          <p className="mb-4">We may disclose personal information to trusted third-party service providers for the purposes listed above, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>OpenAI (for generating recommendations using submitted prompts and selected quotes)</li>
            <li>PostHog (for analytics and session replays)</li>
            <li>Hosting providers and infrastructure tools used to deliver our services</li>
          </ul>
          <p className="mb-6">All third parties are contractually obligated to maintain the confidentiality and security of your data.</p>

          <h2 className="text-2xl font-semibold mb-4">5. Storage and Data Retention</h2>
          <p className="mb-4">Data is stored securely on cloud servers managed by our analytics and hosting partners, which may be located outside of Canada (e.g., the United States or EU).</p>
          <p className="mb-4">We retain session replays and analytics data only as long as necessary to fulfill the purposes outlined in this policy.</p>
          <p className="mb-6">You may request deletion of your personal data at any time (see Section 7).</p>

          <h2 className="text-2xl font-semibold mb-4">6. Safeguards and Security</h2>
          <p className="mb-4">We implement reasonable administrative, technical, and physical safeguards to protect your data against unauthorized access, misuse, or disclosure. This includes:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>HTTPS encryption for all data in transit</li>
            <li>Role-based access to sensitive systems</li>
            <li>Monitoring of platform activity and access logs</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">7. Your Rights Under PIPEDA</h2>
          <p className="mb-4">As a Canadian user, you have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access the personal information we hold about you</li>
            <li>Correct any inaccurate or incomplete information</li>
            <li>Withdraw your consent (where applicable)</li>
            <li>Request deletion of your personal data</li>
          </ul>
          <p className="mb-6">
            To exercise any of these rights, email us at:<br />
            <a href="mailto:amphytheatremovierec@gmail.com" className="text-blue-500 hover:text-blue-700">amphytheatremovierec@gmail.com</a><br />
            Subject line: "Privacy Request – Amphytheatre"
          </p>

          <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
          <p className="mb-6">Our website may link to third-party platforms (e.g., Netflix, Prime Video, affiliate platforms). This Privacy Policy does not apply to those services, and we are not responsible for their privacy practices.</p>

          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
          <p className="mb-6">We may update this Privacy Policy periodically. Changes will be posted to this page with a new effective date. We encourage you to review this page regularly for updates.</p>

          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p className="mb-4">If you have any questions, requests, or concerns about your privacy or this policy, please contact:</p>
          <p className="mb-4">
            Email: <a href="mailto:amphytheatremovierec@gmail.com" className="text-blue-500 hover:text-blue-700">amphytheatremovierec@gmail.com</a><br />
            Subject: Privacy Request – Amphytheatre
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;

