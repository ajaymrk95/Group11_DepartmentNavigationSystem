import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  const widths = { sm: '400px', md: '520px', lg: '700px', xl: '900px' };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content card" style={{ width: widths[size], maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E8E2DB' }}>
          <h2 className="font-display font-semibold text-lg" style={{ color: '#1A3263' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X size={18} color="#547792" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
