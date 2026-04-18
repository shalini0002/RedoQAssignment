import Content from "../models/content.model.js";
import ApprovalLog from "../models/approval.model.js";
import { 
    canCreateContent,
    canSubmitForReview,
    canApprove,
    canReject,
    canEdit,
    updateWorkflowState,
    getAvailableActions,
    WORKFLOW_STATES
} from "../utils/workflow.js";

export const createContent = async(req, res) => {
    try {
        const { role } = req.body;
        
        // Validate user can create content
        if (!canCreateContent(role)) {
            return res.status(403).json({ error: "User role not authorized to create content" });
        }
        
        const content = await Content.create({
            title: req.body.title,
            body: req.body.body,
            createdBy: role,
            isEditable: true,
            status: WORKFLOW_STATES.DRAFT,
            approvedBy: []
        });
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getAllContent = async(req, res) => {
    try {
        const data = await Content.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getContentById = async(req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateContent = async(req, res) => {
    try {
        const { role } = req.body;
        const content = await Content.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // Validate user can edit this content
        if (!canEdit(content, role)) {
            return res.status(403).json({ error: "User not authorized to edit this content" });
        }

        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { 
                title: req.body.title,
                body: req.body.body
            },
            { returnDocument: 'after' }
        );

        res.json(updatedContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const submitContent = async(req, res) => {
    try {
        const { role } = req.body;
        const content = await Content.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // Validate user can submit this content
        if (!canSubmitForReview(content)) {
            return res.status(400).json({ error: "Content cannot be submitted in current state" });
        }

        // Update workflow state
        const updatedContent = updateWorkflowState(content, 'submit', role);
        
        const savedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { 
                status: updatedContent.status,
                isEditable: updatedContent.isEditable,
                rejectionReason: content.rejectionReason, // Preserve rejection reason
                updatedAt: new Date()
            },
            { returnDocument: 'after' }
        );

        await ApprovalLog.create({
            contentId: content._id,
            stage: WORKFLOW_STATES.REVIEW_1,
            action: "SUBMITTED",
            reviewedBy: role || 'SYSTEM'
        });

        res.json(savedContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const approveContent = async(req, res) => {
    try {
        const { role } = req.body;
        const content = await Content.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // Validate user can approve this content
        if (!canApprove(content, role)) {
            return res.status(403).json({ error: "User not authorized to approve this content" });
        }

        // Update workflow state
        const updatedContent = updateWorkflowState(content, 'approve', role);
        
        const savedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { 
                status: updatedContent.status,
                approvedBy: updatedContent.approvedBy,
                updatedAt: new Date()
            },
            { returnDocument: 'after' }
        );

        await ApprovalLog.create({
            contentId: content._id,
            stage: updatedContent.status,
            action: "APPROVED",
            reviewedBy: role
        });

        res.json(savedContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectContent = async(req, res) => {
    try {
        const { role, comment } = req.body;
        const content = await Content.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // Validate user can reject this content
        if (!canReject(content, role)) {
            return res.status(403).json({ error: "User not authorized to reject this content" });
        }

        // Update workflow state
        const updatedContent = updateWorkflowState(content, 'reject', role, comment);
        
        const savedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { 
                status: updatedContent.status,
                isEditable: updatedContent.isEditable,
                rejectionReason: updatedContent.rejectionReason,
                approvedBy: updatedContent.approvedBy,
                updatedAt: new Date()
            },
            { returnDocument: 'after' }
        );

        await ApprovalLog.create({
            contentId: content._id,
            stage: WORKFLOW_STATES.REJECTED,
            action: "REJECTED",
            comment: comment,
            reviewedBy: role
        });

        res.json(savedContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAvailableActionsController = async(req, res) => {
    try {
        const { role } = req.query;
        const content = await Content.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        const actions = getAvailableActions(content, role);
        res.json({ actions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
