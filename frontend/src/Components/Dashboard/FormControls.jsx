export const Input = ({ label, ...props }) => (
  <div className="w-full flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-gray-700">{label}</label>
    )}
    <input
      {...props}
      className="h-12 px-4 rounded-2xl border border-gray-300 bg-white shadow-sm focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/20 outline-none transition"
    />
  </div>
);
  
export const Textarea = ({ label, ...props }) => (
  <div className="w-full flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-gray-700">{label}</label>
    )}
    <textarea
      {...props}
      rows={4}
      className="px-4 py-3 rounded-2xl border border-gray-300 bg-white shadow-sm focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/20 outline-none transition"
    />
  </div>
);
  
export const Select = ({ label, options = [], ...props }) => (
  <div className="w-full flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-gray-700">{label}</label>
    )}
    <select
      {...props}
      className="h-12 px-4 rounded-2xl border border-gray-300 bg-white shadow-sm focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/20 outline-none transition"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);
  
