import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
}

interface DashboardData {
  stats: {
    total_employees: number;
    active_projects: number;
    pending_tasks: number;
    monthly_payroll: number;
    attendance_rate: number;
  };
  activities: Array<{
    type: string;
    message: string;
    time: string;
  }>;
}

export function Dashboard({ user }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/dashboard/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const stats = dashboardData ? [
    { label: 'Total Employees', value: dashboardData.stats.total_employees.toString(), change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: dashboardData.stats.active_projects.toString(), change: '+5%', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Tasks', value: dashboardData.stats.pending_tasks.toString(), change: '-2%', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Payroll', value: `$${dashboardData.stats.monthly_payroll.toLocaleString()}`, change: '+5.3%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : [];

  const attendanceData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 91 },
    { month: 'Mar', rate: 93 },
    { month: 'Apr', rate: 94 },
    { month: 'May', rate: 95 },
    { month: 'Jun', rate: 94 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 85, color: '#3B82F6' },
    { name: 'Sales', value: 52, color: '#10B981' },
    { name: 'Marketing', value: 38, color: '#F59E0B' },
    { name: 'HR', value: 28, color: '#EF4444' },
    { name: 'Finance', value: 44, color: '#8B5CF6' },
  ];

  const payrollData = [
    { month: 'Jan', amount: 520000 },
    { month: 'Feb', amount: 525000 },
    { month: 'Mar', amount: 532000 },
    { month: 'Apr', amount: 528000 },
    { month: 'May', value: 545000 },
    { month: 'Jun', amount: 548290 },
  ];

  const recentActivities = dashboardData?.activities || [];
  const upcomingTasks = [
    { id: 1, title: 'Review Q2 Performance Reports', due: 'Today', priority: 'high' },
    { id: 2, title: 'Approve Budget Allocation', due: 'Tomorrow', priority: 'high' },
    { id: 3, title: 'Schedule Training Session', due: 'In 3 days', priority: 'medium' },
    { id: 4, title: 'Update Employee Handbook', due: 'Next week', priority: 'low' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Welcome back, {user.name}</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your organization today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="mt-2">{stat.value}</p>
                    <p className="text-green-600 text-sm mt-1">{stat.change} from last month</p>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payroll Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8B5CF6" name="Payroll Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {activity.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                  {activity.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />}
                  {activity.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
