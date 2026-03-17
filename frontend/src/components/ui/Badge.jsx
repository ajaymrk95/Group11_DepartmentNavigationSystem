const variants = {
  classroom: "bg-blue-100 text-blue-700",
  lab: "bg-purple-100 text-purple-700",
  hall: "bg-indigo-100 text-indigo-700",
  toilet: "bg-gray-100 text-gray-600",
  office: "bg-green-100 text-green-700",
  stairs: "bg-orange-100 text-orange-700",
  corridor: "bg-yellow-100 text-yellow-700",
  default: "bg-[#E8E2DB] text-[#547792]",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  error: "bg-red-100 text-red-700",
};

export default function Badge({ label, variant }) {
  const cls = variants[variant] || variants[label?.toLowerCase()] || variants.default;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}
