import React from "react";
import { ShieldCheck, BadgeCheck, HandCoins, AlertTriangle, MessageSquare, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    icon: ShieldCheck,
    title: "Meet Safely",
    points: [
      "Meet in a public place with people around.",
      "Prefer daytime meetings for product checks.",
      "Take a friend along for expensive transactions.",
    ],
  },
  {
    icon: HandCoins,
    title: "Payment Safety",
    points: [
      "Do not pay in advance for unknown sellers.",
      "Inspect the product before full payment.",
      "Keep proof of payment and screenshots.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Chat Safety",
    points: [
      "Keep communication on Zitheke chat when possible.",
      "Avoid sharing OTPs, passwords, or bank PINs.",
      "Do not click suspicious links from strangers.",
    ],
  },
  {
    icon: Eye,
    title: "Listing Verification",
    points: [
      "Compare price with similar listings before buying.",
      "Ask for clear photos/videos and key details.",
      "Be cautious of rushed deals that seem too good.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Fraud Warning Signs",
    points: [
      "Seller asks for advance payment urgently.",
      "Buyer/seller avoids meeting in person.",
      "Mismatch between ad details and real product.",
    ],
  },
  {
    icon: BadgeCheck,
    title: "After the Deal",
    points: [
      "Save chat history and transaction receipts.",
      "Report suspicious users or listings immediately.",
      "Use account settings to secure your profile.",
    ],
  },
];

const SafetyTipsPage = () => {
  return (
    <section className="min-h-screen bg-[#F8FAFC] pt-28 pb-14">
      <div className="max-w-6xl mx-auto px-6 md:px-10 font-[Poppins]">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2E3192]">
              Zitheke Safety Tips
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Follow these guidelines to buy and sell confidently on Zitheke.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg border border-[#2E3192]/20 bg-white px-4 py-2 text-sm font-semibold text-[#2E3192] hover:bg-[#EEF1FF] transition"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((item, idx) => {
            const Icon = item.icon;
            return (
              <article
                key={idx}
                className="rounded-2xl border border-[#2E3192]/10 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8EAF6] text-[#2E3192] flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-[#2E3192]">
                    {item.title}
                  </h2>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {item.points.map((point, pointIdx) => (
                    <li key={pointIdx} className="leading-relaxed">
                      • {point}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SafetyTipsPage;
