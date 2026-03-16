type FormData = {
  name: string;
  type: string;
  category: string;
  description: string;
}

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  coords: [number, number] | null;
  onClosePanel: () => void;
  onSubmit: () => void;
}

export default function AddLocationForm({ formData, setFormData, coords, onClosePanel, onSubmit }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#1a305b] px-6 py-5 flex justify-between items-center shadow-md shrink-0">
        <h2 className="text-[#e9e4d9] text-xl font-bold tracking-wide">Add Location</h2>
        <button onClick={onClosePanel} className="md:hidden text-white bg-white/20 p-2 rounded-full">✕</button>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }} 
        className="p-6 flex-1 overflow-y-auto space-y-4"
      >
        <div>
          <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Name *</label>
          <input 
            required 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none" 
            placeholder="e.g. New Library" 
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Type *</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none bg-white"
            >
              <option value="building">Building</option>
              <option value="lab">Lab</option>
              <option value="connection">Connection</option>
              <option value="room">Room</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Category *</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none bg-white"
            >
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Coordinates *</label>
          <input 
            readOnly 
            type="text" 
            value={coords ? `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}` : "Not set"} 
            className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 bg-gray-100 text-gray-500 outline-none cursor-not-allowed" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Description</label>
          <textarea 
            rows={3} 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none" 
            placeholder="Add details..." 
          />
        </div>

        <button 
          type="submit" 
          className="w-full mt-4 py-3 rounded-xl bg-[#1a305b] text-[#e9e4d9] font-bold shadow-md hover:bg-[#11203d] active:scale-[0.98] transition-all"
        >
          Save Location
        </button>
        
        <a href="/" className="block text-center mt-4 text-[#547792] text-sm font-semibold hover:underline">
          ← Back to Map
        </a>
      </form>
    </div>
  )
}