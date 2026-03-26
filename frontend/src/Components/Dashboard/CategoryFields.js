const CATEGORY_FIELDS = {
  /* =========================
       🏠 REAL ESTATE
    ========================= */
  "Real Estate": [
    { name: "bedrooms", placeholder: "Bedrooms" },
    { name: "bathrooms", placeholder: "Bathrooms" },
    { name: "area", placeholder: "Area (sq.ft)" },
    { name: "furnishing", placeholder: "Furnishing" },
  ],

  /* =========================
       🚗 VEHICLES (unchanged)
    ========================= */
  Vehicles: [
    { name: "brand", placeholder: "Brand" },
    { name: "color", placeholder: "Color" },
    { name: "year", placeholder: "Model Year" },
    { name: "mileage", placeholder: "Mileage (KM)" },
    {
      name: "fuelType",
      placeholder: "Fuel Type",
      type: "select",
      options: ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"],
    },
  ],

  /* =========================
       📱 MOBILES
    ========================= */
  Mobiles: [
    { name: "brand", placeholder: "Brand (Apple, Samsung, etc.)" },
    { name: "model", placeholder: "Model Name" },
    { name: "color", placeholder: "Color" },
    { name: "storage", placeholder: "Storage (64GB / 128GB)" },
    { name: "warranty", placeholder: "Warranty Status" },
  ],

  /* =========================
       💻 ELECTRONICS
    ========================= */
  Electronics: [
    { name: "brand", placeholder: "Brand" },
    { name: "model", placeholder: "Model" },
    { name: "color", placeholder: "Color" },

    { name: "warranty", placeholder: "Warranty" },
    { name: "conditionNote", placeholder: "Additional Info" },
  ],

  /* =========================
       🛋️ Furniture
    ========================= */
  Furniture: [
    { name: "material", placeholder: "Material" },
     { name: "color", placeholder: "Color" },

   ],

 

  /* =========================
       🏏 SPORTS
    ========================= */
  Sports: [
    { name: "sportType", placeholder: "Sport Type (Cricket, Football)" },
    { name: "brand", placeholder: "Brand" },
    { name: "size", placeholder: "Size / Weight" },
  ],

  /* =========================
       👗 FASHION
    ========================= */
  Fashion: [
    { name: "size", placeholder: "Size (S / M / L / XL)" },
    { name: "color", placeholder: "Color" },
    { name: "brand", placeholder: "Brand" },
    { name: "material", placeholder: "Material (Cotton, Denim)" },
  ],

  /* =========================
       📚 BOOKS
    ========================= */

  /* =========================
       🍽️ UTENSILS (NEW)
    ========================= */
  "Kitchenware & Cookware": [
    { name: "utensilType", placeholder: "Item Type" },
    { name: "material", placeholder: "Material " },
    { name: "brand", placeholder: "Brand" },
    { name: "color", placeholder: "Color" },

    // { name: "conditionNote", placeholder: "Condition Details" },
  ],

  /* =========================
       🍎 FOOD & BEVERAGES
    ========================= */
  "Food & Beverages": [
    { name: "productType", placeholder: "Product Name" },
    { name: "brand", placeholder: "Brand (Optional)" },
    { name: "quantity", placeholder: "Quantity" },
    {
      name: "quantityUnit",
      placeholder: "Unit",
      type: "select",
      options: ["Kg", "Gram", "Liter", "ML", "Piece", "Packet", "Bottle", "Box"],
    },
  ],

  /* =========================
       🍷 ALCOHOL & TOBACCO
    ========================= */
  "Alcohol & Tobacco": [
    { name: "brand", placeholder: "Brand" },
    { name: "quantity", placeholder: "Quantity" },
    {
      name: "quantityUnit",
      placeholder: "Unit",
      type: "select",
      options: ["Bottle", "Can", "ML", "Liter", "Packet", "Piece"],
    },
  ],

  /* =========================
       🎵 HOBBIES & ENTERTAINMENT
    ========================= */
  "Hobbies & Entertainment": [
    { name: "productType", placeholder: "Instrument / Item Name" },
    { name: "brand", placeholder: "Brand" },
    { name: "model", placeholder: "Model" },
    { name: "conditionNote", placeholder: "Additional Info" },
  ],

 
  /* =========================
       🌾 AGRICULTURE (NEW)
    ========================= */
  Agriculture: [
    { name: "itemType", placeholder: "Item Type (Seeds, Equipment, Fertilizer)" },
    { name: "cropType", placeholder: "Crop Type (Wheat, Rice, Vegetables)" },
    { name: "quantity", placeholder: "Quantity (Kg / Units)" },
    { name: "conditionNote", placeholder: "Additional Details" },
  ],

 

 
 

  "Beauty & Personal Care": [
    { name: "productType", placeholder: "Product Type" },
    { name: "brand", placeholder: "Brand" },
    { name: "quantity", placeholder: "Quantity / Size" },
   ],
};

export default CATEGORY_FIELDS;


