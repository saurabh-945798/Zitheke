import React from "react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
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
            Privacy & Fraud Policy
          </motion.h1>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            ZITHEKE ONLINE is committed to maintaining the highest standards of
            integrity, transparency, and accountability in all its operations.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        {/* 1. Purpose */}
       <div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    1. Purpose of Fraud Policy
  </h2>

  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-3">
    <li>
      The ZITHEKE ONLINE’s Fraud Policy sets out the responsibility of
      employees, management, users, and third parties in relation to the
      reporting of fraud or suspected fraud within ZITHEKE ONLINE.
    </li>

    <li>
      Though there is some overlap between this policy and the Confidential
      Disclosures Policy, it is important to note that the reporting of fraud
      is mandatory.
    </li>

    <li>
      However, a fraud and/or suspected fraud can also be reported under the
      Confidential Disclosures (“Whistleblowing”) Policy.
    </li>
  </ul>
</div>


      {/* 2. Scope */}
<div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    2. Scope of Fraud Policy
  </h2>

  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-3">
    <li>
      The Fraud Policy applies to any irregularity or suspected irregularity
      involving users, third parties, unknown persons, employees, external
      agencies, contractors, or any other parties having a business
      relationship with ZITHEKE ONLINE.
    </li>

    <li>
      This includes, where appropriate, outside agencies doing business with
      ZITHEKE ONLINE, employees of such agencies, and/or any other persons
      unknown to ZITHEKE ONLINE.
    </li>

    <li>
      For the purposes of this policy, the term “employee” includes individuals
      who work within ZITHEKE ONLINE such as external consultants, contractors,
      agency personnel, and Central ZITHEKE ONLINE management.
    </li>
  </ul>
</div>

{/* 3. Definition of Fraud */}
<div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    3. Definition of Fraud
  </h2>

  <ol className="list-decimal list-inside text-gray-600 leading-relaxed space-y-4">
    <li>
      Fraud can be broadly defined as an intentional act of deceit to obtain an
      unjust or illegal advantage. For the purposes of this policy, fraud shall
      include but is not limited to:
      <ol className="list-[lower-roman] pl-6 mt-3 space-y-2">
        <li>
          Theft or misappropriation of assets owned or managed by ZITHEKE
          ONLINE;
        </li>
        <li>
          Submitting false claims for payments or reimbursement;
        </li>
        <li>
          Accepting or offering a bribe, or accepting gifts or other favours
          under circumstances that might lead to the inference that the gift or
          favour was intended to influence an employee’s decision-making while
          serving ZITHEKE ONLINE.
        </li>
      </ol>
    </li>

    <li>
      Any employee, user, third party, or external contractor working with
      ZITHEKE ONLINE assumes a commitment to acting towards the prevention,
      detection, and reporting of fraud or suspected fraud by taking measures
      necessary to report any fraudulent circumstances that come to their
      attention.
    </li>

    <li>
      ZITHEKE ONLINE will prosecute any persons who are deemed liable for:
      <ol className="list-[lower-roman] pl-6 mt-3 space-y-2">
        <li>Blackmail or extortion;</li>
        <li>
          “Off the books” accounting, or making false or fictitious entries;
        </li>
        <li>
          Knowingly creating and/or distributing false or misleading financial
          reports;
        </li>
        <li>
          Paying excessive prices or fees where justification is not
          documented;
        </li>
        <li>
          Violation of ZITHEKE ONLINE’s procedures with the aim of personal gain
          or to the detriment of ZITHEKE ONLINE;
        </li>
        <li>
          Wilful negligence intended to cause damage to the material interests
          of ZITHEKE ONLINE; and
        </li>
        <li>
          Any dishonourable, reckless, or deliberate act against the interests
          of ZITHEKE ONLINE.
        </li>
      </ol>
    </li>
  </ol>
</div>

{/* 4. Responsibility for the Prevention and Detection of Fraud */}
<div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    4. Responsibility for the Prevention and Detection of Fraud
  </h2>

  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-3">
    <li>
      All users and employees have a duty to guard against fraud. Employees are
      expected to identify processes and procedures that may be vulnerable to
      fraud and to draw such instances to the attention of management within
      their respective divisions.
    </li>

    <li>
      Management has a particular responsibility to be familiar with and alert
      to the types of fraud that may occur in their areas of responsibility and
      to put in place effective controls to prevent such occurrences.
    </li>

    <li>
      Management shall provide support to and work with the Internal Audit
      Division, other relevant divisions, and law enforcement agencies in the
      detection, reporting, and investigation of dishonest or fraudulent
      activity, including the prosecution of offenders.
    </li>

    <li>
      Once fraud is detected, Heads of Divisions are responsible for taking
      appropriate corrective action to ensure that adequate controls are
      implemented to prevent the recurrence of improper activity.
    </li>
  </ul>
</div>


   {/* 5. Procedure for Reporting a Suspected Fraud */}
<div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    5. Procedure for Reporting a Suspected Fraud
  </h2>

  <ol className="list-decimal list-inside text-gray-600 leading-relaxed space-y-4">
    <li>
      Reporting fraud in accordance with this procedure is mandatory for any
      user or employee who suspects that a fraud has occurred. Any person who
      covers up, obstructs, or fails to report (or monitor) a fraud that they
      become aware of, or ought reasonably to have been aware of, may be
      considered an accessory after the fact and may be subject to ZITHEKE
      ONLINE’s disciplinary code, which may include action up to and including
      dismissal.
    </li>

    <li>
      Any person who threatens retaliation against an individual reporting a
      suspected fraud shall be subject to ZITHEKE ONLINE’s disciplinary code,
      which may include action up to and including dismissal, prosecution, or
      both.
    </li>

    <li>
      Details of the incident, facts, suspicions, or allegations must not be
      discussed with anyone inside or outside ZITHEKE ONLINE unless specifically
      directed by ZITHEKE ONLINE’s investigating team. In particular, the matter
      must not be discussed with the individual suspected of fraud.
    </li>

    <li>
      Fraud may be detected at any level within ZITHEKE ONLINE. The following
      procedure shall apply to the reporting of suspected internal fraud:
      <ol className="list-[lower-roman] pl-6 mt-3 space-y-2">
        <li>
          Any person who suspects that fraudulent activity is taking place
          should, in the first instance, report the matter to ZITHEKE ONLINE via
          email at <span className="font-medium">mchirambo@zitheke.com</span> and,
          where appropriate, to relevant law enforcement agencies.
        </li>
      </ol>
    </li>
  </ol>
</div>


      {/* 6. References for Employees Disciplined or Prosecuted for Fraud */}
<div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    6. References for Employees Disciplined or Prosecuted for Fraud
  </h2>

  <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-3">
    <li>
      Where a request is received for a reference in respect of an employee who
      has been disciplined or prosecuted for fraud or dishonesty, the Human
      Resources Division shall prepare any response to such request in
      accordance with ZITHEKE ONLINE’s policies and applicable Employment Law.
    </li>
  </ul>
</div>


      {/* 7. Review of Fraud Policy */}
<div className="bg-white rounded-2xl shadow-md p-8">
  <h2 className="text-2xl font-semibold text-[#2E3192] mb-4">
    7. Review of Fraud Policy
  </h2>

  <p className="text-gray-600 leading-relaxed">
    The Fraud Policy shall be reviewed at least every three years by the Audit
    Committee to ensure its continued effectiveness and compliance with
    applicable laws and regulations.
  </p>
</div>


     
      </section>
    </div>
  );
};

export default PrivacyPolicy;
