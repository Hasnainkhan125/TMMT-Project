# Amer Dashboard Implementation

## Overview

The Amer Dashboard is a comprehensive, mobile-first platform designed for Amer officers to manage visa applications, detect fraud, issue penalties, and handle OTP verification. The implementation follows modern React patterns with TypeScript, integrates with Supabase for authentication and data management, and provides a responsive design optimized for both mobile and desktop use.

## Features

### 🎯 Core Functionality
- **Visa Application Management**: View, filter, and update application statuses
- **Document Upload**: Drag-and-drop file upload with progress tracking
- **Fraud Detection**: Monitor and manage fraud alerts
- **Penalty Management**: Issue and track penalties for violations
- **OTP Verification**: Handle OTP requests for various verification purposes
- **Role-Based Access Control**: Secure access limited to Amer officers

### 📱 Mobile-First Design
- Responsive layout that works seamlessly on all devices
- Touch-friendly interface with proper spacing and sizing
- Mobile-optimized navigation with tab-based interface
- Drawer-based modals for better mobile experience

### 🔐 Authentication & Security
- Supabase integration for user authentication
- Role-based access control (Amer officer role required)
- Secure API endpoints with proper authorization
- Session management and user profile handling

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── AmerDashboard/
│   │   ├── DocumentUploadDrawer.tsx
│   │   └── ApplicationDetailsDrawer.tsx
│   └── ui/
│       └── mobile-drawer.tsx
├── contexts/
│   └── AuthContext.tsx
├── api/
│   └── amer-api.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts
└── pages/
    └── BackOffice/
        └── AmerDashboard.tsx
```

### Key Components

#### 1. AmerDashboard.tsx
Main dashboard component with:
- Mobile and desktop responsive layouts
- Tab-based navigation for different features
- Statistics cards and fraud detection summary
- Application list with filtering and search

#### 2. DocumentUploadDrawer.tsx
Document upload functionality:
- Drag-and-drop file upload
- Multiple file support
- Progress tracking
- Document type selection
- File validation and preview

#### 3. ApplicationDetailsDrawer.tsx
Application management:
- Detailed application information
- Status updates with notes
- Document management
- Quick actions (fraud check, penalty, OTP)

#### 4. MobileDrawer.tsx
Reusable drawer component:
- Multiple positions (left, right, bottom)
- Responsive sizing
- Smooth animations
- Overlay support

#### 5. AuthContext.tsx
Authentication management:
- User session handling
- Role verification
- Profile management
- Login/logout functionality

## API Integration

### Backend Endpoints
The dashboard integrates with the following backend APIs:

- `GET /api/v1/visa/applications` - Fetch all applications
- `GET /api/v1/visa/applications/:id` - Get application details
- `PUT /api/v1/visa/applications/:id/status` - Update application status
- `PUT /api/v1/visa/applications/:id/documents` - Upload documents
- `GET /api/v1/visa/stats` - Get application statistics

### Supabase Tables
- `profiles` - User profiles with roles
- `fraud_alerts` - Fraud detection alerts
- `penalties` - Issued penalties
- `otp_requests` - OTP verification requests

## Mobile-First Design Principles

### 1. Responsive Grid System
- Uses CSS Grid with responsive breakpoints
- Mobile: 2-column grid for statistics
- Desktop: 4-column grid for better information density

### 2. Touch-Friendly Interface
- Minimum touch target size: 44px
- Proper spacing between interactive elements
- Swipe gestures for mobile navigation

### 3. Progressive Enhancement
- Core functionality works on all devices
- Enhanced features on larger screens
- Graceful degradation for older browsers

### 4. Performance Optimization
- Lazy loading for non-critical components
- Efficient state management
- Optimized re-renders with React.memo

## State Management

### Local State
- Application data and filters
- UI state (drawers, modals, tabs)
- Form inputs and validation

### Global State (Supabase)
- User authentication and profile
- Application data persistence
- Real-time updates

### API State
- Loading states
- Error handling
- Data caching

## Security Features

### Authentication
- JWT-based authentication via Supabase
- Secure session management
- Automatic token refresh

### Authorization
- Role-based access control
- Route protection
- API endpoint security

### Data Validation
- Input sanitization
- File type validation
- Size limits enforcement

## Usage Instructions

### For Amer Officers

1. **Access Dashboard**
   - Navigate to `/amer-dashboard`
   - Login with Amer officer credentials
   - Verify role permissions

2. **Manage Applications**
   - View all visa applications
   - Filter by status, type, or search query
   - Click on applications to view details
   - Update application status with notes

3. **Upload Documents**
   - Click "Upload Documents" on any application
   - Select document type and description
   - Drag and drop files or click to browse
   - Monitor upload progress

4. **Fraud Detection**
   - Monitor fraud alerts dashboard
   - Review suspicious documents
   - Update alert status and assign investigators

5. **Issue Penalties**
   - Select violation type and severity
   - Set fine amount or ban duration
   - Provide evidence and reasoning
   - Track penalty status

6. **OTP Verification**
   - Request OTP for various purposes
   - Monitor verification attempts
   - Handle expired or failed verifications

### For Developers

1. **Setup Environment**
   ```bash
   cd tammat-frontend
   npm install
   ```

2. **Configure Supabase**
   - Set environment variables for Supabase URL and keys
   - Ensure proper table structure exists

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Customization

### Theming
- Modify Tailwind CSS classes for branding
- Update color schemes in `tailwind.config.js`
- Customize component variants

### Features
- Add new dashboard tabs
- Implement additional drawer components
- Extend API integration

### Styling
- Update component styling in respective files
- Modify responsive breakpoints
- Adjust spacing and typography

## Performance Considerations

### Optimization Strategies
- Lazy loading for heavy components
- Memoization of expensive calculations
- Efficient re-rendering with React hooks
- Image optimization and compression

### Monitoring
- Performance metrics tracking
- Error boundary implementation
- Loading state management
- User experience analytics

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase configuration
   - Verify user role permissions
   - Clear browser cache and cookies

2. **API Connection Issues**
   - Verify backend server status
   - Check CORS configuration
   - Validate API endpoint URLs

3. **Mobile Display Issues**
   - Test on various device sizes
   - Check responsive breakpoints
   - Verify touch event handling

4. **File Upload Problems**
   - Check file size limits
   - Verify supported file types
   - Monitor network connectivity

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
```

## Future Enhancements

### Planned Features
- Real-time notifications
- Advanced analytics dashboard
- Bulk operations support
- Integration with external services
- Mobile app version

### Technical Improvements
- Service Worker for offline support
- Advanced caching strategies
- Performance monitoring tools
- Automated testing suite

## Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write comprehensive tests
- Document all new features

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Implement consistent naming conventions
- Add JSDoc comments for complex functions

## Support

For technical support or feature requests:
- Create an issue in the project repository
- Contact the development team
- Refer to the API documentation
- Check the troubleshooting guide

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: TAMMAT Development Team
