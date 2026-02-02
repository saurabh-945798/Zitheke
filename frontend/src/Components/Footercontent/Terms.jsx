import React from "react";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div
      className="bg-[#F4F6FF] pt-24"
      style={{
        fontFamily: 'Bahnschrift, "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: "18px",
      }}
    >
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-white via-[#F8FAFC] to-[#F2F4FF] py-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2E3192]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F9B233]/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-[#2E3192] mb-6"
          >
            Terms & Conditions
          </motion.h1>

          <p className="text-gray-600 text-lg max-w-4xl mx-auto">
            Terms and Conditions of Use and Membership Agreement governing all
            services provided by ZITHEKE Online through ZITHEKE.com.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">

        {/* INTRO */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <p className="text-gray-600 leading-relaxed">
            The following sets forth the Terms and Conditions of ZITHEKE Online
            regarding usage of all services provided by us (the “Service”)
            through the website ZITHEKE.com and the User Membership Agreement for
            placement and accessing of products, services, and adverts. Users
            shall understand, agree to, and comply with each provision set
            herein. If you do not agree, please refrain from using the Service.
          </p>
        </div>

        {/* ARTICLE 1 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 1: Scope of these Terms and Conditions of Use
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>
              All of terms of use, set rules and all forms of agreements provided by ZITHEKE Online regarding the Service are deemed to be applied as one unit with these Terms and Conditions of Use and Membership Agreement. In any case, if the contents of these Terms and Conditions of Use differ from the contents of other terms of use, special agreements, or rules, the provisions of these Terms and Conditions of Use will supersede. Unless particularly stated otherwise, terms defined in these Terms and Conditions have the same meaning in the terms of use, special agreements, and rules etc.
            </li>
            <li>
             Even if the User uses our Service through any other means, these Terms and Conditions will be deemed to be applied between the User and ZITHEKE Online. 
            </li>
            <li>
           	ZITHEKE Online may change the contents of the Terms and Conditions of Use and Membership Agreement with time according to the amendments of the website, application and digital marketing policy. In this case, the changed contents shall be displayed on the website and application. Subsequently the User will be bound by the changed Terms and Conditions at the earlier of the point when a User uses the Service for the first time or the point when the notification period provided by us has passed.
            </li>
          </ol>
        </div>

        {/* ARTICLE 2 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 2: Provision of the Service
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>
             ZITHEKE Online provides the Service to Users through the website, application, or through other methods in order to provide highest quality, professional and innovative online business solutions to malawian- and international traders and consumers. 
            </li>
            <li>
The types, contents, and details of the service are as provided and posted on ZITHEKE.com by ZITHEKE Online.            </li>
            <li>
ZITHEKE Online shall post the environment necessary or recommended in order to use the Service on the Site. Users shall maintain this usage environment at their own expense and responsibility.            </li>
          </ol>
        </div>

        {/* ARTICLE 3 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 3: Consideration for the Service
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>
              	The Service will attract charges in the following forms: insertion or listing fees, commissions, advertisement fees and fulfilment (handling) fees.
            </li>
            <li>
Insertion or listing fees are mandatory or compulsory to all users who place their products and services on ZITHEKE.com.            </li>
            <li>
	Commissions, advertisement fees and fulfilment (handling) fees are not mandatory or compulsory, but are by wish of Users, could be sellers or buyers.             </li>
            <li>
	For convenience sake, the methods of payment are listed on ZITHEKE.com. The application or website will take you to the point of making payment as you are adding your products or services or adverts.             </li>
          </ol>
        </div>

        {/* ARTICLE 4 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 4: User Registration and Authentication
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>In order to enjoy the service, Users are required to register as prescribed by ZITHEKE.com. Users shall complete User registration in accordance with the prescribed procedures.</li>
            <li>
Users shall confirm and warrant to ZITHEKE that all of the information they provide, as a true statement, accurate, and up-to-date. Further, if a change occurs after User registration the User shall promptly change their registration in accordance with the prescribed procedures.            </li>
            <li>
	ZITHEKE Online may refuse an application for User registration at its discretion. In such case, the User may not make any claim or objection and ZITHEKE Online does not have any obligations, such as to explain the reason for refusal.            </li>
            <li>
	ZITHEKE Online shall give registered Users (“Registered Users”) an ID, password, and other authentication key (“Authentication Key”), or if the Authentication Key is set by the Registered User itself, the Registered User shall strictly manage the Authentication Key and shall not disclose, divulge, or allow another person to use the Authentication Key.            </li>
            <li>
	ZITHEKE Online may treat all communications conducted correctly using the Registered User’s Authentication Key as being deemed to have been conducted by the Registered User itself or by a person given the appropriate authority by the Registered User. In such case, ZITHEKE Online is not liable for any damage that occurs to the Registered User, even if it occurs due to misuse of the Authentication Key or due to another reason.            </li>
            <li>
	Registered Users may cancel their User registration in accordance with ZITHEKE Online’s prescribed procedures at any time.            </li>
            <li>
	Registered Users are deemed to consent to the receipt of e-mail from ZITHEKE.com. Registered User can refuse to receive ZITHEKE Mail by cancelling User Registration or another method provided by ZITHEKE.com.            </li>
          </ol>
        </div>

        {/* ARTICLE 5 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 5: Contact Information
          </h2>
           <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>If ZITHEKE online judges that notice is required to be made to a Registered User, it will make the notice to the registered address using electronic mail, postal mail, telephone, fax, or another appropriate method. In this case the notice will be deemed to have arrived when it would normally have arrived, even if it does not arrive or arrives late.</li>
            <li>Questions and enquiries about the Service should be directed to ZITHEKE online by electronic mail or postal mail or visiting ZITHEKE office, or any other method.          </li>
           
            
            
          </ol>
        </div>

        {/* ARTICLE 6 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 6: Handling User Information
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>ZITHEKE the personal information of Users appropriately, in accordance with the Act on the Protection of Personal Information and the (“Privacy Policy”) provided by ZITHEKE and posted on the Site.</li>
            <li>In addition to Article 6.1, if ZITHEKE handles a User’s business secrets it shall handle them with the due care of a good manager in accordance with the spirit of the Service.</li>
           
            
            
          </ol>
        </div>

        {/* ARTICLE 7 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 7: Intellectual Property Rights
          </h2>
           <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>ZITHEKE (written in local language Chichewa or English) is a registered trademark in Malawi.</li>
            <li>The copyrights, image rights, or other rights for all written materials, photographs, video, and other content posted on the Site or in ZITHEKE Mail (“ZITHEKE Web Content”) belong to ZITHEKE or an approved third party. Unless otherwise stated by ZITHEKE online, Users are only permitted to peruse these contents in the methods prescribed by ZITHEKE and copying, redistributing, or using the contents in any other way, or changing, or creating derivative works using the contents is prohibited.</li>
           <li>Copyrights for messages or files etc. contributed to the Site by Users (“Messages”) are transferred to and belong to ZITHEKE as a result of the contribution. Further, the User shall not exercise an author’s personal rights regarding the use. Further, by contributing Messages to the Site, Users represent and warrant that they have all the rights required to use the Messages and to license ZITHEKE to use them (including copyright for the Messages, and the consent of any individuals that could be identified from inclusion in the subject or model for the Messages, or from the information in the Messages).</li>
            
            
          </ol>
        </div>

        {/* ARTICLE 8 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 8: Transactions and Communications
          </h2>
         <ol className="list-decimal pl-6 space-y-3 text-gray-600">
          <li>If Users conduct transactions through the Service, ZITHEKE will not make any warranties, endorse, act as an agent, mediate, intercede, or conduct any canvassing regarding the transaction between the Users. </li>
         <li>If a User contacts a specified or unspecified Other Operator through the service and exchanges Messages or otherwise communicates with them, the User shall make judgments regarding whether or not to disclose information about the User themselves or the User’s assets etc. to the other party, or whether files provided by the other party contain harmful programs etc., at their own liability.</li>
          <li>Any disputes between the Users regarding transactions, communication etc. will be resolved at the expense and liability of the User.</li>
        <li>4.	The User acknowledges and agrees that ZITHEKE, within the limitation of applicable law, monitors the Users’ communications for the purpose of ensuring Use’s compliance with its obligations under the Terms and Conditions, and that ZITHEKE may restrict, delete, or prohibit such communications, if ZITHEKE decides it is necessary to do so, based on its sole discretion.</li>
          </ol>

        </div>

        {/* ARTICLE 9 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 9: Links and Advertisements
          </h2>
         <ol className="list-decimal pl-6 space-y-3 text-gray-600">
          <li>ZITHEKE will sometimes posts links from the ZITHEKE Web Content to other sites. Even in this case ZITHEKE will not make any warranties, endorse, act as an agent, mediate, intercede, or conduct any canvassing, and does not bear any responsibility regarding the information and services etc. provided at the linked site. Further, whether authorized or not, the same applies for sites that link to the Site.</li>
          <li>ZITHEKE will sometimes posts advertisements on the Site. Even in this case ZITHEKE will not make any warranties, endorse, act as an agent, mediate, intercede, or conduct any canvassing, and does not bear any responsibility regarding the products and services etc. provided by the advertiser.</li>
          </ol> 
        </div>

        {/* ARTICLE 10 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 10: Obligations and Liability
          </h2>
           <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>ZITHEKE may suspend or terminate part or all of the Service without prior notice due to system failure, software or hardware breakdown, fault, malfunction, or failure of telecommunication lines.</li>
            <li>The information provided through the Service and communications and other exchanges may be delayed or interrupted as a result of ZITHEKE.</li>
            <li>The information, data, software, products, and services provided by ZITHEKE through the service may include inaccuracies or faults. Further, ZITHEKE may add to, change, or delete all or part of this information etc. without prior warning.</li>
            <li>ZITHEKE will take security measures at the level it judges reasonable regarding the server and other network equipment managed by ZITHEKE, but it is possible that incidents such as unlawful access, information leakage, or distribution of harmful programs could occur, in spite of these measures. Further, as ZITHEKE does not take security measures regarding information that travels over the Internet or other open networks unless specifically stated, and since even if security measures are taken they could be overridden, it is possible that information could be stolen, falsified etc.</li>
            <li>ZITHEKE does not bear any obligation to protect information posted on the site by Users and may arrange, move, or delete the information as appropriate.</li>
            <li>ZITHEKE does not bear any liability regarding damage suffered by Users resulting from the events set out in each of the above items.</li>
            <li>ZITHEKE does not bear any liability regarding damage suffered by Users resulting from the parts of the service that are provided free of charge. Further, even if a User suffers damage resulting from ZITHEKE’s negligence in a part of the service that is provided for a fee, ZITHEKE’s liability will be limited to the amount of payment actually received regarding the service that was the direct cause of the occurrence of damage, whether or not any cause for liability exists, such as non-performance of obligations, defect warranty, or illegal acts, excluding damage arising due to special circumstances and lost profits damage.</li>
          </ol> 
        </div>

        {/* ARTICLE 11 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 11: Prohibited Acts
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>1.	reaching the copyrights, trademark rights, or other intellectual property rights, privacy rights, image rights, or other rights of another person, damaging the honor, credibility, or assets of another person, or actions that contribute to this;</li>
            <li>.	exposing information, or know how etc. that is kept confidential by another person;</li>
            <li>.	ations whereby the User behaves threateningly, provocatively, or insultingly to another party, or otherwise causes mental anguish;</li>
            <li>	forcing another person to enter into an association, activity, or organization, or to furnish transactions, profits etc., or to provide a service, or actions that request such things even though the other person has refused;</li>
            <li>	registering or posting information which is untrue, or that contains mistakes, or actions that could possibly cause another person to misunderstand the User’s identity, products, contents of the service, or transaction conditions;</li>
            <li>	collecting, stockpiling, altering, or deleting another person’s information;</li>
            <li>	using the Service under the guise of another person, having multiple people use the same account, or an individual establishing several accounts;</li>
            <li>	unauthorized access or attempting to use unauthorized access, sending computer viruses, back-door or other unauthorized commands, programs, data, etc. to another person’s computer, or leaving harmful computer programs, etc. in a position whereby another person could receive them;</li>
            <li>	actions that exceed the scope of normal use and place a burden on the server;</li>
            <li>	using, gathering, or processing the information provided in the Service by a method other than the method provided by ZITHEKE, whether legal or illegal, and whether or not it infringes upon rights, or using the Service by a method other than the method provided by ZITHEKE, for profit or for commercial purposes;</li>
            <li>	posting information considerably lacking in quality, information for which the meaning is unclear, or other Messages that deviate from the purpose of the Service, or repeatedly posting Messages with the same or similar content;</li>
            <li>actions that damage the credibility of ZITHEKE, the Site, or the Service, or actions that demean the reputation of ZITHEKE, the Site, or the Service;</li>
            <li>Actions other than the items set out above that violate laws and ordinances, public standards, or the Rules and Regulations, actions that impede the operation of the Service, and actions particularly provided by ZITHEKE and posted on the Site.</li>
            <li>ZITHEKE is not obliged to monitor whether or not the actions set out in the items in Article 11.1 are being conducted in respect of the Site or the Service. Further, ZITHEKE is not liable for any damage suffered by a User as a result of another User conducting the actions set out in the items in Article 11.1.</li>
            <li>	ZITHEKE may request cooperation from Users regarding the submission of materials, or obtaining information in order to investigate whether or not the actions set out in the items in Article 11.1 have taken place and the details thereof, and Users shall cooperate with such requests; provided, however, that ZITHEKE is not obliged to conduct such investigations.</li>




          </ol> 
        </div>

        {/* ARTICLE 12 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 12: Termination of Use
          </h2>
           <ol className="list-decimal pl-6 space-y-3 text-gray-600">
            <li>ZITHEKE may, at its discretion, take any or several of the measures set out below in respect of a particular User without any notice; provided, however, that ZITHEKE has no obligation to take such measures:</li>
            <li>suspension or restriction of all or part of the Service.</li>
            <li>refusal or restriction of access to the Site;</li>
            <li> cancellation of User registration and subsequent refusal of User registration;</li>
            <li> amendment or deletion of all or part of messages submitted by a User;</li>
            <li>cooperation with criminal or other investigations by investigation agencies and administrative agencies; and</li>
            <li>any other measures ZITHEKE judges appropriate.</li>
          </ol> 
        </div>

        {/* ARTICLE 13 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 13: Damages
          </h2>
          <p className="text-gray-600">
          If a User breaches the representations and warranties it made in respect of these Terms and Conditions or if ZITHEKE suffers damage due to a User’s willful misconduct or neglect, the User shall compensate ZITHEKE for all damage suffered by ZITHEKE (including legal fees).
          </p>
        </div>

        {/* ARTICLE 14 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 14: Entire Agreement and Severability
          </h2>
          <ol>
            <li>1.	If part of the provisions of these Terms and Conditions are judged invalid or unenforceable, the provision will be deemed to have been replaced with an effective and enforceable provision, the details of which are as close as possible to the purpose of the original provision. Further, in such case, the other provisions of these Terms and Conditions will survive and will not be influenced in any way.</li>
            <li>2.	These Terms and Conditions constitute the entire agreement between the User and ZITHEKE regarding the service and the Site and take precedence over all previous or current communications or suggestions made either electronically, in writing, or verbally.</li>
          </ol>
        
        </div>

        {/* ARTICLE 15 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
            Article 15: Governing Law and Jurisdiction
          </h2>
           <ol>
           <li>
            1.	The governing law for these Terms and Conditions, the Site, and the Service is the law of Malawi.
           </li>
           <li>2.	The Courts of Malawi has exclusive jurisdiction as a courts of first instance regarding any dispute concerning these Terms and Conditions, the Site, or the Service.</li>
          </ol>
        </div>

      </section>
    </div>
  );
};

export default Terms;
