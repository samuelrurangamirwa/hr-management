import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../App';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return null;
  }

  if (requiredRoles && !hasPermission(requiredRoles)) {
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Access Denied</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  You don't have permission to access this resource
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your current role: <strong className="text-gray-900">{user.role}</strong>
            </p>
            <p className="text-gray-600 mt-2">
              Required roles: <strong className="text-gray-900">{requiredRoles.join(', ')}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
