import { useState } from 'react';
import { User, UserRole } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Shield, User as UserIcon, Bell, Lock } from 'lucide-react';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

interface SettingsProps {
  user: User;
  setUser: (user: User) => void;
}

export function Settings({ user, setUser }: SettingsProps) {
  const roles: UserRole[] = ['admin', 'manager', 'employee'];
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleRoleChange = (newRole: UserRole) => {
    setUser({ ...user, role: newRole });
    toast.success(`Role changed to ${newRole}`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profileForm.name.split(' ')[0],
          last_name: profileForm.name.split(' ').slice(1).join(' '),
          email: profileForm.email,
          department: profileForm.department,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({
          ...user,
          name: profileForm.name,
          email: profileForm.email,
          department: profileForm.department,
        });
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update profile: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.new,
        }),
      });

      if (response.ok) {
        setPasswordForm({ current: '', new: '', confirm: '' });
        toast.success('Password updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update password: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const permissions = {
    admin: [
      'Full system access',
      'Manage all employees',
      'Process payroll',
      'Access tax & budget',
      'Approve expenses',
      'Manage recruitment',
      'View all analytics',
      'System configuration'
    ],
    manager: [
      'View team data',
      'Manage team members',
      'View payroll (team only)',
      'Approve team expenses',
      'Manage team recruitment',
      'View team performance',
      'Assign tasks'
    ],
    employee: [
      'View own data',
      'Clock in/out',
      'View own payslips',
      'Submit expenses',
      'View assigned tasks',
      'Enroll in training',
      'View own performance'
    ]
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and role-based permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Role</p>
                <p className="capitalize">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p>{user.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Access Level</p>
                <p>Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="role">Role & Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">{user.name.charAt(0)}</span>
                </div>
                <Button variant="outline" onClick={() => toast.info('Photo upload coming soon')}>Change Photo</Button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+1 234-567-8900"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setProfileForm({ name: user.name, email: user.email, department: user.department, phone: '' })}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Switch Role (Demo)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Switch between different roles to see how the system adapts based on permissions.
                </p>
                <div className="flex gap-2">
                  {roles.map(role => (
                    <Button
                      key={role}
                      variant={user.role === role ? 'default' : 'outline'}
                      onClick={() => handleRoleChange(role)}
                      className="capitalize"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {roles.map(role => (
                    <div key={role} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="capitalize">{role}</h3>
                        {user.role === role && (
                          <Badge className="bg-blue-100 text-blue-700">Current</Badge>
                        )}
                      </div>
                      <ul className="space-y-2 text-sm">
                        {permissions[role].map((permission, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="text-gray-700">{permission}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email updates for important events</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>Payroll Notifications</p>
                      <p className="text-sm text-gray-600">Get notified when payroll is processed</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>Task Assignments</p>
                      <p className="text-sm text-gray-600">Alerts when new tasks are assigned</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>Performance Reviews</p>
                      <p className="text-sm text-gray-600">Reminders for upcoming reviews</p>
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>Training Updates</p>
                      <p className="text-sm text-gray-600">New courses and certifications</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>Expense Status</p>
                      <p className="text-sm text-gray-600">Updates on expense claim approvals</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
