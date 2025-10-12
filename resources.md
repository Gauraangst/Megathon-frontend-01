# Resources and Dependencies - Chubb Claims Assessment System

This document provides a comprehensive list of all resources, APIs, AI models, libraries, and technologies used in the Chubb Claims Assessment System.

## AI Models and APIs

### OpenRouter API
- **Service**: OpenRouter AI Platform
- **Models Used**: 
  - `mistralai/mistral-small-3.2-24b-instruct:free` - Primary model for image analysis
  - GPT-4 Vision (via OpenRouter) - For advanced image understanding
- **Purpose**: 
  - Vehicle damage assessment
  - Fraud detection analysis
  - Image authenticity verification
  - Damage severity scoring
- **API Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Authentication**: Bearer token authentication
- **Usage**: Real-time image analysis for claim processing

### Computer Vision Libraries
- **OpenCV (cv2)**: Image processing and manipulation
  - Image preprocessing and sharpening
  - Contour detection for vehicle outline identification
  - Gradient damage visualization
  - Heatmap generation
- **NumPy**: Numerical computing for image arrays
- **Base64 Encoding**: Image data transmission

## Backend Technologies

### Core Framework
- **FastAPI**: Python web framework for building APIs
  - Version: Latest stable
  - Features: Automatic API documentation, type hints, async support
- **Uvicorn**: ASGI server for FastAPI deployment
- **Python**: Version 3.9+

### Image Processing
- **OpenCV**: Computer vision library
  - Image filtering and enhancement
  - Contour detection and analysis
  - Gradient circle rendering
  - Image blending and overlay
- **PIL/Pillow**: Python Imaging Library (if used)
- **NumPy**: Array operations for image data

### API Integration
- **Requests**: HTTP library for API calls
- **JSON**: Data serialization and parsing
- **Multipart**: File upload handling

### File Management
- **Tempfile**: Temporary file creation
- **OS**: File system operations
- **Pathlib**: Path manipulation

## Frontend Technologies

### Core Framework
- **Next.js**: Version 15.1.0
  - App Router architecture
  - Server-side rendering
  - API routes
- **React**: Version 18.2.0
- **TypeScript**: Version 5.x

### UI and Styling
- **Tailwind CSS**: Version 4.x
  - Utility-first CSS framework
  - Responsive design
  - Custom component styling
- **Headless UI**: Version 2.2.9
  - Unstyled, accessible UI components
- **Lucide React**: Version 0.545.0
  - Icon library with 1000+ icons

### State Management
- **React Context API**: Built-in state management
- **Custom Hooks**: Reusable state logic
- **Local Storage**: Client-side data persistence

### Utility Libraries
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging utility

## Database and Authentication

### Database
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Auto-generated APIs
- **PostgreSQL**: Primary database engine

### Authentication
- **Supabase Auth**: Authentication service
  - Email/password authentication
  - Role-based access control
  - Session management
  - User profile management

### Storage
- **Supabase Storage**: File storage service
  - Image upload and retrieval
  - Secure file access
  - CDN integration

## Development Tools

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
  - Version: 9.x
  - Configuration: Next.js recommended rules
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (if configured)

### Build Tools
- **Next.js Build System**: Integrated build pipeline
- **Webpack**: Module bundling (via Next.js)
- **Babel**: JavaScript compilation (via Next.js)

## External Services

### Cloud Services
- **Supabase Cloud**: 
  - Database hosting
  - Authentication services
  - File storage
  - Real-time features
- **Vercel** (if deployed): Frontend hosting platform

### API Services
- **OpenRouter API**: AI model access
  - Multiple model providers
  - Unified API interface
  - Cost-effective AI access

## Development Environment

### Node.js Ecosystem
- **Node.js**: Version 18+
- **npm**: Package manager
- **Package.json**: Dependency management

### Python Environment
- **Python**: Version 3.9+
- **pip**: Package installer
- **Virtual Environment**: Isolated Python environment
- **requirements.txt**: Python dependencies

