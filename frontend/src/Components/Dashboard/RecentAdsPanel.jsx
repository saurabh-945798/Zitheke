import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";

const RecentAdsPanel = ({
  recentAds,
  statusBadgeClass,
  getAdImage,
  onQuickView,
  onOpenAd,
  onViewAll,
  onCreateAd,
}) => {
  return (
    <Card className="xl:col-span-2 shadow-xl border border-white/50 bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1D64] flex items-center gap-2">
              Your Recent Ads
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Quick access to your latest listings.
            </p>
          </div>

          <Button
            variant="outline"
            className="border-[#2E3192] text-[#2E3192] rounded-full px-4 hover:bg-[#E9EDFF]"
            onClick={onViewAll}
          >
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {recentAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recentAds.map((ad) => (
              <motion.div
                key={ad._id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 170 }}
                onClick={() => onOpenAd(ad)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenAd(ad);
                  }
                }}
                aria-label={`Open ad ${ad.title || "listing"}`}
                role="button"
                tabIndex={0}
                className="group rounded-3xl overflow-hidden border border-white/50 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-2xl transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E3192]/40"
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.35 }}
                    src={getAdImage(ad)}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />

                  <Badge
                    className={`absolute top-3 left-3 rounded-full px-3 py-1 ${statusBadgeClass(
                      ad.status
                    )}`}
                  >
                    {ad.status || "Active"}
                  </Badge>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">
                        {ad.title}
                      </h3>
                      <p className="text-white/80 text-xs truncate">
                        {ad.category || "Category"} - {ad.city || "City"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-white/90 text-xs bg-white/10 border border-white/15 px-2.5 py-1 rounded-full backdrop-blur">
                      <Eye size={14} />
                      {ad.views || 0}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {ad.description || "No description provided"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="text-xs rounded-full px-3 border-[#2E3192] text-[#2E3192] hover:bg-[#E9EDFF]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(ad);
                      }}
                    >
                      Quick View
                    </Button>

                    <Button
                      className="text-xs rounded-full px-3 bg-[#2E3192] hover:bg-[#1F2370] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAd(ad);
                      }}
                    >
                      Open <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14">
            <img src="/no-image.svg" className="w-20 mb-4 opacity-80" alt="no ads" />
            <p className="text-gray-600 font-medium">No ads yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Post your first ad to see it here.
            </p>
            <Button
              className="mt-5 rounded-full bg-[#2E3192] hover:bg-[#1F2370] text-white"
              onClick={onCreateAd}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post new ad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAdsPanel;

