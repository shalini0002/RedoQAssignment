import { Content } from "../api/content";

interface ContentListProps {
  contents: Content[];
  currentRole: string;
  canSubmit: (content: Content) => boolean;
  canEdit: (content: Content) => boolean;
  canApprove: (content: Content) => boolean;
  canReject: (content: Content) => boolean;
  onEdit: (content: Content) => void;
  onSubmit: (id: string) => void;
  onApprove: (id: string) => void;
  onRejectClick: (id: string) => void;
}

const WorkflowProgress = ({ status }: { status: string }) => {
  const steps = [
    { name: 'Draft', key: 'DRAFT', completed: true },
    { name: 'Review 1', key: 'REVIEW_1', completed: false, current: status === 'REVIEW_1' },
    { name: 'Review 2', key: 'REVIEW_2', completed: false, current: status === 'REVIEW_2' },
    { name: 'Approved', key: 'APPROVED', completed: false, current: status === 'APPROVED' }
  ];

  const currentIndex = steps.findIndex(step => step.key === status);
  if (currentIndex > 0) {
    for (let i = 0; i < currentIndex; i++) {
      steps[i].completed = true;
    }
  }
  if (status === 'APPROVED') {
    steps[3].completed = true;
  }

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
            ${step.completed ? 'bg-green-500 text-white' : 
              step.current ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
          `}>
            {step.completed ? '✓' : index + 1}
          </div>
          <span className={`ml-2 text-sm ${step.completed ? 'text-green-600' : step.current ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const ContentList: React.FC<ContentListProps> = ({
  contents,
  currentRole,
  canSubmit,
  canEdit,
  canApprove,
  canReject,
  onEdit,
  onSubmit,
  onApprove,
  onRejectClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-600';
      case 'REVIEW_1': return 'text-blue-600';
      case 'REVIEW_2': return 'text-purple-600';
      case 'APPROVED': return 'text-green-600';
      case 'REJECTED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Items</h2>
      <div className="space-y-4">
        {contents.map((content) => (
          <div key={content._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
                <p className="text-sm text-gray-600">By: {content.createdBy}</p>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(content.status)}`}>
                {content.status.replace('_', ' ')}
              </span>
            </div>
            
            <WorkflowProgress status={content.status} />
            
            <p className="text-gray-700 mb-4">{content.body}</p>
            
            {content.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {content.rejectionReason}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {canSubmit(content) && (
                <button
                  onClick={() => onSubmit(content._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Submit for Review
                </button>
              )}
              
              {canEdit(content) && (
                <button
                  onClick={() => onEdit(content)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Edit
                </button>
              )}
              
              {canApprove(content) && (
                <button
                  onClick={() => onApprove(content._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              
              {canReject(content) && (
                <button
                  onClick={() => onRejectClick(content._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentList;
