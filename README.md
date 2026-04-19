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

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- Git

### Local Development Setup

1. **Clone the Repository**
```bash
git clone https://github.com/shalini0002/RedoQAssignment.git
cd RedoQAssignment
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/content-review
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5001
```

## Architecture Overview

### System Architecture
```
Frontend (React + TypeScript)
    |
    | HTTP/HTTPS
    v
Backend (Node.js + Express + MongoDB)
    |
    | Mongoose ODM
    v
Database (MongoDB)
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Deployment**: Netlify (Frontend), Render (Backend)

### Component Structure
```
frontend/src/
|-- api/
|   |-- content.ts          # API layer
|-- components/
|   |-- ContentForm.tsx     # Content creation/editing
|   |-- ContentList.tsx      # Content display
|   |-- RejectionModal.tsx   # Rejection reason modal
|-- App.tsx                  # Main application component
```

### Backend Structure
```
backend/src/
|-- controllers/
|   |-- content.controller.js  # Business logic
|-- models/
|   |-- content.model.js       # Content schema
|   |-- approval.model.js      # Approval log schema
|-- routes/
|   |-- content.routes.js      # API routes
|-- utils/
|   |-- workflow.js            # Workflow validation logic
|-- server.js                   # Express server
```

## Workflow Design

### User Roles
- **ADMIN**: Full access, can approve any content
- **CREATOR**: Can create and edit content
- **REVIEWER_1**: First stage reviewer
- **REVIEWER_2**: Second stage reviewer

### Content States
```
DRAFT -> REVIEW_1 -> REVIEW_2 -> APPROVED
                |          |
                v          v
             REJECTED   REJECTED
```

### State Transitions
- **DRAFT**: Created by Creator/Admin
- **REVIEW_1**: Submitted by Creator/Admin, reviewed by Reviewer 1
- **REVIEW_2**: Approved by Reviewer 1, reviewed by Reviewer 2
- **APPROVED**: Final approved state
- **REJECTED**: Can be edited and resubmitted

### Permission Matrix
| Role | Create | Edit | Submit | Review 1 | Review 2 | Approve |
|------|--------|------|--------|----------|----------|---------|
| ADMIN | Yes | Yes | Yes | Yes | Yes | Yes |
| CREATOR | Yes | Yes | Yes | No | No | No |
| REVIEWER_1 | No | No | No | Yes | No | No |
| REVIEWER_2 | No | No | No | No | Yes | No |

## Database Schema

### Content Collection
```javascript
{
  _id: ObjectId,
  title: String,           // Content title
  body: String,            // Content body
  status: String,          // DRAFT | REVIEW_1 | REVIEW_2 | APPROVED | REJECTED
  createdBy: String,      // User role who created
  isEditable: Boolean,     // Edit permission flag
  rejectionReason: String, // Reason for rejection
  approvedBy: [{           // Approval history
    role: String,
    timestamp: Date,
    _id: ObjectId
  }],
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}
```

### Approval Logs Collection
```javascript
{
  _id: ObjectId,
  contentId: ObjectId,    // Reference to content
  action: String,         // APPROVE | REJECT | SUBMIT
  performedBy: String,    // User role
  timestamp: Date,
  comment: String,        // Optional comment
  metadata: Object        // Additional data
}
```

### ER Diagram
```
[Content] 1--* [ApprovalLogs]
  - _id
  - title
  - body
  - status
  - createdBy
  - isEditable
  - rejectionReason
  - approvedBy[]
  - createdAt
  - updatedAt
  
[ApprovalLogs]
  - _id
  - contentId (FK)
  - action
  - performedBy
  - timestamp
  - comment
  - metadata
