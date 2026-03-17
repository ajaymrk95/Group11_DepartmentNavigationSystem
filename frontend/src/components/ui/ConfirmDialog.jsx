import Modal from "./Modal";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
      </div>
    </Modal>
  );
}
