import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Smartphone } from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const plan = new URLSearchParams(search).get("plan");

  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Selected";

  return (
    <section className="min-h-screen bg-[#F6F8FC] px-6 py-40">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#E9EDFF] overflow-hidden">
          <div className="p-6 md:p-10 bg-gradient-to-r from-[#2E3192] to-[#1F2370] text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back to plans
                </button>
                <span className="hidden md:inline-flex h-6 w-px bg-white/20" />
                <h1 className="text-4xl font-bold">Payment Details</h1>
              </div>
              <p className="text-white/80 text-sm md:text-base">
                Complete your payment to activate the {planLabel} plan.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#E9EDFF] p-6 bg-[#F9FAFF]">
              <div className="flex items-center gap-2 text-[#2E3192] font-semibold text-xl">
                <Banknote size={18} />
                Bank Transfer
              </div>
              <div className="mt-4 text-lg text-gray-700 space-y-2">
                <p><b>Account Name:</b> Alinafe Online Limited</p>
                <p><b>Bank:</b> National Bank of Malawi</p>
                <p><b>Account #:</b> 1006477832</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E9EDFF] p-6 bg-[#FFF8E7]">
              <div className="flex items-center gap-2 text-[#2E3192] font-semibold text-xl">
                <Smartphone size={18} />
                Airtel Money
              </div>
              <div className="mt-4 text-lg text-gray-700 space-y-2">
                <p><b>Number:</b> 0988003269</p>
                <p><b>Name:</b> Moses Chirambo</p>
                <p><b>Dealer Number:</b> 10107659</p>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 pb-10">
            <div className="rounded-2xl border border-[#E9EDFF] p-6 bg-white">
              <p className="text-sm text-gray-700">
                After payment, please send your proof of payment to support with your ad title and plan name.
              </p>
              <p className="mt-2 text-sm text-[#2E3192] font-semibold">
                Email: support@zitheke.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
