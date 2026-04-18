/**
 * Workflow Validation Utility
 * Handles all business logic for content approval workflow
 */

const WORKFLOW_STATES = {
  DRAFT: 'DRAFT',
  REVIEW_1: 'REVIEW_1', 
  REVIEW_2: 'REVIEW_2',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

const USER_ROLES = {
  ADMIN: 'ADMIN',
  CREATOR: 'CREATOR', 
  REVIEWER_1: 'REVIEWER_1',
  REVIEWER_2: 'REVIEWER_2'
};

/**
 * Validates if a user can create content
 */
const canCreateContent = (userRole) => {
  return [USER_ROLES.ADMIN, USER_ROLES.CREATOR].includes(userRole);
};

/**
 * Validates if content can be submitted for review
 */
const canSubmitForReview = (content) => {
  return [WORKFLOW_STATES.DRAFT, WORKFLOW_STATES.REJECTED].includes(content.status) && content.isEditable;
};

/**
 * Validates if a user can approve content at current stage
 */
const canApprove = (content, userRole) => {
  if (content.status === WORKFLOW_STATES.REVIEW_1 && userRole === USER_ROLES.REVIEWER_1) {
    return true;
  }
  if (content.status === WORKFLOW_STATES.REVIEW_2 && userRole === USER_ROLES.REVIEWER_2) {
    return true;
  }
  return false;
};

/**
 * Validates if a user can reject content at current stage
 */
const canReject = (content, userRole) => {
  return [WORKFLOW_STATES.REVIEW_1, WORKFLOW_STATES.REVIEW_2].includes(content.status) && 
         [USER_ROLES.REVIEWER_1, USER_ROLES.REVIEWER_2].includes(userRole);
};

/**
 * Validates if content can be edited
 */
const canEdit = (content, userRole) => {
  return content.isEditable && [USER_ROLES.ADMIN, USER_ROLES.CREATOR].includes(userRole);
};

/**
 * Determines next status after approval
 */
const getNextStatusAfterApproval = (currentStatus) => {
  switch (currentStatus) {
    case WORKFLOW_STATES.REVIEW_1:
      return WORKFLOW_STATES.REVIEW_2;
    case WORKFLOW_STATES.REVIEW_2:
      return WORKFLOW_STATES.APPROVED;
    default:
      throw new Error(`Cannot approve content in status: ${currentStatus}`);
  }
};

/**
 * Validates workflow transition
 */
const isValidTransition = (fromStatus, toStatus, userRole) => {
  const validTransitions = {
    [WORKFLOW_STATES.DRAFT]: [WORKFLOW_STATES.REVIEW_1],
    [WORKFLOW_STATES.REVIEW_1]: [WORKFLOW_STATES.REVIEW_2, WORKFLOW_STATES.REJECTED],
    [WORKFLOW_STATES.REVIEW_2]: [WORKFLOW_STATES.APPROVED, WORKFLOW_STATES.REJECTED],
    [WORKFLOW_STATES.REJECTED]: [WORKFLOW_STATES.DRAFT],
    [WORKFLOW_STATES.APPROVED]: []
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
};

/**
 * Updates content status and properties based on workflow
 */
const updateWorkflowState = (content, action, userRole, comment = null) => {
  const updatedContent = { ...content };
  
  switch (action) {
    case 'submit':
      if (!canSubmitForReview(content)) {
        throw new Error('Content cannot be submitted for review');
      }
      updatedContent.status = WORKFLOW_STATES.REVIEW_1;
      updatedContent.isEditable = false;
      // Keep rejection reason for visibility during review
      break;
      
    case 'approve':
      if (!canApprove(content, userRole)) {
        throw new Error('User cannot approve this content');
      }
      updatedContent.status = getNextStatusAfterApproval(content.status);
      
      // Add approval record
      if (!updatedContent.approvedBy) {
        updatedContent.approvedBy = [];
      }
      updatedContent.approvedBy.push({
        role: userRole,
        timestamp: new Date()
      });
      
      // Lock content if fully approved
      if (updatedContent.status === WORKFLOW_STATES.APPROVED) {
        updatedContent.isEditable = false;
      }
      break;
      
    case 'reject':
      if (!canReject(content, userRole)) {
        throw new Error('User cannot reject this content');
      }
      updatedContent.status = WORKFLOW_STATES.REJECTED;
      updatedContent.isEditable = true;
      updatedContent.rejectionReason = comment;
      updatedContent.approvedBy = []; // Reset approval history
      break;
      
    case 'edit':
      if (!canEdit(content, userRole)) {
        throw new Error('User cannot edit this content');
      }
      // Content remains in current status but is editable
      break;
      
    default:
      throw new Error(`Invalid workflow action: ${action}`);
  }
  
  return updatedContent;
};

/**
 * Gets available actions for a user on specific content
 */
const getAvailableActions = (content, userRole) => {
  const actions = [];
  
  if (canSubmitForReview(content) && canCreateContent(userRole)) {
    actions.push('submit');
  }
  
  if (canApprove(content, userRole)) {
    actions.push('approve');
  }
  
  if (canReject(content, userRole)) {
    actions.push('reject');
  }
  
  if (canEdit(content, userRole)) {
    actions.push('edit');
  }
  
  return actions;
};

/**
 * Validates if workflow is complete for content
 */
const isWorkflowComplete = (content) => {
  return content.status === WORKFLOW_STATES.APPROVED;
};

/**
 * Gets workflow progress information
 */
const getWorkflowProgress = (content) => {
  const steps = [
    { name: 'Draft', status: 'completed', key: WORKFLOW_STATES.DRAFT },
    { name: 'Review 1', status: 'pending', key: WORKFLOW_STATES.REVIEW_1 },
    { name: 'Review 2', status: 'pending', key: WORKFLOW_STATES.REVIEW_2 },
    { name: 'Approved', status: 'pending', key: WORKFLOW_STATES.APPROVED }
  ];
  
  const currentIndex = steps.findIndex(step => step.key === content.status);
  
  if (currentIndex > 0) {
    for (let i = 0; i < currentIndex; i++) {
      steps[i].status = 'completed';
    }
  }
  
  if (content.status === WORKFLOW_STATES.REJECTED) {
    const rejectedStep = steps.find(step => step.key === WORKFLOW_STATES.REVIEW_1) || 
                        steps.find(step => step.key === WORKFLOW_STATES.REVIEW_2);
    if (rejectedStep) {
      rejectedStep.status = 'rejected';
    }
  }
  
  return steps;
};

module.exports = {
  WORKFLOW_STATES,
  USER_ROLES,
  canCreateContent,
  canSubmitForReview,
  canApprove,
  canReject,
  canEdit,
  isValidTransition,
  updateWorkflowState,
  getAvailableActions,
  isWorkflowComplete,
  getWorkflowProgress
};