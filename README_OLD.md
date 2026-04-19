# Content Review System

A multi-stage content approval workflow system with role-based permissions and state management.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [Workflow Design](#workflow-design)
- [Database Schema](#database-schema)
- [Assumptions and Tradeoffs](#assumptions-and-tradeoffs)
- [Future Scope](#future-scope)
- [API Documentation](#api-documentation)
- [Deployment Guide](#deployment-guide)

## Setup Instructions
## Core Features

### Content Management
- **Content Creation**: Admin and Creator roles can create new content
- **Content Editing**: Content is editable when in DRAFT or REJECTED status
- **Content Submission**: Content can be submitted for review when ready

### Approval Workflow
- **2-Step Approval Process**: 
  - Review 1: Initial review by Reviewer 1
  - Review 2: Secondary review by Reviewer 2
- **Approval Actions**: Each reviewer can approve or reject content
- **Rejection Handling**: Rejected content becomes editable and must restart the approval process
- **Final Approval**: Once fully approved, content becomes non-editable

### Role-Based Access Control
- **Admin**: Can create and edit content
- **Creator**: Can create and edit content
- **Reviewer 1**: Can review content in REVIEW_1 status
- **Reviewer 2**: Can review content in REVIEW_2 status

## Workflow Design Decisions

### 1. Sequential Approval Process
The system implements a **sequential approval workflow** rather than parallel approval. This ensures:
- Clear responsibility at each stage
- Prevents approval conflicts
- Maintains audit trail of who approved what and when

### 2. Rejection and Resubmission Logic
When content is rejected:
- Content status changes to REJECTED
- Content becomes editable again
- Approval history is reset
- Must restart from Review 1 after resubmission

This ensures that rejected content gets proper re-evaluation rather than partial approval.

### 3. Editability Rules
- **DRAFT**: Fully editable by Admin/Creator
- **REVIEW_1**: Not editable (under review)
- **REVIEW_2**: Not editable (under review)
- **APPROVED**: Not editable (final state)
- **REJECTED**: Editable (needs updates)

### 4. Role Permissions
Each role has specific, non-overlapping responsibilities:
- **Admin/Creator**: Content creation and editing
- **Reviewers**: Only approval/rejection actions
- **No role switching during operations**: Prevents privilege escalation

## Technical Architecture

### Backend (Node.js + Express + MongoDB)

#### Workflow Validation Utility
- **Location**: `backend/src/utils/workflow.js`
- **Purpose**: Centralized business logic for all workflow operations
- **Functions**:
  - `canCreateContent()`: Validates creation permissions
  - `canSubmitForReview()`: Validates submission readiness
  - `canApprove()`: Validates approval permissions
  - `canReject()`: Validates rejection permissions
  - `canEdit()`: Validates edit permissions
  - `updateWorkflowState()`: Handles state transitions
  - `getAvailableActions()`: Returns possible actions for user

#### Database Schema
```javascript
// Content Model
{
  title: String,
  body: String,
  status: Enum['DRAFT', 'REVIEW_1', 'REVIEW_2', 'APPROVED', 'REJECTED'],
  createdBy: String,
  isEditable: Boolean,
  rejectionReason: String,
  approvedBy: [{ role: String, timestamp: Date }],
  createdAt: Date,
  updatedAt: Date
}

// Approval Log Model
{
  contentId: ObjectId,
  stage: String,
  action: String,
  comment: String,
  reviewedBy: String,
  timestamp: Date
}
```

#### API Endpoints
- `POST /api/content` - Create content
- `GET /api/content` - Get all content
- `GET /api/content/:id` - Get specific content
- `PUT /api/content/:id` - Update content
- `POST /api/content/:id/submit` - Submit for review
- `POST /api/content/:id/approve` - Approve content
- `POST /api/content/:id/reject` - Reject content
- `GET /api/content/:id/actions` - Get available actions

### Frontend (React + TypeScript + Tailwind CSS)

#### Components
- **WorkflowProgress**: Visual workflow status indicator
- **Role Switcher**: Mock role switching for testing
- **Content Form**: Create/edit content interface
- **Content List**: Display all content with actions
- **Rejection Modal**: Comment input for rejection reasons

#### State Management
- Local React state for UI components
- Axios for API communication
- TypeScript interfaces for type safety

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your MongoDB URI and port
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/content-review-system
```

## Usage Guide

### 1. Creating Content
1. Switch to Admin or Creator role
2. Fill in the content form
3. Click "Create Content"
4. Content starts in DRAFT status

### 2. Submitting for Review
1. Ensure content is in DRAFT or REJECTED status
2. Click "Submit for Review"
3. Content moves to REVIEW_1 status
4. Content becomes non-editable

### 3. Review Process
1. Switch to appropriate reviewer role
2. Review content in REVIEW_1 or REVIEW_2 status
3. Choose to Approve or Reject
4. Add rejection comments if rejecting

### 4. Handling Rejections
1. Rejected content becomes editable
2. Update content based on feedback
3. Resubmit for review (restarts from REVIEW_1)

### 5. Final Approval
1. After both reviewers approve, content becomes APPROVED
2. Content is now non-editable
3. Workflow is complete

## Edge Cases and Validation

### Invalid Actions Prevention
- **Skipping approval stages**: Not allowed to jump from REVIEW_1 to APPROVED
- **Wrong role approval**: Reviewer 1 cannot approve REVIEW_2 content
- **Editing approved content**: Not allowed once approved
- **Submitting non-editable content**: Not allowed when under review

### Error Handling
- **Permission denied**: Clear error messages for unauthorized actions
- **Invalid state transitions**: Prevented at both frontend and backend
- **Missing required fields**: Form validation before submission
- **Network errors**: Graceful fallback and retry mechanisms

## Testing the System

### Test Scenarios
1. **Happy Path**: Create content, submit, approve by both reviewers
2. **Rejection Path**: Create content, submit, reject, edit, resubmit, approve
3. **Permission Testing**: Try actions with wrong roles
4. **State Validation**: Attempt invalid state transitions

### Role Testing
- Test each role's permissions
- Verify role switching works correctly
- Ensure no privilege escalation