```

## Assumptions and Tradeoffs

### Assumptions
1. **Role-based System**: Users select roles manually rather than authentication
2. **Sequential Review**: Content must pass through Reviewer 1 before Reviewer 2
3. **Single MongoDB Instance**: No sharding or replication considered
4. **Simple State Management**: No complex workflow engines or BPM systems
5. **Client-side Validation**: Frontend handles UI validation, backend enforces rules

### Tradeoffs
1. **Simplicity vs Features**: Chose simple workflow over complex branching logic
2. **Performance vs Scalability**: Optimized for small teams, not enterprise scale
3. **Security vs Usability**: Role selection instead of full authentication system
4. **Real-time vs Batch**: No real-time notifications, manual refresh required
5. **Database Choice**: MongoDB chosen for flexibility over SQL consistency

### Limitations
- No user authentication system
- No real-time notifications
- Limited concurrent user handling
- No audit trail beyond approval logs
- No file attachment support

## Future Scope

### Phase 2 Enhancements
1. **Authentication System**
   - JWT-based user authentication
   - Role-based access control (RBAC)
   - User profile management

2. **Advanced Workflow Features**
   - Parallel review processes
   - Conditional routing based on content type
   - Delegation and escalation rules
   - Workflow templates

3. **Real-time Features**
   - WebSocket notifications
   - Live status updates
   - Collaborative editing
   - Activity feeds

4. **Content Management**
   - File attachments (images, documents)
   - Rich text editor
   - Version control for content
   - Content templates

### Phase 3 Enterprise Features
1. **Scalability**
   - Database sharding
   - Load balancing
   - Caching layer (Redis)
   - CDN integration

2. **Analytics & Reporting**
   - Approval time metrics
   - User performance analytics
   - Workflow bottleneck analysis
   - Custom reports and dashboards

3. **Integrations**
   - Third-party authentication (OAuth, SAML)
   - Email notification system
   - Slack/Teams integration
   - API for external systems

4. **Security & Compliance**
   - Audit logging
   - Data encryption
   - Compliance reporting
   - Backup and disaster recovery

## API Documentation

### Endpoints

#### Content Management
- `GET /api/content` - Fetch all content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `POST /api/content/:id/submit` - Submit for review
- `POST /api/content/:id/approve` - Approve content
- `POST /api/content/:id/reject` - Reject content
- `GET /api/content/:id` - Get content by ID

#### Request/Response Examples

**Create Content**
```javascript
POST /api/content
{
  "title": "Sample Content",
  "body": "Content description",
  "role": "CREATOR"
}

Response:
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "title": "Sample Content",
  "body": "Content description",
  "status": "DRAFT",
  "createdBy": "CREATOR",
  "isEditable": true,
  "approvedBy": [],
  "createdAt": "2023-09-06T12:00:00.000Z",
  "updatedAt": "2023-09-06T12:00:00.000Z"
}
```

## Deployment Guide

### Production Deployment

**Frontend (Netlify)**
1. Build the application: `npm run build`
2. Deploy `dist` folder to Netlify
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`

**Backend (Render)**
1. Connect GitHub repository to Render
2. Set root directory: `backend`
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Configure environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=your-mongodb-connection-string`
   - `FRONTEND_URL=https://your-frontend.netlify.app`

### Monitoring and Maintenance
- Monitor backend logs in Render dashboard
- Check frontend build logs in Netlify
- Set up error tracking (Sentry, etc.)
- Regular database backups
- Performance monitoring

## Testing

### Test Coverage
- Unit tests for workflow logic
- Integration tests for API endpoints
- E2E tests for user workflows
- Performance testing for load handling

### Test Scenarios
1. **Happy Path**: Create content, submit, approve by both reviewers
2. **Rejection Path**: Create content, submit, reject, edit, resubmit, approve
3. **Permission Testing**: Try actions with wrong roles
4. **State Validation**: Attempt invalid state transitions
5. **Concurrent Users**: Multiple users working simultaneously

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

## License

MIT License - feel free to use this system as a reference for your own content approval workflows.

---

**Note**: This system was developed as a demonstration of workflow management and role-based permissions. For production use, consider implementing proper authentication, security measures, and scalability features.
