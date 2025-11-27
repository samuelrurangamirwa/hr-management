
# Advanced HR System

A comprehensive Human Resource Management System built with Django REST Framework (backend) and React with TypeScript (frontend). This system provides complete HR functionality including employee management, payroll, recruitment, attendance tracking, and more.

## Features

### Core HR Modules
- **Dashboard** - Real-time analytics and key metrics
- **Employee Management** - Complete employee lifecycle management
- **Payroll System** - Automated salary processing and payslips
- **Recruitment** - Job posting, candidate management, and hiring workflow
- **Attendance Tracking** - Clock in/out, attendance reports
- **Benefits Management** - Employee benefits enrollment and tracking
- **Performance Reviews** - Employee evaluations and KPI tracking
- **Training Management** - Course catalog and employee training
- **Expense Management** - Expense claims and approvals
- **Project Management** - Team assignments and project tracking
- **Task Management** - Task assignment and progress tracking
- **Tax & Budget Management** - Tax calculations and budget allocation

### User Roles & Permissions
- **Admin** - Full system access, manage all employees, process payroll
- **Manager** - Team management, approve expenses, view team data
- **Employee** - Personal data access, submit expenses, view payslips

## 🛠 Technology Stack

### Backend
- **Django 5.2.8** - Web framework
- **Django REST Framework** - API development
- **Django Simple JWT** - Authentication
- **SQLite** - Database (development)
- **CORS Headers** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

## Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **npm or yarn**

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd advanced-hr-system
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

#### Database Setup
```bash
cd /path/to/project
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser (Admin)
```bash
python manage.py createsuperuser --username admin --email admin@company.com
# Password: admin123 (or set your own)
```

#### Seed Demo Data
```bash
python manage.py seed_data
```

#### Start Backend Server
```bash
python manage.py runserver 8000
```

### 3. Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## User Credentials

### Default Test Accounts

| Role | Username | Email | Password | Permissions |
|------|----------|-------|----------|-------------|
| **Admin** | admin | admin@company.com | admin123 | Full system access |
| **Manager** | manager | manager@company.com | manager123 | Team management |
| **Employee** | employee | employee@company.com | employee123 | Personal access |

### Demo Employees (Created by seed_data)
- **John Doe** - Software Engineer (Employee)
- **Jane Smith** - Marketing Manager (Manager)

## Usage Guide

### Getting Started
1. **Login** with any of the test accounts above
2. **Explore Dashboard** - View system overview and key metrics
3. **Navigate Modules** - Use sidebar to access different HR functions

### Key Workflows

#### Employee Onboarding
1. Login as **Admin** or **Manager**
2. Go to **Employee Management**
3. Click **"Add Employee"**
4. Fill employee details (creates user account automatically)
5. Employee can now login with default password

#### Payroll Processing
1. Login as **Admin**
2. Go to **Payroll Management**
3. View employee payroll data
4. Process payroll for selected employees
5. Employees can view their payslips

#### Recruitment Process
1. Login as **Admin/Manager**
2. Go to **Recruitment**
3. Create job postings
4. Review candidate applications
5. Move candidates through hiring stages

## API Documentation

### Authentication Endpoints
```
POST /api/auth/login/          - User login
POST /api/auth/register/       - User registration
POST /api/auth/change-password/ - Change password
PATCH /api/auth/update-profile/ - Update profile
```

### Main API Endpoints
```
GET  /api/dashboard/stats/     - Dashboard statistics
GET  /api/employees/           - Employee management
GET  /api/payroll/             - Payroll data
GET  /api/job-postings/        - Job postings
GET  /api/candidates/          - Candidate management
GET  /api/attendance/          - Attendance records
GET  /api/benefits/            - Benefits management
GET  /api/expenses/            - Expense claims
GET  /api/projects/            - Project management
GET  /api/tasks/               - Task management
GET  /api/performance-reviews/ - Performance reviews
GET  /api/courses/             - Training courses
GET  /api/enrollments/         - Course enrollments
GET  /api/tax-records/         - Tax records
GET  /api/budgets/             - Budget management
```

### Authentication
All API endpoints (except auth) require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

### Run Integration Tests
```bash
python test_integration.py
```

### Manual Testing
1. **Login Testing** - Test all user roles
2. **CRUD Operations** - Create, read, update, delete for each module
3. **Permissions** - Verify role-based access control
4. **Data Flow** - Test complete workflows (hiring → onboarding → payroll)

## Project Structure

```
advanced-hr-system/
├── hr_backend/                 # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── hr_app/                     # Main Django app
│   ├── models.py              # Database models
│   ├── views.py               # API views
│   ├── serializers.py         # Data serializers
│   ├── urls.py                # URL routing
│   ├── admin.py               # Admin interface
│   └── management/commands/   # Custom management commands
├── src/                       # React frontend
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   └── styles/                # Global styles
├── public/                    # Static assets
├── package.json               # Frontend dependencies
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Development Commands

### Backend
```bash
# Create new Django app
python manage.py startapp <app_name>

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Run development server
python manage.py runserver 8000
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Backend Deployment
1. Set `DEBUG = False` in settings.py
2. Configure production database (PostgreSQL recommended)
3. Set up proper SECRET_KEY
4. Configure ALLOWED_HOSTS
5. Set up static files serving
6. Use production WSGI server (gunicorn)

### Frontend Deployment
1. Run `npm run build`
2. Serve the `dist/` folder with any static server
3. Configure API base URL for production

### Environment Variables
```bash
# Backend
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
ALLOWED_HOSTS=yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the API documentation
- Review the integration tests
- Create an issue in the repository

## System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+