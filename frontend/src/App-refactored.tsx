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
  type Content 
} from "./api/content";
import ContentForm from './components/ContentForm';
import ContentList from './components/ContentList';
import RejectionModal from './components/RejectionModal';

type UserRole = 'ADMIN' | 'CREATOR' | 'REVIEWER_1' | 'REVIEWER_2';

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
        <ContentForm
          editingContent={editingContent}
          formData={formData}
          setFormData={setFormData}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleCancelEdit={handleCancelEdit}
        />

        {/* Content List */}
        <ContentList
          contents={contents}
          canSubmit={canSubmit}
          canEdit={canEdit}
          canApprove={canApprove}
          canReject={canReject}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          onApprove={handleApprove}
          onRejectClick={handleRejectClick}
        />

        {/* Rejection Modal */}
        <RejectionModal
          showRejectionModal={showRejectionModal}
          rejectionComment={rejectionComment}
          setRejectionComment={setRejectionComment}
          setShowRejectionModal={setShowRejectionModal}
          handleReject={handleReject}
        />
      </div>
    </div>
  );
}

export default App;
