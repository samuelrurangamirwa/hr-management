import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Recruitment } from './components/Recruitment';
import { Attendance } from './components/Attendance';
import { Payroll } from './components/Payroll';
import { TaxBudget } from './components/TaxBudget';
import { Benefits } from './components/Benefits';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Performance } from './components/Performance';
import { Training } from './components/Training';
import { Settings } from './components/Settings';
import { EmployeeManagement } from './components/EmployeeManagement';
import { JobApplication } from './components/JobApplication';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, isAuthenticated, updateUser } = useAuth();

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'recruitment':
        return (
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <Recruitment user={user} />
          </ProtectedRoute>
        );
      case 'attendance':
        return <Attendance user={user} />;
      case 'payroll':
        return (
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <Payroll user={user} />
          </ProtectedRoute>
        );
      case 'tax-budget':
        return (
          <ProtectedRoute requiredRoles={['admin']}>
            <TaxBudget user={user} />
          </ProtectedRoute>
        );
      case 'benefits':
        return <Benefits user={user} />;
      case 'projects':
        return <Projects user={user} />;
      case 'tasks':
        return <Tasks user={user} />;
      case 'performance':
        return (
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <Performance user={user} />
          </ProtectedRoute>
        );
      case 'training':
        return <Training user={user} />;
      case 'employee-management':
        return (
          <ProtectedRoute requiredRoles={['admin', 'manager']}>
            <EmployeeManagement user={user} />
          </ProtectedRoute>
        );
      case 'job-application':
        return <JobApplication />;
      case 'settings':
        return <Settings user={user} setUser={updateUser} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