### Development Servers
- **Next.js Dev Server**: `npm run dev` (Port 3000)
- **FastAPI Dev Server**: `uvicorn api:app --reload` (Port 8000)

## File Structure and Assets

### Image Assets
- **Base Car Images**: 
  - `./imgsss/side.png` - Side view car image
  - `./imgsss/side_filled.JPG` - Alternative side view
  - `./imgsss/front.png` - Front view car image
  - `./imgsss/rear.png` - Rear view car image
  - `./imgsss/top.png` - Top view car image

### Generated Assets
- **Heatmap Images**: `./heatmap/` directory
- **Damage Overlays**: `./temp_damage_output/` directory
- **Uploaded Files**: `./uploads/` directory

### Configuration Files
- **JSON Configuration**: `./side.json` - Damage component definitions
- **Environment Variables**: `.env.local` - Supabase configuration
- **Database Schema**: `supabase-schema.sql` - Database structure

## API Endpoints

### Backend API (FastAPI)
- **POST /explain**: Image analysis endpoint
- **POST /upload**: File upload processing
- **POST /render-damage-impact**: Damage visualization generation
- **GET /admin/damage-components**: Admin damage components
- **GET /health**: API health check
- **GET /docs**: Interactive API documentation

### Frontend API Routes
- **Next.js API Routes**: Server-side API endpoints
- **Supabase Client**: Database and authentication calls

## Security and Authentication

### Security Measures
- **CORS Configuration**: Cross-origin request handling
- **API Key Management**: Secure API key storage
- **File Upload Security**: Type validation and size limits
- **Authentication Guards**: Protected route access

### Data Protection
- **Row Level Security**: Database-level access control
- **Encrypted Storage**: Secure file storage
- **Session Management**: Secure user sessions

## Performance and Optimization

### Frontend Optimization
- **Next.js Optimization**: Built-in performance features
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting
- **Static Generation**: Pre-rendered pages

### Backend Optimization
- **Async Processing**: Non-blocking operations
- **Caching**: Response caching strategies
- **Database Optimization**: Efficient queries

## Monitoring and Logging

### Development Tools
- **Console Logging**: Browser and server logging
- **Error Handling**: Comprehensive error management
- **Debug Tools**: Development debugging utilities

### Production Monitoring
- **Health Checks**: API health monitoring
- **Error Tracking**: Error reporting and tracking
- **Performance Metrics**: System performance monitoring

## Deployment and Infrastructure

### Development Environment
- **Local Development**: Local server setup
- **Hot Reloading**: Development server with hot reload
- **Environment Variables**: Configuration management

### Production Considerations
- **Containerization**: Docker support (if implemented)
- **Cloud Deployment**: Cloud platform compatibility
- **Scalability**: Horizontal and vertical scaling support

## Dependencies Summary

### Python Dependencies (requirements.txt)
```
fastapi
uvicorn
requests
python-multipart
opencv-python
numpy
```

### Node.js Dependencies (package.json)
```json
{
  "dependencies": {
    "@headlessui/react": "^2.2.9",
    "@supabase/supabase-js": "^2.75.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.545.0",
    "next": "15.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## Cost Analysis

### AI API Costs
- **OpenRouter API**: Pay-per-use model
- **Model Costs**: Varies by model and usage
- **Free Tier**: Available for development

### Infrastructure Costs
- **Supabase**: Free tier available, paid plans for production
- **Hosting**: Vercel free tier, paid plans for custom domains
- **Storage**: Included in Supabase plans

## Future Enhancements

### Planned Integrations
- **Additional AI Models**: GPT-4, Claude, Gemini integration
- **Advanced Analytics**: Business intelligence dashboards
- **Mobile App**: React Native mobile application
- **Third-party Integrations**: Insurance company APIs

### Scalability Considerations
- **Microservices Architecture**: Service decomposition
- **Load Balancing**: Traffic distribution
- **Database Scaling**: Read replicas and sharding
- **CDN Integration**: Global content delivery

---

**Special Mention**: Cursor and Windsurf
**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained By**: 4fabs
