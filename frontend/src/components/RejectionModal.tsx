interface RejectionModalProps {
  showRejectionModal: boolean;
  rejectionComment: string;
  setRejectionComment: (comment: string) => void;
  setShowRejectionModal: (show: boolean) => void;
  handleReject: () => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  showRejectionModal,
  rejectionComment,
  setRejectionComment,
  setShowRejectionModal,
  handleReject
}) => {
  if (!showRejectionModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Content</h3>
        <textarea
          value={rejectionComment}
          onChange={(e) => setRejectionComment(e.target.value)}
          placeholder="Please provide a reason for rejection..."
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowRejectionModal(false);
              setRejectionComment('');
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
