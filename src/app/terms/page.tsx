import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SFDX Hub',
  description: 'Terms of Service for SFDX Hub - A community-driven registry for Salesforce developer tools',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="prose prose-slate max-w-none">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: February 13, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              Welcome to SFDX Hub, a service operated by Swan Media Co. ("we," "us," or "our"). By accessing or using the SFDX Hub website located at sfdxhub.com (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
            <p className="mb-4">
              These Terms constitute a legally binding agreement between you and Swan Media Co. Your use of the Service signifies your acceptance of these Terms and our Privacy Policy, which is incorporated herein by reference.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              SFDX Hub is a community-driven web registry for Salesforce developer tools and resources. The Service provides a platform where users can:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Browse and search listings of Salesforce CLI plugins, Lightning Web Component (LWC) libraries, Apex utilities, Agentforce tools, and other Salesforce development resources</li>
              <li>Register for user accounts using email/password authentication or GitHub OAuth</li>
              <li>Submit new tools and resources for inclusion in the registry</li>
              <li>Rate tools on a scale of 1-5 stars</li>
              <li>Write and publish reviews of tools and resources</li>
              <li>Upload screenshots and images related to submitted tools (subject to size and format restrictions)</li>
            </ul>
            <p className="mb-4">
              The Service integrates with third-party services including Cloudinary for image hosting and processing, GitHub API for authentication and README content retrieval, Vercel for hosting infrastructure, and Neon for database services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p className="mb-4">
              <strong>3.1 Account Creation.</strong> Certain features of the Service require you to create an account. You may register using email and password credentials or through GitHub OAuth authentication. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p className="mb-4">
              <strong>3.2 Account Security.</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
            <p className="mb-4">
              <strong>3.3 Account Requirements.</strong> While browsing and searching the Service is available to the public without an account, the following activities require a registered account:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Submitting new tools or resources</li>
              <li>Rating tools and resources</li>
              <li>Writing and publishing reviews</li>
              <li>Uploading screenshots or images</li>
            </ul>
            <p className="mb-4">
              <strong>3.4 Age Requirement.</strong> You must be at least 13 years of age to create an account and use the Service. By creating an account, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content and Submissions</h2>
            <p className="mb-4">
              <strong>4.1 User-Generated Content.</strong> The Service allows you to submit, post, and share content including tool listings, reviews, ratings, screenshots, and other materials (collectively, "User Content"). You retain all ownership rights to your User Content.
            </p>
            <p className="mb-4">
              <strong>4.2 License Grant.</strong> By submitting User Content to the Service, you grant Swan Media Co. a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, transferable, and sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such User Content in connection with operating, providing, promoting, and improving the Service.
            </p>
            <p className="mb-4">
              <strong>4.3 Tool and Resource Submissions.</strong> When you submit information about Salesforce developer tools, plugins, libraries, or other resources, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You have the right to submit such information</li>
              <li>The submitted tool or resource is your own creation, or you have proper authorization to list it</li>
              <li>The information provided is accurate and not misleading</li>
              <li>The tool or resource complies with all applicable laws and regulations</li>
            </ul>
            <p className="mb-4">
              <strong>4.4 Image Uploads.</strong> Screenshots and images uploaded to the Service are subject to the following restrictions:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Maximum file size: 5 megabytes (MB) per image</li>
              <li>Images must be in commonly supported formats (JPEG, PNG, GIF, WebP)</li>
              <li>Images are processed and hosted through Cloudinary, a third-party service</li>
              <li>Images must not contain illegal, offensive, or inappropriate content</li>
            </ul>
            <p className="mb-4">
              <strong>4.5 Content Moderation.</strong> Swan Media Co. reserves the right, but has no obligation, to monitor, review, edit, or remove any User Content at our sole discretion, including content that violates these Terms, is potentially harmful, or is otherwise objectionable. Submissions and reviews are subject to administrative moderation before appearing publicly on the Service.
            </p>
            <p className="mb-4">
              <strong>4.6 Responsibility for Content.</strong> You are solely responsible for your User Content and the consequences of posting or publishing it. We do not endorse any User Content or any opinion, recommendation, or advice expressed therein, and we expressly disclaim any and all liability in connection with User Content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property Rights</h2>
            <p className="mb-4">
              <strong>5.1 Service Content.</strong> The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Swan Media Co. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            <p className="mb-4">
              <strong>5.2 Trademarks.</strong> The SFDX Hub name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Swan Media Co. or its affiliates or licensors. You may not use such marks without the prior written permission of Swan Media Co.
            </p>
            <p className="mb-4">
              <strong>5.3 Third-Party Tools.</strong> Tools, plugins, libraries, and resources listed on the Service remain the intellectual property of their respective creators and owners. Listing on SFDX Hub does not transfer any ownership rights to Swan Media Co. Each tool is subject to its own license terms as specified by its creator.
            </p>
            <p className="mb-4">
              <strong>5.4 Feedback.</strong> If you provide Swan Media Co. with any feedback or suggestions regarding the Service ("Feedback"), you grant us the right to use such Feedback without any restriction or compensation to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Acceptable Use Policy</h2>
            <p className="mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violating any applicable local, state, national, or international law or regulation</li>
              <li>Impersonating or attempting to impersonate Swan Media Co., a Swan Media Co. employee, another user, or any other person or entity</li>
              <li>Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm Swan Media Co. or users of the Service</li>
              <li>Submitting false, misleading, or deceptive information about tools, resources, or your identity</li>
              <li>Uploading or transmitting viruses, malware, or any other malicious code</li>
              <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service</li>
              <li>Using any automated system, including "robots," "spiders," or "scrapers," to access the Service without our prior written permission</li>
              <li>Submitting spam, including promotional content unrelated to Salesforce development tools</li>
              <li>Posting content that is unlawful, defamatory, obscene, pornographic, abusive, harassing, threatening, or otherwise objectionable</li>
              <li>Infringing upon the intellectual property rights of others</li>
              <li>Manipulating ratings or reviews through fraudulent means</li>
              <li>Using the Service for any commercial purpose not expressly permitted by these Terms</li>
              <li>Attempting to gain unauthorized access to any portion of the Service or any other systems or networks connected to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Third-Party Services and Links</h2>
            <p className="mb-4">
              The Service integrates with and may contain links to third-party websites, services, and tools, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Cloudinary (image hosting and processing)</li>
              <li>GitHub (authentication and repository information)</li>
              <li>Vercel (hosting infrastructure)</li>
              <li>Neon (database services)</li>
              <li>External tool repositories and documentation</li>
            </ul>
            <p className="mb-4">
              These third-party services are not under the control of Swan Media Co. We are not responsible for the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that Swan Media Co. shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such third-party content, goods, or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers and Limitation of Liability</h2>
            <p className="mb-4">
              <strong>8.1 "AS IS" and "AS AVAILABLE" Basis.</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. SWAN MEDIA CO. EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mb-4">
              <strong>8.2 No Warranty of Accuracy.</strong> Swan Media Co. makes no warranty that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service will meet your requirements</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from use of the Service will be accurate or reliable</li>
              <li>The quality of any tools, resources, information, or other material obtained through the Service will meet your expectations</li>
              <li>Any errors in the Service will be corrected</li>
            </ul>
            <p className="mb-4">
              <strong>8.3 Third-Party Tools.</strong> TOOLS, PLUGINS, LIBRARIES, AND RESOURCES LISTED ON THE SERVICE ARE PROVIDED BY THIRD PARTIES. SWAN MEDIA CO. DOES NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY THIRD-PARTY TOOL OR RESOURCE. YOU DOWNLOAD, INSTALL, AND USE SUCH TOOLS AT YOUR OWN RISK.
            </p>
            <p className="mb-4">
              <strong>8.4 Limitation of Liability.</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SWAN MEDIA CO., ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p className="mb-4">
              <strong>8.5 Maximum Liability.</strong> IN NO EVENT SHALL SWAN MEDIA CO.'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID SWAN MEDIA CO. IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED DOLLARS ($100).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Indemnification</h2>
            <p className="mb-4">
              You agree to defend, indemnify, and hold harmless Swan Media Co., its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your violation of these Terms</li>
              <li>Your use of the Service</li>
              <li>Your User Content</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Your violation of any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Termination</h2>
            <p className="mb-4">
              <strong>10.1 Termination by You.</strong> You may terminate your account at any time by contacting us or using the account deletion feature if available.
            </p>
            <p className="mb-4">
              <strong>10.2 Termination by Swan Media Co.</strong> We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
            <p className="mb-4">
              <strong>10.3 Effect of Termination.</strong> All provisions of these Terms which by their nature should survive termination shall survive termination, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability. Termination of your account does not relieve you of any obligations incurred prior to termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Governing Law and Jurisdiction</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located within the State of California for the resolution of any disputes arising out of or relating to these Terms or the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Dispute Resolution</h2>
            <p className="mb-4">
              <strong>12.1 Informal Resolution.</strong> In the event of any dispute, claim, or controversy arising out of or relating to these Terms or the Service, you agree to first contact Swan Media Co. at legal@sfdxhub.com to attempt to resolve the dispute informally.
            </p>
            <p className="mb-4">
              <strong>12.2 Binding Arbitration.</strong> If we cannot resolve a dispute informally, any dispute arising out of or relating to these Terms or the Service shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in California, United States.
            </p>
            <p className="mb-4">
              <strong>12.3 Class Action Waiver.</strong> You agree that any arbitration or legal proceeding shall be limited to the dispute between you and Swan Media Co. individually. To the full extent permitted by law, no arbitration or legal proceeding shall be joined with any other, no dispute shall be arbitrated or litigated on a class-action basis, and you waive any right to participate in a class-action lawsuit or class-wide arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              Swan Media Co. reserves the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="mb-4">
              By continuing to access or use the Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Miscellaneous</h2>
            <p className="mb-4">
              <strong>14.1 Entire Agreement.</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Swan Media Co. regarding the Service and supersede all prior agreements and understandings, whether written or oral.
            </p>
            <p className="mb-4">
              <strong>14.2 Severability.</strong> If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
            </p>
            <p className="mb-4">
              <strong>14.3 Waiver.</strong> No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and Swan Media Co.'s failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
            </p>
            <p className="mb-4">
              <strong>14.4 Assignment.</strong> You may not assign or transfer these Terms or your rights hereunder, in whole or in part, without our prior written consent. Swan Media Co. may assign these Terms at any time without notice.
            </p>
            <p className="mb-4">
              <strong>14.5 Headings.</strong> The headings in these Terms are for convenience only and have no legal or contractual effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Swan Media Co.</p>
              <p>SFDX Hub Legal Department</p>
              <p>Email: <a href="mailto:legal@sfdxhub.com" className="text-blue-600 hover:text-blue-800">legal@sfdxhub.com</a></p>
              <p>Website: <a href="https://sfdxhub.com" className="text-blue-600 hover:text-blue-800">https://sfdxhub.com</a></p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              By using SFDX Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
