// App.tsx

import './app.css';
import './index.css';
import { useEffect, useState } from "react";
import { 
  fetchContent, 
  createContent, 
  updateContent, 
  submitContent, 
  approveContent, 
  rejectContent,
  getAvailableActions,
  type Content 
} from "./api/content";

type UserRole = 'ADMIN' | 'CREATOR' | 'REVIEWER_1' | 'REVIEWER_2';

// Workflow Progress Component
const WorkflowProgress = ({ status }: { status: string }) => {
  const steps = [
    { name: 'Draft', key: 'DRAFT', completed: true },
    { name: 'Review 1', key: 'REVIEW_1', completed: false, current: status === 'REVIEW_1' },
    { name: 'Review 2', key: 'REVIEW_2', completed: false, current: status === 'REVIEW_2' },
    { name: 'Approved', key: 'APPROVED', completed: false, current: status === 'APPROVED' }
  ];

  // Update completion status based on current status
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

function App() {
  const [contents, setContents] = useState<Content[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState<{ id: string; role: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchContent();
      setContents(res.data);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    
    try {
      await createContent({ 
        title: formData.title, 
        body: formData.body || 'Default content'
      }, currentRole);
      setFormData({ title: '', body: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  const handleEdit = (content: Content) => {
    if (!content.isEditable) return;
    setEditingContent(content);
    setFormData({ title: content.title, body: content.body });
    // Focus on textarea after a short delay to ensure DOM is updated
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  const handleUpdate = async () => {
    if (!editingContent) return;
    
    try {
      await updateContent(editingContent._id, formData, currentRole);
      setEditingContent(null);
      setFormData({ title: '', body: '' });
      loadData();
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingContent(null);
    setFormData({ title: '', body: '' });
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitContent(id, currentRole);
      loadData();
    } catch (error) {
      console.error('Failed to submit content:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveContent(id, currentRole);
      loadData();
    } catch (error) {
      console.error('Failed to approve content:', error);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectionTarget({ id, role: currentRole });
    setShowRejectionModal(true);
  };

  const handleReject = async () => {
    if (!rejectionTarget || !rejectionComment.trim()) return;
    
    try {
      await rejectContent(rejectionTarget.id, rejectionTarget.role, rejectionComment);
      setShowRejectionModal(false);
      setRejectionComment('');
      setRejectionTarget(null);
      loadData();
    } catch (error) {
      console.error('Failed to reject content:', error);
    }
  };

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

  const canSubmit = (content: Content) => {
    return ['DRAFT', 'REJECTED'].includes(content.status) && content.isEditable;
  };

  const canApprove = (content: Content) => {
    if (currentRole === 'REVIEWER_1' && content.status === 'REVIEW_1') return true;
    if (currentRole === 'REVIEWER_2' && content.status === 'REVIEW_2') return true;
    return false;
  };

  const canReject = (content: Content) => {
    if (content.status === 'REVIEW_1' && currentRole === 'REVIEWER_1') return true;
    if (content.status === 'REVIEW_2' && currentRole === 'REVIEWER_2') return true;
    return false;
  };

  const canEdit = (content: Content) => {
    return content.isEditable && (currentRole === 'ADMIN' || currentRole === 'CREATOR');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Role Switcher */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-600 mb-4">Content Review System </h1>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Current Role:</label>
            <select 
              value={currentRole} 
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ADMIN">Admin</option>
              <option value="CREATOR">Creator</option>
              <option value="REVIEWER_1">Reviewer 1</option>
              <option value="REVIEWER_2">Reviewer 2</option>
            </select>
          </div>
        </div>

        {/* Content Creation Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingContent ? 'Edit Content' : 'Create New Content'}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              className="w-full border border-gray-300  rounded-md px-3 py-2"
            />
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Content body"
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <div className="flex space-x-2">
              {editingContent ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreate}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Create Content
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content List */}
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
                
                {/* Workflow Progress */}
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
                      onClick={() => handleSubmit(content._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Submit for Review
                    </button>
                  )}
                  
                  {canEdit(content) && (
                    <button
                      onClick={() => handleEdit(content)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                  )}
                  
                  {canApprove(content) && (
                    <button
                      onClick={() => handleApprove(content._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  
                  {canReject(content) && (
                    <button
                      onClick={() => handleRejectClick(content._id)}
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

        {/* Rejection Modal */}
        {showRejectionModal && (
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
                    setRejectionTarget(null);
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
        )}
      </div>
    </div>
  );
}

export default App;