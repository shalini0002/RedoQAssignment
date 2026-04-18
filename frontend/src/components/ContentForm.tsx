import { useEffect } from "react";

interface ContentFormProps {
  editingContent: any;
  formData: { title: string; body: string };
  setFormData: (data: { title: string; body: string }) => void;
  handleCreate: () => void;
  handleUpdate: () => void;
  handleCancelEdit: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({
  editingContent,
  formData,
  setFormData,
  handleCreate,
  handleUpdate,
  handleCancelEdit
}) => {
  useEffect(() => {
    if (editingContent) {
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }, [editingContent]);

  return (
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
          className="w-full border border-gray-300 rounded-md px-3 py-2"
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
  );
};

export default ContentForm;
