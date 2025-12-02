import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportingProps {
  user: User;
}

interface ReportData {
  employees: any[];
  payroll: any[];
  attendance: any[];
  performance: any[];
  leave: any[];
}

export function Reporting({ user }: ReportingProps) {
  const [reportData, setReportData] = useState<ReportData>({
    employees: [],
    payroll: [],
    attendance: [],
    performance: [],
    leave: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [employeesRes, payrollRes, attendanceRes, performanceRes, leaveRes] = await Promise.all([
        fetch('/api/employees/', { headers }),
        fetch('/api/payroll/', { headers }),
        fetch('/api/attendance/', { headers }),
        fetch('/api/performance-reviews/', { headers }),
        fetch('/api/leave-requests/', { headers })
      ]);

      const data: ReportData = {
        employees: employeesRes.ok ? await employeesRes.json() : [],
        payroll: payrollRes.ok ? await payrollRes.json() : [],
        attendance: attendanceRes.ok ? await attendanceRes.json() : [],
        performance: performanceRes.ok ? await performanceRes.json() : [],
        leave: leaveRes.ok ? await leaveRes.json() : []
      };

      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeeReport = () => {
    const totalEmployees = reportData.employees.length;
    const departmentBreakdown = reportData.employees.reduce((acc, emp) => {
      acc[emp.user.department] = (acc[emp.user.department] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEmployees,
      departmentBreakdown: Object.entries(departmentBreakdown).map(([dept, count]) => ({ department: dept, count }))
    };
  };

  const generatePayrollReport = () => {
    const totalPayroll = reportData.payroll.reduce((sum, p) => sum + parseFloat(p.net_salary), 0);
    const avgSalary = reportData.payroll.length > 0 ? totalPayroll / reportData.payroll.length : 0;
    const statusBreakdown = reportData.payroll.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPayroll,
      avgSalary,
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count }))
    };
  };

  const generateAttendanceReport = () => {
    const totalRecords = reportData.attendance.length;
    const presentCount = reportData.attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    const statusBreakdown = reportData.attendance.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRecords,
      attendanceRate,
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count }))
    };
  };

  const generatePerformanceReport = () => {
    const totalReviews = reportData.performance.length;
    const avgRating = reportData.performance.length > 0
      ? reportData.performance.reduce((sum, p) => sum + parseFloat(p.overall_rating), 0) / reportData.performance.length
      : 0;

    return {
      totalReviews,
      avgRating
    };
  };

  const generateLeaveReport = () => {
    const totalRequests = reportData.leave.length;
    const approvedRequests = reportData.leave.filter(l => l.status === 'approved').length;
    const pendingRequests = reportData.leave.filter(l => l.status === 'pending').length;

    const typeBreakdown = reportData.leave.reduce((acc, l) => {
      acc[l.leave_type] = (acc[l.leave_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRequests,
      approvedRequests,
      pendingRequests,
      typeBreakdown: Object.entries(typeBreakdown).map(([type, count]) => ({ type, count }))
    };
  };

  const exportReport = (reportType: string) => {
    let data = {};
    let filename = '';

    switch (reportType) {
      case 'employees':
        data = generateEmployeeReport();
        filename = 'employee-report.json';
        break;
      case 'payroll':
        data = generatePayrollReport();
        filename = 'payroll-report.json';
        break;
      case 'attendance':
        data = generateAttendanceReport();
        filename = 'attendance-report.json';
        break;
      case 'performance':
        data = generatePerformanceReport();
        filename = 'performance-report.json';
        break;
      case 'leave':
        data = generateLeaveReport();
        filename = 'leave-report.json';
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
  };

  const employeeReport = generateEmployeeReport();
  const payrollReport = generatePayrollReport();
  const attendanceReport = generateAttendanceReport();
  const performanceReport = generatePerformanceReport();
  const leaveReport = generateLeaveReport();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="p-8">Loading reports...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive HR insights and reporting</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="mt-2 text-2xl font-bold">{employeeReport.totalEmployees}</p>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Payroll</p>
                <p className="mt-2 text-2xl font-bold">${payrollReport.totalPayroll.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Attendance Rate</p>
                <p className="mt-2 text-2xl font-bold">{attendanceReport.attendanceRate.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Performance</p>
                <p className="mt-2 text-2xl font-bold">{performanceReport.avgRating.toFixed(1)}/5</p>
              </div>
              <div className="bg-orange-50 text-orange-600 p-3 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={employeeReport.departmentBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ department, count }) => `${department}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {employeeReport.departmentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={payrollReport.statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Report</CardTitle>
              <Button onClick={() => exportReport('employees')} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{employeeReport.totalEmployees}</p>
                  <p className="text-gray-600">Total Employees</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{Object.keys(employeeReport.departmentBreakdown).length}</p>
                  <p className="text-gray-600">Departments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {employeeReport.departmentBreakdown.length > 0
                      ? (employeeReport.totalEmployees / employeeReport.departmentBreakdown.length).toFixed(1)
                      : '0'}
                  </p>
                  <p className="text-gray-600">Avg per Department</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-4">Department Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeReport.departmentBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll Report</CardTitle>
              <Button onClick={() => exportReport('payroll')} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">${payrollReport.totalPayroll.toLocaleString()}</p>
                  <p className="text-gray-600">Total Payroll</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">${payrollReport.avgSalary.toFixed(2)}</p>
                  <p className="text-gray-600">Average Salary</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{reportData.payroll.length}</p>
                  <p className="text-gray-600">Payroll Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance Report</CardTitle>
              <Button onClick={() => exportReport('attendance')} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{attendanceReport.attendanceRate.toFixed(1)}%</p>
                  <p className="text-gray-600">Attendance Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{attendanceReport.totalRecords}</p>
                  <p className="text-gray-600">Total Records</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {attendanceReport.totalRecords > 0 ? Math.round(attendanceReport.totalRecords / 30) : 0}
                  </p>
                  <p className="text-gray-600">Avg per Day</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance Report</CardTitle>
              <Button onClick={() => exportReport('performance')} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{performanceReport.totalReviews}</p>
                  <p className="text-gray-600">Total Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{performanceReport.avgRating.toFixed(1)}/5</p>
                  <p className="text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Leave Report</CardTitle>
              <Button onClick={() => exportReport('leave')} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{leaveReport.totalRequests}</p>
                  <p className="text-gray-600">Total Requests</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{leaveReport.approvedRequests}</p>
                  <p className="text-gray-600">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{leaveReport.pendingRequests}</p>
                  <p className="text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {leaveReport.totalRequests > 0 ? ((leaveReport.approvedRequests / leaveReport.totalRequests) * 100).toFixed(1) : '0'}%
                  </p>
                  <p className="text-gray-600">Approval Rate</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-4">Leave Types Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leaveReport.typeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}