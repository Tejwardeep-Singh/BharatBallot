import Modal from './Modal';
import Button from './Button';

function Confirm({ title, text, onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">
        {text}
      </p>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          className="bg-slate-100 text-slate-700"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

export default Confirm;