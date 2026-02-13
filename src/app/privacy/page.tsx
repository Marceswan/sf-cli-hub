import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SFDX Hub',
  description: 'Privacy Policy for SFDX Hub - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            Last Updated: February 13, 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Swan Media Co. ("we," "us," or "our") operates sfdxhub.com (the "Site"), branded as SFDX Hub.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                you visit our Site and use our services.
              </p>
              <p className="text-gray-700 mb-4">
                SFDX Hub is a community-driven web registry for Salesforce developer tools where users can browse,
                search, submit, rate, and review Salesforce CLI plugins, Lightning Web Component libraries,
                Apex utilities, Agentforce tools, and other developer resources.
              </p>
              <p className="text-gray-700">
                Please read this Privacy Policy carefully. By using the Site, you consent to the practices
                described in this policy. If you do not agree with this Privacy Policy, please do not access
                or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide Directly</h3>
              <p className="text-gray-700 mb-3">
                We collect information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Create an account (name, email address, password)</li>
                <li>Log in via GitHub OAuth (GitHub profile information, email address, public profile data)</li>
                <li>Submit developer tools to our registry</li>
                <li>Write reviews or provide star ratings</li>
                <li>Upload screenshots or images (processed and stored via Cloudinary, maximum 5MB per file)</li>
                <li>Contact us for support or inquiries</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 mb-3">
                When you visit our Site, we automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Log data (IP address, browser type, operating system, referring URLs, pages viewed)</li>
                <li>Device information (device type, screen resolution, browser capabilities)</li>
                <li>Usage analytics (how you interact with our Site, features used, time spent)</li>
                <li>Cookies and similar tracking technologies for session management and authentication</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Third-Party Data</h3>
              <p className="text-gray-700 mb-4">
                We may collect information from third-party services:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>GitHub API:</strong> When you authenticate via GitHub, we receive your public profile information,
                email address, and other data you authorize GitHub to share. We also fetch README files from GitHub repositories
                for tool listings.</li>
                <li><strong>Cloudinary:</strong> Image metadata and processing information for uploaded screenshots.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-3">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Account Management:</strong> To create and manage your user account, authenticate your identity,
                and provide access to personalized features.</li>
                <li><strong>Service Delivery:</strong> To operate and maintain SFDX Hub, display your submissions, reviews,
                and ratings, and enable community interaction.</li>
                <li><strong>Communication:</strong> To send you important updates, notifications about your account,
                responses to inquiries, and service announcements.</li>
                <li><strong>Improvement and Analytics:</strong> To analyze usage patterns, understand user preferences,
                improve our Site's functionality, and develop new features.</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraudulent activity,
                and violations of our Terms of Service.</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes,
                and governmental requests.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Data Storage</h3>
              <p className="text-gray-700 mb-4">
                Your data is stored securely using industry-standard practices:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Database:</strong> User account data and content are stored in a PostgreSQL database
                hosted by Neon with encryption at rest.</li>
                <li><strong>Passwords:</strong> All passwords are hashed using bcryptjs before storage. We never
                store plain-text passwords.</li>
                <li><strong>Sessions:</strong> Authentication sessions are managed using Auth.js v5 with secure
                JWT (JSON Web Token) cookies.</li>
                <li><strong>Images:</strong> Uploaded images are processed and stored by Cloudinary with secure
                CDN delivery.</li>
                <li><strong>Hosting:</strong> Our Site is hosted on Vercel infrastructure with HTTPS encryption
                for all data transmission.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Security Measures</h3>
              <p className="text-gray-700 mb-4">
                We implement reasonable administrative, technical, and physical security measures to protect
                your information from unauthorized access, disclosure, alteration, and destruction. However,
                no method of transmission over the Internet or electronic storage is 100% secure. While we
                strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your
                information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> We share data with trusted third-party service providers
                who assist us in operating our Site (Cloudinary for image hosting, GitHub for authentication,
                Neon for database hosting, Vercel for site hosting). These providers are contractually obligated
                to protect your information.</li>
                <li><strong>Public Content:</strong> Information you choose to make public (tool submissions,
                reviews, ratings, profile information) will be visible to other users and may be indexed by
                search engines.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law,
                court order, or governmental regulation, or if we believe disclosure is necessary to protect
                our rights, your safety, or the safety of others.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization,
                or sale of assets, your information may be transferred as part of that transaction.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-3">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication, session management,
                and core Site functionality. These cookies cannot be disabled without affecting Site operation.</li>
                <li><strong>Analytics Cookies:</strong> Used to understand how visitors interact with our Site,
                which pages are most popular, and how users navigate through our content.</li>
                <li><strong>Preference Cookies:</strong> Store your settings and preferences to provide a
                personalized experience.</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. Most browsers allow you to refuse cookies
                or delete them. However, disabling cookies may affect your ability to use certain features of
                our Site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services, comply
                with legal obligations, resolve disputes, and enforce our agreements. Specifically:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable
                period thereafter to comply with legal obligations.</li>
                <li><strong>User-Generated Content:</strong> Tool submissions, reviews, and ratings may be
                retained indefinitely to maintain the integrity and continuity of our registry, even after
                account deletion.</li>
                <li><strong>Log Data:</strong> Server logs and analytics data are typically retained for
                90 days to 1 year for security and analytical purposes.</li>
              </ul>
              <p className="text-gray-700">
                Upon account deletion, we will anonymize or delete your personal information, except where
                retention is required by law or legitimate business interests (such as preventing fraud or
                abuse).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 General Rights</h3>
              <p className="text-gray-700 mb-3">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request access to the personal information we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information, subject to
                certain exceptions.</li>
                <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> Object to certain processing of your personal information.</li>
                <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 GDPR Rights (European Economic Area)</h3>
              <p className="text-gray-700 mb-4">
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have
                additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Right to withdraw consent at any time</li>
                <li>Right to lodge a complaint with your local data protection authority</li>
                <li>Right to object to processing based on legitimate interests</li>
                <li>Right to not be subject to automated decision-making, including profiling</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Our legal basis for processing your data includes: (1) your consent, (2) performance of a
                contract with you, (3) compliance with legal obligations, and (4) our legitimate interests
                in operating and improving our services.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 CCPA Rights (California Residents)</h3>
              <p className="text-gray-700 mb-4">
                If you are a California resident, the California Consumer Privacy Act (CCPA) provides you
                with specific rights:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces
                of personal information we have collected about you.</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information, subject
                to certain exceptions.</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of your personal information.
                (Note: We do not sell personal information.)</li>
                <li><strong>Right to Non-Discrimination:</strong> You will not receive discriminatory treatment
                for exercising your CCPA rights.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.4 Exercising Your Rights</h3>
              <p className="text-gray-700 mb-4">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@sfdxhub.com" className="text-blue-600 hover:text-blue-800 underline">
                  privacy@sfdxhub.com
                </a>. We will respond to your request within 30 days (or as required by applicable law).
                We may need to verify your identity before processing your request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                SFDX Hub is operated from the United States. If you are accessing our Site from outside
                the United States, please be aware that your information may be transferred to, stored,
                and processed in the United States and other countries where our service providers operate.
              </p>
              <p className="text-gray-700 mb-4">
                These countries may have data protection laws that differ from those in your country.
                By using our Site, you consent to the transfer of your information to the United States
                and other countries. We take appropriate safeguards to ensure your personal information
                remains protected in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                SFDX Hub is not intended for use by children under the age of 13 (or 16 in the EEA).
                We do not knowingly collect personal information from children under these ages. If you
                are a parent or guardian and believe your child has provided us with personal information,
                please contact us at{' '}
                <a href="mailto:privacy@sfdxhub.com" className="text-blue-600 hover:text-blue-800 underline">
                  privacy@sfdxhub.com
                </a>, and we will delete such information from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our Site may contain links to third-party websites, services, and resources (including
                GitHub repositories, npm packages, and developer documentation). This Privacy Policy does
                not apply to those third-party sites. We are not responsible for the privacy practices of
                other websites. We encourage you to read the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices,
                technology, legal requirements, or other factors. When we make changes, we will update the
                "Last Updated" date at the top of this page.
              </p>
              <p className="text-gray-700 mb-4">
                For material changes, we will provide prominent notice on our Site or send you an email
                notification (if you have provided your email address). Your continued use of SFDX Hub
                after such modifications constitutes your acknowledgment and acceptance of the updated
                Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our
                data practices, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
                <p className="text-gray-700 mb-2"><strong>Swan Media Co.</strong></p>
                <p className="text-gray-700 mb-2">
                  Email:{' '}
                  <a href="mailto:privacy@sfdxhub.com" className="text-blue-600 hover:text-blue-800 underline">
                    privacy@sfdxhub.com
                  </a>
                </p>
                <p className="text-gray-700">
                  Website:{' '}
                  <a href="https://sfdxhub.com" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    sfdxhub.com
                  </a>
                </p>
              </div>
              <p className="text-gray-700">
                We will respond to your inquiry as promptly as possible, typically within 2-3 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Additional Information for Specific Jurisdictions</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">14.1 Nevada Residents</h3>
              <p className="text-gray-700 mb-4">
                Nevada residents have the right to opt-out of the sale of certain personal information.
                We do not sell your personal information as defined under Nevada law. If you have questions,
                please contact us at privacy@sfdxhub.com.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">14.2 Australian Residents</h3>
              <p className="text-gray-700 mb-4">
                If you are located in Australia, you have rights under the Privacy Act 1988 (Cth), including
                the right to access and correct your personal information and to make a complaint about our
                handling of your personal information.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">14.3 Canadian Residents</h3>
              <p className="text-gray-700 mb-4">
                Canadian residents have rights under applicable provincial and federal privacy laws, including
                the Personal Information Protection and Electronic Documents Act (PIPEDA), to access and
                correct their personal information.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Consent</h2>
              <p className="text-gray-700">
                By using SFDX Hub, you consent to the collection, use, and disclosure of your information
                as described in this Privacy Policy. If you do not agree with any part of this Privacy Policy,
                please do not use our Site or services.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                This Privacy Policy is effective as of February 13, 2026.
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                © 2026 Swan Media Co. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
