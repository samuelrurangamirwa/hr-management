import {
  LayoutDashboard,
  UserPlus,
  Fingerprint,
  DollarSign,
  Calculator,
  Gift,
  Briefcase,
  CheckSquare,
  TrendingUp,
  GraduationCap,
  Settings as SettingsIcon,
  Users,
  FileText,
  LogOut,
  Calendar,
  BarChart3
} from 'lucide-react';
import { User } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User;
}

export function Sidebar({ currentView, setCurrentView, user }: SidebarProps) {
  const { logout } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus, roles: ['admin', 'manager'] },
    { id: 'employee-management', label: 'Employee Management', icon: Users, roles: ['admin', 'manager'] },
    { id: 'attendance', label: 'Attendance', icon: Fingerprint, roles: ['admin', 'manager', 'employee'] },
    { id: 'leave-management', label: 'Leave Management', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, roles: ['admin', 'manager'] },
    { id: 'salary-calculator', label: 'Salary Calculator', icon: Calculator, roles: ['admin', 'manager'] },
    { id: 'tax-budget', label: 'Tax & Budget', icon: Calculator, roles: ['admin'] },
    { id: 'benefits', label: 'Benefits & Expenses', icon: Gift, roles: ['admin', 'manager', 'employee'] },
    { id: 'projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'manager', 'employee'] },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
    { id: 'performance', label: 'Performance', icon: TrendingUp, roles: ['admin', 'manager'] },
    { id: 'training', label: 'Training', icon: GraduationCap, roles: ['admin', 'manager', 'employee'] },
    { id: 'reporting', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'job-application', label: 'Apply for Jobs', icon: FileText, roles: ['admin', 'manager', 'employee'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['admin', 'manager', 'employee'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">HR System</h1>
        <p className="text-gray-500 text-sm mt-1">{user.name}</p>
        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
