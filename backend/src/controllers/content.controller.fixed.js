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
                updatedAt: new Date()
            },
            { new: true }
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
