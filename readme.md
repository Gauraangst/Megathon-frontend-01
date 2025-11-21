# Chubb Claims Assessment System

A comprehensive AI-powered insurance claims processing system that combines advanced image analysis, fraud detection, and streamlined workflow management for efficient claim assessment.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+
- **Supabase account** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Megathon-frontend-01
   ```

2. **Backend Setup (Python/FastAPI)**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # macOS/Linux:
   source venv/bin/activate
   # Windows:
   # venv\Scripts\activate
   
   # Install dependencies
   pip install -r backend/requirements.txt
   
   # Start FastAPI server
   cd backend
   uvicorn api:app --reload --port 8000
   ```

3. **Frontend Setup (Next.js)**
   ```bash
   # Navigate to frontend directory (in a new terminal)
   cd claims-assessment-system
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Database Setup (Supabase)**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL scripts from `scripts/supabase-schema.sql` in the Supabase SQL Editor
   - Configure environment variables in `claims-assessment-system/.env.local`

### Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📁 Project Structure

```
Megathon-frontend-01/
├── backend/                 # Python FastAPI backend
│   ├── api.py              # Main API application
│   ├── requirements.txt    # Python dependencies
│   └── side.json          # Damage component configuration
├── claims-assessment-system/  # Next.js frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── docs/                   # Documentation
│   ├── readme.md          # Detailed documentation
│   ├── SETUP_INSTRUCTIONS.md
│   └── DEMO_USERS_SETUP.md
├── scripts/                # Database setup scripts
│   ├── supabase-schema.sql
│   ├── setup-demo-users.sql
│   └── ...
├── imgsss/                 # Base car images
├── uploads/                # User uploaded files
├── heatmap/                # Generated heatmap images
└── README.md              # This file
```

## 🎯 Key Features

- **Multi-Role Authentication** (Claimant, Assessor, Admin)
- **AI-Powered Damage Assessment** with computer vision
- **Fraud Detection** with authenticity scoring
- **Real-time Image Analysis** with severity scoring
- **3D Vehicle Damage Visualization** with heatmap overlays
- **Status Tracking** with comprehensive audit trails

## 📚 Documentation

For detailed documentation, please see:
- [Complete Documentation](docs/readme.md)
- [Setup Instructions](docs/SETUP_INSTRUCTIONS.md)
- [Demo Users Setup](docs/DEMO_USERS_SETUP.md)

## 🛠 Tech Stack

### Frontend
- Next.js 15 with TypeScript
- Tailwind CSS
- Supabase for authentication & database

### Backend
- FastAPI with Python 3.9+
- OpenRouter API for AI analysis
- PostgreSQL (Supabase)

## 📝 License

This project is developed for the Megathon competition. See [LICENCE.MD](LICENCE.MD) for details.

## 🤝 Contributing

This is a Megathon competition project. For contributions or questions, please contact the development team.

---

**🏆 Built for Megathon 2025 - Chubb Claims Assessment System**

