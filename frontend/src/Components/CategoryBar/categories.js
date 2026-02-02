const rawCategories = {


  Mobiles: [
    {
      name: "Mobile Phones",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80",
    },
    {
      name: "Tablets",
      image:
        "https://m.media-amazon.com/images/S/al-eu-726f4d26-7fdb/016a08f9-0fa5-4419-b6d3-f46bc0927513._CR0,0,1200,628_SX810_CB1169409_QL70_.png",
    },
    
    {
      name: "Mobile Accessories",
      image:
        "https://m.media-amazon.com/images/I/61jVUB4y7pL._SL1500_.jpg",
    },
  ],

  Vehicles: [
    {
      name: "Cars",
      image:
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Motorcycles",
      image:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80",
    },
    {
      name: "Bikes",
      image:
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Scooters",
      image:
        "https://www.tvsmotor.com/tvs-jupiter-125/-/media/Feature/BrandPriceCity/Jupiter-125-cc.png",
    },
    {
      name: "Bicycles",
      image:
        "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTFABk-CjB0gbe-w9UYXEnwwwWCQzKdWZy0uWQqEpUOwYuQfCwF-s3KDCHZnbBp8WFBeWzHoEZ_2cg1TlEKCQd3YgAhano5HxIgZXPdBWUoC1xeBPjdIcHx",
    },
    {
      name: "Electric Bikes",
      image:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/1/versions/bajaj-chetak-30011750149309517.jpg?q=80",
    },
    {
      name: "Spare Parts",
      image:
        "https://www.garimaglobal.com/blogs/wp-content/uploads/2024/09/y.png",
    },
    {
      name: "Cars & pick-ups",
      image:
        "https://plus.unsplash.com/premium_photo-1661963219843-f1a50a6cfcd3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dHJ1Y2tzfGVufDB8fDB8fHww",
    },
    {
      name: "Commercial Vehicles",
      image:
        "https://busesandvans.tatamotors.com/assets/buses/files/2024-02/Winger-Ambulance.jpg?VersionId=7YNVSKlohOLW7GuBsR0xBsmlp2cY6pv3",
    },
    {
      name: "Vehicle Accessories",
      image:
        "https://m.media-amazon.com/images/G/31/img18/Automotive/Revamp/Car_Revamp/Car_Tyres._CB453410835_.jpg",
    },
  ],

  Electronics: [
    {
      name: "Computers & Laptops",
      image:
        "https://5.imimg.com/data5/SELLER/Default/2023/5/312121289/JE/QU/IA/256711/laptop-15-inch-1-a-500x500.jpg",
    },
    {
      name: "Computer Accessories",
      image: "https://m.media-amazon.com/images/I/6118eI1D77L._SX679_.jpg",
    },
    {
      name: "Gaming Consoles & Accessories",
      image:
        "https://m.media-amazon.com/images/I/418B05E5wbL._SY300_SX300_QL70_FMwebp_.jpg",
    },
    {
      name: "TVs & Home Entertainment",
      image:
        "https://m.media-amazon.com/images/I/81eJWtsCRkL._AC_UY327_FMwebp_QL65_.jpg",
    },
    {
      name: "Cameras & Lenses",
      image: "https://m.media-amazon.com/images/I/6100ENTYlGL._SL1500_.jpg",
    },
    {
      name: "Smart Watches & Wearables",
      image: "https://m.media-amazon.com/images/I/61bm7UEdGAL._SL1500_.jpg",
    },
    {
      name: "Speakers & Headphones",
      image: "https://m.media-amazon.com/images/I/61XvYOrqVeL._SL1500_.jpg",
    },
    {
      name: "Kitchen Appliances",
      image: "https://m.media-amazon.com/images/I/81670ZfgQ-L._SL1500_.jpg",
    },
    {
      name: "Home Appliances",
      image: "https://m.media-amazon.com/images/I/71rH4vEE4nL._SL1500_.jpg",
    },
    {
      name: "Refrigerators",
      image: "https://m.media-amazon.com/images/I/61j9T75n7sL._SL1500_.jpg",
    },
    {
      name: "Washing Machines",
      image: "https://m.media-amazon.com/images/I/817+GVxp-6L._SL1500_.jpg",
    },
    {
      name: "ACs & Coolers",
      image: "https://m.media-amazon.com/images/I/512zKReXZoL._SL1500_.jpg",
    },
    {
      name: "Printers, Monitors & Hard Disks",
      image: "https://m.media-amazon.com/images/I/71-E84CzmOL._SL1500_.jpg",
    },
    {
      name: "Smart Home Devices",
      image: "https://m.media-amazon.com/images/I/51HAjB2gbzL._SL1500_.jpg",
    },
  ],

  Furniture: [
    {
      name: "Beds",
      image: "https://m.media-amazon.com/images/I/718DK3pzklL._SL1500_.jpg",
    },
    {
      name: "Sofas",
      image: "https://m.media-amazon.com/images/I/51OZfS1WkgL.jpg",
    },
    {
      name: "Tables & Chairs",
      image: "https://m.media-amazon.com/images/I/71+6t7w0iOL._SL1500_.jpg",
    },
    {
      name: "Wardrobes",
      image: "https://m.media-amazon.com/images/I/61F4u0ydQKL._SL1000_.jpg",
    },
    {
      name: "Lights",
      image: "https://m.media-amazon.com/images/I/71ZLdAaoeTL._SL1500_.jpg",
    },
  ],

  Fashion: [
    {
      name: "Men",
      image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80",
    },
    {
      name: "Women",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80",
    },
    {
      name: "Footwear",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ],

  Services: [
    {
      name: "Plumber",
      image:
        "https://content.jdmagicbox.com/v2/comp/mumbai/j8/022pxx22.xx22.241212120420.f3j8/catalogue/jagannath-plumbing-work-kandivali-east-mumbai-plumbers-1lr3p4vfoy.jpg",
    },
    {
      name: "Electrician",
      image:
        "https://raviniaplumbing.com/wp-content/uploads/2023/03/Why-hire-a-professional-electrician_-scaled.jpeg",
    },
    {
      name: "Carpentry Services",
      image:
        "https://cdn.prod.website-files.com/6390e14cc734a931f8327343/679c741cfd2f81997c15fb20_Featured-image.jpg",
    },
    {
      name: "AC Repair & Services",
      image: "https://assistor.in/uploads/services/17123933957.jpg",
    },
    {
      name: "Refrigerator Repair",
      image:
        "https://5.imimg.com/data5/SELLER/Default/2025/8/539438126/HD/YE/VV/15180118/refrigerator-repairing-service-500x500.jpg",
    },
    {
      name: "Washing Machine Repair",
      image:
        "https://t3.ftcdn.net/jpg/01/98/65/94/360_F_198659488_BT7evs4AEwey5wqrllvQTZYGezk4YaCZ.jpg",
    },
    {
      name: "Painter",
      image:
        "https://www.goconstruct.org/media/qiip4bvh/pd-ss2431573913.jpg?width=510&height=332&format=WebP&quality=75&v=1db893e1a4b1ef0",
    },
    {
      name: "Home Cleaning",
      image:
        "https://www.specifichomeservices.com/wp-content/uploads/2025/01/Deep-Cleaning-Services-In-1-1-scaled.jpg",
    },
    {
      name: "Pest Control",
      image: "https://mmpestcontrol.in/wp-content/uploads/2024/11/2-3-1024x498.png",
    },
    {
      name: "Packers & Movers",
      image:
        "https://www.nobroker.in/blog/wp-content/uploads/2024/03/best-packers-and-movers-app.jpg",
    },
    {
      name: "Driver Services",
      image: "https://safedryver.com/wp-content/uploads/2023/10/media-file-1691155772-scaled.webp",
    },
    {
      name: "Computer & Laptop Repair",
      image: "https://www.srisaiinfotech.net/wp-content/uploads/2021/01/sri-sai-home-image-sm-min.jpg",
    },
    {
      name: "Mobile Repair",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/017/153/701/small/technician-repairing-inside-of-mobile-phone-integrated-circuit-the-concept-of-data-hardware-technology-photo.jpg",
    },
    {
      name: "Tutoring & Classes",
      image:
        "https://cdn-blog.superprof.com/blog_in/wp-content/uploads/2020/02/image4-2.png",
    },
    {
      name: "Fitness Trainer",
      image:
        "https://nctaindia.in/images/course/image_91444b05-00d1-4491-9b2f-c0d1544c6758.jpg",
    },
    {
      name: "Beauty & Salon Services",
      image:
        "https://content.jdmagicbox.com/comp/def_content/beauty-parlours-for-facial/screenshot-84-beauty-parlours-for-facial-7-dxsqb.jpg",
    },
    {
      name: "CCTV Installation & Repair",
      image:
        "https://www.zuper.co/wp-content/uploads/2023/09/64b1118fd8e92c5a05bfcc41_The-Ultimate-Guide-to-Pricing-Security-Camera-Repair-Services-Feature.webp",
    },
    {
      name: "Interior Design & Renovation",
      image:
        "https://img.freepik.com/free-photo/set-designer-work-indoors_23-2149836952.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      name: "Event & Wedding Services",
      image:
        "https://static.showit.co/800/Zpy2postS6el2FBsuyg74Q/110183/poppati_events_minneapolis_minnesota_wedding_planning_designer_event_planner_destination_weddings_luxury_high_end_wedding_ashley_pachkofsky11.jpg",
    },
    {
      name: "Travel & Tour Services",
      image:
        "https://content.jdmagicbox.com/v2/comp/delhi/a5/011pxx11.xx11.200820182121.z6a5/catalogue/shri-hari-tour-and-travels-shakarpur-delhi-car-rental-atfkss2i50.jpg",
    },
  ],

  Jobs: [
    {
      name: "Delivery Jobs",
      image:
        "https://img.freepik.com/free-photo/delivery-concept-portrait-happy-african-american-delivery-man-red-cloth-holding-box-package-isolated-grey-studio-background-copy-space_1258-1216.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      name: "Driver Jobs",
      image:
        "https://thumbs.dreamstime.com/b/courier-delivery-black-man-driver-driving-car-boxes-packages-high-resolution-124918588.jpg",
    },
    {
      name: "Data Entry Jobs",
      image:
        "https://www.betterteam.com/images/data-entry-operator-job-description-4133x2526-2020127.jpeg?crop=40:21,smart&width=1200&dpr=2&format=pjpg&auto=webp&quality=85&format=jpg&quality=85",
    },
    {
      name: "Office Assistant",
      image: "https://www.citicollege.ca/wp-content/uploads/2022/04/blog-41.jpg",
    },
    {
      name: "Sales & Marketing",
      image:
        "https://s44783.pcdn.co/in/wp-content/uploads/sites/3/2022/03/What-is-the-Difference-Between-Sales-and-Marekting-1.jpg.webp",
    },
    {
      name: "Retail / Store Staff",
      image: "https://posify.io/wp-content/uploads/cashier-skills-101-4.jpg",
    },
    {
      name: "Hotel & Restaurant Jobs",
      image:
        "https://dexauc1l0pcnj.cloudfront.net/Content/images/blog/the-secret-sauce-how-to-build-a-winning-team-for-your-hotels-restaurant.jpg",
    },
    {
      name: "Cook / Chef",
      image: "https://axonify.com/wp-content/uploads/2024/08/iStock-951132442-1.jpg",
    },
    {
      name: "Housekeeping",
      image:
        "https://assets1.hospitalitytech.com/images/v/max_width_1440/2022-05/shutterstock_1628546512.jpg",
    },
    {
      name: "Telecaller / BPO",
      image: "https://apollo.olx.in/v1/files/jkfyl69ttd3c2-IN/image",
    },
    {
      name: "Teacher / Tutor",
      image:
        "https://storage.googleapis.com/schoolnet-content/blog/wp-content/uploads/2022/05/What-are-the-Different-Types-of-Teacher-Training-Programs.jpg",
    },
    {
      name: "Accountant",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO5hIIY4au0I9L1-wff6rYs9WsXPJospvoYw&s",
    },
  ],

  Agriculture: [
    {
      name: "Seeds",
      image:
        "https://articles-1mg.gumlet.io/articles/wp-content/uploads/2016/12/seeds.jpg?compress=true&quality=80&w=640&dpr=2.6",
    },
    {
      name: "Fertilizers",
      image:
        "https://cdn.prod.website-files.com/66604a97df59732aab43fcc8/66d8128cbcbc2701c6458d3e_types.webp",
    },
    {
      name: "Pesticides & Insecticides",
      image: "https://bestbeebrothers.com/cdn/shop/articles/bbb-pesticides.jpg?v=1524752687&width=2048",
    },
    {
      name: "Farming Tools",
      image:
        "https://www.downtoearth.org/sites/default/files/styles/max_800x800/public/uploads/articles/Pesticides.jpg?itok=hda_ayNF",
    },
    {
      name: "Agricultural Machinery",
      image:
        "https://www.deere.co.nz/assets/images/region-4/industries/agriculture/r4k033522_rrd-2-1024x576.jpg",
    },
    {
      name: "Irrigation Equipment",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0CtD2yh3CTXFetMhlXomZNEI0ryQChoghBQ&s",
    },
    {
      name: "Organic Products",
      image:
        "https://cdn.shopify.com/s/files/1/0632/4912/1521/files/th_480x480.jpg?v=1672911534",
    },
    {
      name: "Animal Feed",
      image:
        "https://shapiroe.com/wp-content/uploads/2023/06/food-waste-to-animal-feed-scaled.jpg",
    },
    {
      name: "Nursery Plants",
      image:
        "https://img.freepik.com/free-photo/row-fresh-green-plants-pot_23-2147918596.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      name: "Greenhouse Supplies",
      image:
        "https://gardenerspath.com/wp-content/uploads/2023/11/Pots-and-Trays-in-a-Greenhouse.jpg",
    },
  ],

  "Real Estate": [
    {
      name: "For Sale: Houses & Apartments",
      image:
        "https://lscdn.blob.core.windows.net/add-post/subcategoryid/11698915-add-17229293580709863.jpeg",
    },
    {
      name: "For Rent: Houses & Apartments",
      image:
        "https://www.livehomes.in/public/uploads/properties/3Bhk-Builder-Floor-Villa-for-Sale-in-Madipakkam-J-V-Nagar.jpg",
    },
    {
      name: "Lands & Plots",
      image:
        "https://skandhanshi.com/wp-content/uploads/2024/10/investing-in-farmland.webp",
    },
    {
      name: "For Rent: Shops & Offices",
      image:
        "https://www.m3mproperties.com/project_pics/m3m-dwarka-expressway-banner%20(1)-86492.jpg",
    },
    {
      name: "For Sale: Shops & Offices",
      image:
        "https://www.dlfhomes.co.in/dlf-preleased-commercial-shops-offices/images/banner-mobile.webp",
    },
    {
      name: "PG & Guest Houses",
      image:
        "https://gos3.ibcdn.com/d65ec843-b13c-4628-8d21-ce0709bc1931.JPG",
    },
  ],

  "Kitchenware & Cookware": [
    {
      name: "Kitchen Utensils",
      image:
        "https://rukminim2.flixcart.com/image/480/640/xif0q/kitchen-tool-set/o/z/p/karchi5pcsho-homfro-original-imagmarew6kpq6uh.jpeg?q=90",
    },
    {
      name: "Cookware (Pans, Tawas, Pots)",
      image: "https://m.media-amazon.com/images/I/61aZ1CUskVL._SL1500_.jpg",
    },
    {
      name: "Pressure Cookers",
      image:
        "https://vinodcookware.com/cdn/shop/files/TrentoCookwareSet-3pcs_InductionFriendly.jpg?v=1754127169",
    },
    {
      name: "Dinner Sets",
      image: "https://m.media-amazon.com/images/I/51pWIbcIdeL._SR290,290_AC_.jpg",
    },
    {
      name: "Serving Utensils",
      image: "https://m.media-amazon.com/images/I/51SD-3wL9VL._SR290,290_AC_.jpg",
    },
    {
      name: "Storage Containers",
      image:
        "https://5.imimg.com/data5/SELLER/Default/2022/5/RW/UU/MK/43621719/51evcofce3l-500x500.jpg",
    },
    {
      name: "Gas Stoves & Burners",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP_KdhwEbaIn4EjdpuwO6dMWP4SuRJrbGd3w&s",
    },
    {
      name: "Knives & Cutlery",
      image:
        "https://smiledrive.in/cdn/shop/files/KITCHENKNIFEHOLDER_8.png?v=1729518957&width=1445",
    },
    {
      name: "Bakeware",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJSZiQTYAFiOQ322dyYONrepMg4ddteYVm7w&s",
    },
    {
      name: "Traditional Utensils (Brass, Copper)",
      image:
        "https://img.freepik.com/premium-photo/set-various-traditional-kitchen-utensils-made-wood-clay-bowl_598621-716.jpg",
    },
  ],

  Sports: [
    {
      name: "Cricket Equipment",
      image: "https://cricketstuff.co.za/wp-content/uploads/2023/01/Denim-II-Grouped.jpg",
    },
    {
      name: "Football Gear",
      image:
        "https://www.capcerbere.com/wp-content/uploads/2020/10/29941-59-soccer-5585294_640.jpg",
    },
    {
      name: "Badminton & Tennis",
      image: "https://sportsgalaxy.in/wp-content/uploads/2025/07/88dtour.jpg",
    },
    {
      name: "Gym & Fitness Equipment",
      image:
        "https://www.bullrockfitness.com/wp-content/uploads/2025/02/Untitled-design-3-1024x1024.jpg",
    },
    {
      name: "Cycling",
      image:
        "https://bionmart.in/cdn/shop/files/1_357123d5-367d-4561-a5db-e1117d66b75f.webp?v=1720691313&width=1946",
    },
    {
      name: "Skating & Skateboards",
      image:
        "https://images.unsplash.com/photo-1622640338505-2ad7465bda17?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cm9sbGVyJTIwc2thdGluZ3xlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      name: "Swimming Gear",
      image: "https://www.swimnow.co.uk/wp-content/uploads/2023/05/Health-Benefits-of-Swimming.jpg",
    },
    {
      name: "Sportswear & Jerseys",
      image:
        "https://cms.cloudinary.vpsvc.com/image/upload/if_ar_gt_1.1/c_scale,t_pdpHeroGallery_Gallery/if_else/c_scale,w_816/if_end/f_auto,q_auto:best,dpr_auto/India%20LOB/Clothing%20and%20Bags/Sport%20Jerseys%20Round%20Neck/IN_Sport-Jerseys-Round-Neck-T-Shirts_Hero-image_02",
    },
    {
      name: "Yoga & Meditation Items",
      image:
        "https://5.imimg.com/data5/SELLER/Default/2024/2/384315612/HN/WY/YZ/31117473/wiselife-alignment-lines-tpe-anti-skid-yoga-mat-6mm-2-inch-by-24-inch-500x500.png",
    },
    {
      name: "Boxing & Martial Arts",
      image: "https://m.media-amazon.com/images/I/51gL-ICJQyL.jpg",
    },
    {
      name: "Camping & Trekking Gear",
      image:
        "https://www.trawoc.com/cdn/shop/files/trekelite-60l-backpack-hiking-trekking-rucksack-with-water-proof-rain-cover-englishblue-3931747.jpg?v=1762964774",
    },
    {
      name: "Indoor Games (Chess, Carrom, etc.)",
      image: "https://m.media-amazon.com/images/I/71vC16mUxTL.jpg",
    },
  ],
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toSub = (item) => {
  if (typeof item === "string") {
    return {
      key: slugify(item),
      label: item,
      image: "",
    };
  }

  return {
    key: slugify(item.name),
    label: item.name,
    image: item.image,
  };
};

const normalizeCategory = (key, value) => {
  if (Array.isArray(value)) {
    return {
      label: key,
      subs: value.map(toSub),
    };
  }

  if (value && Array.isArray(value.subs)) {
    return {
      label: value.label || key,
      subs: value.subs.map((sub) => ({
        key: sub.key || slugify(sub.label || ""),
        label: sub.label || sub.key || "",
        image: sub.image,
      })),
    };
  }

  return { label: key, subs: [] };
};

const categories = Object.fromEntries(
  Object.entries(rawCategories).map(([key, value]) => [
    key,
    normalizeCategory(key, value),
  ])
);

export default categories;


