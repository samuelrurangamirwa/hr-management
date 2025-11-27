import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import {
  Users,
  Search,
  UserPlus,
  Calendar,
  DollarSign,
  Briefcase,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye
} from 'lucide-react';

interface EmployeeManagementProps {
  user: User;
}

interface Employee {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    department: string;
  };
  position: string;
  hire_date: string;
  salary: string;
  phone: string;
  address: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to_name: string;
  project_name: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  manager_name: string;
  end_date: string;
}

interface PayrollRecord {
  id: number;
  period_start: string;
  period_end: string;
  net_salary: string;
  status: string;
  employee_name: string;
}

export function EmployeeManagement({ user }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department: '',
    position: '',
    salary: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [employeesRes, tasksRes, projectsRes, payrollRes] = await Promise.all([
          fetch('/api/employees/', { headers }),
          fetch('/api/tasks/', { headers }),
          fetch('/api/projects/', { headers }),
          fetch('/api/payroll/', { headers })
        ]);

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setEmployees(employeesData);
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        if (payrollRes.ok) {
          const payrollData = await payrollRes.json();
          setPayrollRecords(payrollData);
        }

      } catch (error) {
        console.error('Error fetching employee management data:', error);
        toast.error('Failed to load employee management data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First create the user
      const userData = {
        username: newEmployee.username,
        email: newEmployee.email,
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name,
        role: newEmployee.role,
        department: newEmployee.department,
        password: 'default123' // In production, this should be generated and emailed
      };

      const userResponse = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (userResponse.ok) {
        const userResult = await userResponse.json();

        // Use the token from the current logged-in user to create employee profile
        const currentToken = localStorage.getItem('token');

        // Then create the employee profile
        const employeeData = {
          user: userResult.user.id,
          position: newEmployee.position,
          salary: parseFloat(newEmployee.salary),
          phone: newEmployee.phone,
          address: newEmployee.address
        };

        const employeeResponse = await fetch('/api/employees/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          body: JSON.stringify(employeeData),
        });

        if (employeeResponse.ok) {
          toast.success('Employee added successfully!');
          setIsAddEmployeeOpen(false);
          setNewEmployee({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            role: 'employee',
            department: '',
            position: '',
            salary: '',
            phone: '',
            address: ''
          });
          // Refresh employees list
          const employeesRes = await fetch('/api/employees/', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          if (employeesRes.ok) {
            setEmployees(await employeesRes.json());
          }
        } else {
          const errorData = await employeeResponse.json();
          toast.error(`Failed to create employee profile: ${errorData.detail || 'Unknown error'}`);
        }
      } else {
        const errorData = await userResponse.json();
        toast.error(`Failed to create user account: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const getEmployeeStats = (employeeId: number) => {
    const employeeTasks = tasks.filter(t => t.assigned_to === employeeId);
    const completedTasks = employeeTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = employeeTasks.filter(t => t.status !== 'completed').length;
    const employeePayroll = payrollRecords.filter(p => p.employee === employeeId);

    return {
      totalTasks: employeeTasks.length,
      completedTasks,
      pendingTasks,
      totalPayroll: employeePayroll.length,
      latestPayroll: employeePayroll[0] || null
    };
  };

  const filteredEmployees = employees.filter(employee =>
    employee.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Employees', value: employees.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length.toString(), icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Tasks', value: tasks.filter(t => t.status !== 'completed').length.toString(), icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Monthly Payroll', value: `$${payrollRecords.reduce((sum, p) => sum + parseFloat(p.net_salary), 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return <div className="p-8">Loading employee management data...</div>;
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access Employee Management features.
          </p>
          <p className="text-sm text-gray-500">
            Please login first to manage employees, view their activities, and handle payroll.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Employee Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive employee oversight and management</p>
        </div>
        <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newEmployee.address}
                  onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full">Add Employee</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="tasks">Task Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Employees</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEmployees.map(employee => {
                  const stats = getEmployeeStats(employee.id);
                  return (
                    <div key={employee.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600">{employee.user.first_name.charAt(0)}{employee.user.last_name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{employee.user.first_name} {employee.user.last_name}</p>
                              <p className="text-sm text-gray-600">{employee.position}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500">Department</p>
                              <p>{employee.user.department}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Hire Date</p>
                              <p>{new Date(employee.hire_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Salary</p>
                              <p>${parseFloat(employee.salary).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Tasks</p>
                              <p>{stats.completedTasks}/{stats.totalTasks} completed</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            employee.user.role === 'admin' ? 'bg-red-100 text-red-700' :
                            employee.user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {employee.user.role}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsEmployeeDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.slice(0, 10).map(task => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">Assigned to: {task.assigned_to_name}</p>
                        <p className="text-sm text-gray-600">Project: {task.project_name || 'No Project'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {task.priority}
                        </Badge>
                        <Badge className={
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-600">Manager: {project.manager_name}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRecords.slice(0, 10).map(record => (
                  <div key={record.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{record.employee_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${parseFloat(record.net_salary).toLocaleString()}</span>
                        <Badge className={
                          record.status === 'paid' ? 'bg-green-100 text-green-700' :
                          record.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Details Dialog */}
      <Dialog open={isEmployeeDetailsOpen} onOpenChange={setIsEmployeeDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Employee Details - {selectedEmployee?.user.first_name} {selectedEmployee?.user.last_name}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedEmployee.user.first_name} {selectedEmployee.user.last_name}</p>
                    <p><strong>Email:</strong> {selectedEmployee.user.email}</p>
                    <p><strong>Phone:</strong> {selectedEmployee.phone || 'Not provided'}</p>
                    <p><strong>Address:</strong> {selectedEmployee.address || 'Not provided'}</p>
                    <p><strong>Role:</strong> {selectedEmployee.user.role}</p>
                    <p><strong>Department:</strong> {selectedEmployee.user.department}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Employment Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Position:</strong> {selectedEmployee.position}</p>
                    <p><strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
                    <p><strong>Salary:</strong> ${parseFloat(selectedEmployee.salary).toLocaleString()}</p>
                    <p><strong>Employee ID:</strong> {selectedEmployee.id}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Performance Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{getEmployeeStats(selectedEmployee.id).totalTasks}</p>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{getEmployeeStats(selectedEmployee.id).completedTasks}</p>
                    <p className="text-sm text-gray-600">Completed Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{getEmployeeStats(selectedEmployee.id).pendingTasks}</p>
                    <p className="text-sm text-gray-600">Pending Tasks</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}