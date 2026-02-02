import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { Loader2, XCircle, CheckCircle2, Upload } from "lucide-react";
import CATEGORY_FIELDS from "./CategoryFields";
import { Input, Textarea, Select } from "./FormControls";
import { INDIA_LOCATIONS } from "../../Data/indiaCities";

const CreateAdForm = ({
  step,
  uploading,
  form,
  preview,
  subcategories,
  showDelivery,
  showSalary,
  handleChange,
  handleFileChange,
  handleRemoveImage,
  handleNext,
  handleBack,
  handleSubmit,
  videoFile,
  videoPreview,
  handleVideoChange,
  setVideoFile,
  setVideoPreview,

}) => {
  const steps = ["Basic Info", "Pricing & Media", "Location & Preview"];
  const mobileAccessoriesFields = [
    {
      name: "accessoryType",
      placeholder: "Accessory Type",
      type: "select",
      options: [
        "Charger",
        "Cable",
        "Earphones",
        "Headphones",
        "Power Bank",
        "Mobile Cover",
        "Screen Protector",
        "Stand / Holder",
      ],
    },
  ];

  const agricultureSeedsFields = [
    { name: "seedType", placeholder: "Crop Name (Wheat, Rice, Maize)" },
    { name: "variety", placeholder: "Variety / Hybrid (Optional)" },
    {
      name: "quantityUnit",
      placeholder: "Unit",
      type: "select",
      options: ["Liter", "Piece", "Bag", "MT", "Kg", "Gram", "ML", "Nos", "Ton", "Packet"],
    },
    { name: "quantity", placeholder: "Quantity" },
  ];

  const agricultureFertilizersFields = [
    {
      name: "fertilizerType",
      placeholder: "Type",
      type: "select",
      options: ["Urea", "DAP", "Organic", "Compost"],
    },
    {
      name: "weightUnit",
      placeholder: "Unit",
      type: "select",
      options: ["Liter", "Piece", "Bag", "MT", "Kg", "Gram", "ML", "Nos", "Ton", "Packet"],
    },
    { name: "weight", placeholder: "Weight / Quantity" },
    {
      name: "form",
      placeholder: "Form",
      type: "select",
      options: ["Solid", "Liquid"],
    },
  ];

  const agriculturePesticidesFields = [
    {
      name: "pesticideType",
      placeholder: "Type",
      type: "select",
      options: ["Insecticide", "Herbicide", "Fungicide"],
    },
    { name: "targetCrop", placeholder: "Target Crop" },
    {
      name: "quantityUnit",
      placeholder: "Unit",
      type: "select",
      options: ["Liter", "Piece", "Bag", "MT", "Kg", "Gram", "ML", "Nos", "Ton", "Packet"],
    },
    { name: "quantity", placeholder: "Quantity" },
  ];

  const agricultureEquipmentFields = [
    { name: "toolName", placeholder: "Equipment (Plough, Sprayer, Hoe)" },
    {
      name: "condition",
      placeholder: "Condition",
      type: "select",
      options: ["New", "Used"],
    },
    
  ];

  const agricultureOtherProductsFields = [
    { name: "productType", placeholder: "Product Name" },
    {
      name: "quantityUnit",
      placeholder: "Unit",
      type: "select",
      options: ["Liter", "Piece", "Bag", "MT", "Kg", "Gram", "ML", "Nos", "Ton", "Packet"],
    },
    { name: "quantity", placeholder: "Quantity" },
  ];


  const realEstateSaleFields = [
    {
      name: "bedrooms",
      placeholder: "Bedrooms",
      type: "select",
      options: ["1", "2", "3", "4+"],
    },
    {
      name: "bathrooms",
      placeholder: "Bathrooms",
      type: "select",
      options: ["1", "2", "3", "4+"],
    },
    { name: "area", placeholder: "Area Size (sq.ft)" },
    {
      name: "furnishing",
      placeholder: "Furnishing",
      type: "select",
      options: ["Yes", "No"],
    },
    
    {
      name: "parking",
      placeholder: "Parking",
      type: "select",
      options: ["Yes", "No"],
    },
  ];
  const realEstateRentFields = [
    {
      name: "bedrooms",
      placeholder: "Bedrooms",
      type: "select",
      options: ["1", "2", "3", "4+"],
    },
    {
      name: "bathrooms",
      placeholder: "Bathrooms",
      type: "select",
      options: ["1", "2", "3", "4+"],
    },
    { name: "area", placeholder: "Area Size (sq.ft)" },
    {
      name: "furnishing",
      placeholder: "Furnishing",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "parking",
      placeholder: "Parking",
      type: "select",
      options: ["Yes", "No"],
    },
  ];

  
  const realEstatePlotFields = [
    { name: "plotArea", placeholder: "Plot Area" },
    {
      name: "plotType",
      placeholder: "Plot Type",
      type: "select",
      options: ["Residential", "Commercial"],
    },
    { name: "facing", placeholder: "Facing" },
   
  ];
  const realEstateRentShopFields = [
    { name: "area", placeholder: "Area Size (sq.ft)" },
    {
      name: "furnishing",
      placeholder: "Furnishing",
      type: "select",
      options: ["Furnished", "Semi", "Unfurnished"],
    },
    {
      name: "washroom",
      placeholder: "Washroom",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "parking",
      placeholder: "Parking",
      type: "select",
      options: ["Yes", "No"],
    },
  ];
  const realEstateSaleShopFields = [
    { name: "area", placeholder: "Area Size (sq.ft)" },
    {
      name: "furnishing",
      placeholder: "Furnishing",
      type: "select",
      options: ["Furnished", "Semi", "Unfurnished"],
    },
    {
      name: "washroom",
      placeholder: "Washroom",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "parking",
      placeholder: "Parking",
      type: "select",
      options: ["Yes", "No"],
    },
  ];
  const realEstatePgFields = [
    {
      name: "bedrooms",
      placeholder: "Bedrooms / Rooms",
      type: "select",
      options: ["1", "2", "3", "4+"],
    },
    {
      name: "bathrooms",
      placeholder: "Bathrooms",
      type: "select",
      options: ["1", "2", "3", "4+"],
    },
    {
      name: "furnishing",
      placeholder: "Furnishing",
      type: "select",
      options: ["Furnished", "Semi", "Unfurnished"],
    },
    {
      name: "roomType",
      placeholder: "Room Type",
      type: "select",
      options: ["Single", "Shared"],
    },
    {
      name: "parking",
      placeholder: "Parking",
      type: "select",
      options: ["Yes", "No"],
    },
  ];

  const indianStates = Object.keys(INDIA_LOCATIONS.Malawi || {});
  return (
    <div className="flex-1 lg:ml-64 min-h-screen bg-[#F9FAFB] px-4 sm:px-6 md:px-10 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#2E3192]">Post New Ad</h1>
          <p className="text-gray-500 mt-1">
            Create your ad in a few simple steps
          </p>
        </div>

        {/* STEPPER */}
        <div className="mb-14">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-[3px] bg-gray-200 rounded-full" />
            <div
              className="absolute top-5 left-0 h-[3px] bg-[#2E3192] rounded-full transition-all duration-500"
              style={{
                width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((label, idx) => {
              const active = step === idx + 1;
              const completed = step > idx + 1;

              return (
                <div
                  key={idx}
                  className="relative z-10 flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-11 h-11 flex items-center justify-center rounded-full border-2 font-semibold transition-all
                    ${
                      completed
                        ? "bg-[#2E3192] border-[#2E3192] text-white"
                        : active
                        ? "bg-white border-[#2E3192] text-[#2E3192] scale-110 shadow-md"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {completed ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>

                  <span
                    className={`mt-3 text-sm font-medium ${
                      active || completed
                        ? "text-[#2E3192]"
                        : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 md:p-10"
        >
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                <Input
                  label="Ad Title"
                  name="title"
                  value={form.title || ""}
                  onChange={handleChange}
                  placeholder="Toyota Corolla 2018 • 3 BHK House"
                />

                <Textarea
                  label="Description"
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  placeholder="Describe your product or service..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    label="Category"
                    name="category"
                    value={form.category || ""}
                    onChange={handleChange}
                    options={Object.keys(subcategories)}
                  />

                  <Select
                    label="Subcategory"
                    name="subcategory"
                    value={form.subcategory || ""}
                    onChange={handleChange}
                    options={form.category ? subcategories[form.category] : []}
                    disabled={!form.category}
                  />
                </div>

                {Array.isArray(CATEGORY_FIELDS[form.category]) &&
                  !(
                    form.category === "Vehicles" &&
                    (form.subcategory?.toLowerCase().includes("spare parts") ||
                      form.subcategory?.toLowerCase().includes("accessories"))
                  ) &&
                  !(
                    form.category === "Mobiles" &&
                    form.subcategory?.toLowerCase().includes("accessories")
                  ) &&
                  form.category !== "Agriculture" &&
                  form.category !== "Real Estate" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {CATEGORY_FIELDS[form.category].map((f) =>
                      f.type === "select" ? (
                        <Select
                          key={f.name}
                          label={f.placeholder}
                          name={f.name}
                          value={form[f.name] || ""}
                          onChange={handleChange}
                          options={f.options}
                        />
                      ) : (
                        <Input
                          key={f.name}
                          name={f.name}
                          value={form[f.name] || ""}
                          onChange={handleChange}
                          placeholder={f.placeholder}
                          type={f.type}
                        />
                      )
                    )}
                  </div>
                )}

                {form.category === "Agriculture" &&
                  form.subcategory === "Seeds" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {agricultureSeedsFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Agriculture" &&
                  form.subcategory === "Fertilizers" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {agricultureFertilizersFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Agriculture" &&
                  form.subcategory === "Pesticides" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {agriculturePesticidesFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Agriculture" &&
                  form.subcategory === "Equipment" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {agricultureEquipmentFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Agriculture" &&
                  form.subcategory === "Other Products" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {agricultureOtherProductsFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Real Estate" &&
                  form.subcategory === "For Sale: Houses & Apartments" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {realEstateSaleFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Real Estate" &&
                  form.subcategory === "For Rent: Houses & Apartments" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {realEstateRentFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Real Estate" &&
                  form.subcategory === "Lands & Plots" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {realEstatePlotFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Real Estate" &&
                  form.subcategory === "For Rent: Shops & Offices" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {realEstateRentShopFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Real Estate" &&
                  form.subcategory === "For Sale: Shops & Offices" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {realEstateSaleShopFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Real Estate" &&
                  form.subcategory === "PG & Guest Houses" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {realEstatePgFields.map((f) =>
                        f.type === "select" ? (
                          <Select
                            key={f.name}
                            label={f.placeholder}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            options={f.options}
                          />
                        ) : (
                          <Input
                            key={f.name}
                            name={f.name}
                            value={form[f.name] || ""}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.type}
                          />
                        )
                      )}
                    </div>
                  )}

                {form.category === "Mobiles" &&
                  form.subcategory?.toLowerCase().includes("accessories") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {mobileAccessoriesFields.map((f) => (
                        <Select
                          key={f.name}
                          label={f.placeholder}
                          name={f.name}
                          value={form[f.name] || ""}
                          onChange={handleChange}
                          options={f.options}
                        />
                      ))}
                    </div>
                  )}

                {!["Jobs",  "Services", "Agriculture" ,"Livestock" , "realestate" , "real estate"].includes(form.category) && (
                  <div className="flex gap-10 pt-4">
                    {["New", "Used"].map((c) => (
                      <label key={c} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="condition"
                          value={c}
                          checked={form.condition === c}
                          onChange={handleChange}
                          className="accent-[#2E3192]"
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
  <motion.div key="step2" className="space-y-8">
    {!showSalary && form.category !== "Services" && (
      <div className="grid sm:grid-cols-2 gap-6">
        {/* PRICE INPUT */}
        <div className="flex flex-col gap-2">
          <Input
            type="number"
            name="price"
            value={form.price ?? ""}
            onChange={handleChange}
            placeholder="Price (MK)"
          />

          {/* ✅ NEGOTIABLE CHECKBOX */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="negotiable"
              checked={form.negotiable || false}
              onChange={handleChange}
              className="w-4 h-4 accent-[#2E3192]"
            />
            Price is negotiable
          </label>
        </div>
      </div>
    )}

    <div className="grid gap-6 lg:grid-cols-2">
      {/* IMAGE UPLOAD */}
      <div className="border-2 border-dashed border-[#2E3192] rounded-2xl p-10 text-center bg-[#F8FAFC] min-h-[220px] flex flex-col items-center justify-center">
        <Upload size={32} className="mx-auto text-[#2E3192]" />
        <p className="mt-3 text-sm text-gray-600">
          {preview.length >= 5
            ? "Images done — you can not upload more."
            : preview.length > 0
            ? `You can upload ${5 - preview.length} more image${5 - preview.length === 1 ? "" : "s"}.`
            : "You can upload up to 5 images."}
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="imageUpload"
          disabled={preview.length >= 5}
        />
        <label
          htmlFor="imageUpload"
          className={`inline-flex items-center justify-center mt-4 px-7 py-2.5 text-sm font-semibold rounded-xl shadow-sm ${
            preview.length >= 5
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#2E3192] text-white cursor-pointer"
          }`}
        >
          Choose Images
        </label>
      </div>

      {/* VIDEO UPLOAD (OPTIONAL, MAX 30 SEC) */}
      <div className="border-2 border-dashed border-[#2E3192] rounded-2xl p-10 text-center bg-[#F8FAFC] min-h-[220px] flex flex-col items-center justify-center">
        <p className="text-sm font-medium text-gray-700 mb-3">
          {videoPreview
            ? "Video uploaded — you can not upload more."
            : "Upload Video (Optional - Max 30 sec)"}
        </p>

        {!videoPreview && (
          <>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              id="videoUpload"
            />

            <label
              htmlFor="videoUpload"
              className="inline-flex items-center justify-center gap-2 px-7 py-2.5 text-sm font-semibold bg-[#2E3192] text-white rounded-xl cursor-pointer shadow-sm"
            >
              <Upload size={18} />
              Choose Video
            </label>
          </>
        )}
      </div>
    </div>

    {/* IMAGE + VIDEO PREVIEW */}
    {(preview.length > 0 || videoPreview) && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {videoPreview && (
          <div className="relative rounded-xl overflow-hidden border bg-black/5 aspect-square">
            <video
              src={videoPreview}
              controls
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setVideoFile(null);
                setVideoPreview(null);
                Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "success",
                  title: "Video removed",
                  showConfirmButton: false,
                  timer: 1500,
                  timerProgressBar: true,
                });
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {preview.map((url, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden border aspect-square">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(i)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <XCircle size={16} />
            </button>
          </div>
        ))}
      </div>
    )}
  </motion.div>
)}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="step3" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-end">
                  <Select
                    label="State"
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                    options={indianStates}
                  />
                  <Input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                  <Input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Full Location"
                  />
                </div>

                {showDelivery && (
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="deliveryAvailable"
                      checked={form.deliveryAvailable}
                      onChange={handleChange}
                      className="accent-[#2E3192]"
                    />
                    Delivery Available
                  </label>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTIONS */}

          <div className="flex justify-between mt-12">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 rounded-xl border"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-[#2E3192] text-white rounded-xl"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading}
                className="ml-auto px-6 py-2 bg-[#2E3192] text-white rounded-xl flex items-center gap-2"
              >
                {uploading && <Loader2 className="animate-spin" size={18} />}
                Publish Ad
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAdForm;
