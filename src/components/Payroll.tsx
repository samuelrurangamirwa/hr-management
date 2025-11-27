import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DollarSign, Download, Send, TrendingUp, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';

interface PayrollProps {
  user: User;
}

export function Payroll({ user }: PayrollProps) {
  const [selectedMonth, setSelectedMonth] = useState('2024-06');
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // For admin/manager: get all payroll data
        // For employee: get only their own payroll data
        const payrollResponse = await fetch('/api/payroll/', { headers });

        if (payrollResponse.ok) {
          const payroll = await payrollResponse.json();
          setPayrollData(payroll);

          // For "My Payslips" tab, filter to current user's payroll if they're an employee
          if (user.role === 'employee') {
            // Find the employee record for this user
            const employeeResponse = await fetch('/api/employees/', { headers });
            if (employeeResponse.ok) {
              const employees = await employeeResponse.json();
              const currentEmployee = employees.find((emp: any) => emp.user.id === user.id);
              if (currentEmployee) {
                const userPayrolls = payroll.filter((p: any) => p.employee === currentEmployee.id);
                setPayslips(userPayrolls.slice(0, 10));
              } else {
                setPayslips([]);
              }
            }
          } else {
            // For admin/manager, show recent payslips
            setPayslips(payroll.slice(0, 10));
          }
        }
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        toast.error('Failed to load payroll data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [user]);

  const payrollSummary = {
    totalPayroll: payrollData.reduce((sum, p) => sum + p.net_salary, 0),
    totalEmployees: payrollData.length,
    avgSalary: payrollData.length > 0 ? payrollData.reduce((sum, p) => sum + p.net_salary, 0) / payrollData.length : 0,
    totalDeductions: payrollData.reduce((sum, p) => sum + p.deductions, 0),
    netPayroll: payrollData.reduce((sum, p) => sum + p.net_salary, 0),
  };

  const employees = payrollData.map(payroll => ({
    id: payroll.id,
    name: payroll.employee_name,
    department: payroll.department || 'Unknown',
    position: payroll.position || 'Unknown',
    baseSalary: payroll.base_salary,
    bonus: payroll.bonus,
    deductions: payroll.deductions,
    netSalary: payroll.net_salary,
    status: payroll.status
  }));

  const stats = [
    { label: 'Total Payroll', value: `$${payrollSummary.totalPayroll.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Employees', value: payrollSummary.totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Salary', value: `$${payrollSummary.avgSalary}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Deductions', value: `$${payrollSummary.totalDeductions.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      processed: { label: 'Processed', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Pending', className: 'bg-orange-100 text-orange-700' },
      paid: { label: 'Paid', className: 'bg-blue-100 text-blue-700' },
    };
    
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return <div className="p-8">Loading payroll data...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Payroll Management</h1>
          <p className="text-gray-600 mt-2">Automated payroll processing and salary management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => toast.success('Payroll report exported successfully!')}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button 
            className="gap-2"
            onClick={() => toast.success('Payroll processing initiated for all employees')}
          >
            <Send className="w-4 h-4" />
            Process Payroll
          </Button>
        </div>
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Payroll Overview</TabsTrigger>
          <TabsTrigger value="payslips">My Payslips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employee Payroll - June 2024</CardTitle>
                <Input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Employee</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Base Salary</th>
                      <th className="text-left py-3 px-4">Bonus</th>
                      <th className="text-left py-3 px-4">Deductions</th>
                      <th className="text-left py-3 px-4">Net Salary</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p>{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{employee.department}</td>
                        <td className="py-3 px-4">${employee.baseSalary.toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-600">+${employee.bonus.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-600">-${employee.deductions.toLocaleString()}</td>
                        <td className="py-3 px-4">${employee.netSalary.toLocaleString()}</td>
                        <td className="py-3 px-4">{getStatusBadge(employee.status)}</td>
                        <td className="py-3 px-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Payslip - {employee.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Employee Name</Label>
                                    <p className="mt-1">{employee.name}</p>
                                  </div>
                                  <div>
                                    <Label>Position</Label>
                                    <p className="mt-1">{employee.position}</p>
                                  </div>
                                  <div>
                                    <Label>Department</Label>
                                    <p className="mt-1">{employee.department}</p>
                                  </div>
                                  <div>
                                    <Label>Pay Period</Label>
                                    <p className="mt-1">June 2024</p>
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                  <h3 className="mb-4">Earnings</h3>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Base Salary</span>
                                      <span>${employee.baseSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Performance Bonus</span>
                                      <span className="text-green-600">+${employee.bonus.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t">
                                      <span>Gross Salary</span>
                                      <span>${(employee.baseSalary + employee.bonus).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                  <h3 className="mb-4">Deductions</h3>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Tax (15%)</span>
                                      <span className="text-red-600">-${(employee.deductions * 0.6).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Insurance</span>
                                      <span className="text-red-600">-${(employee.deductions * 0.25).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Retirement Fund</span>
                                      <span className="text-red-600">-${(employee.deductions * 0.15).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t">
                                      <span>Total Deductions</span>
                                      <span className="text-red-600">-${employee.deductions.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t-2 border-gray-300 pt-4">
                                  <div className="flex justify-between">
                                    <span>Net Salary</span>
                                    <span className="text-green-600">${employee.netSalary.toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    className="flex-1"
                                    onClick={() => toast.success(`Payslip downloaded for ${employee.name}`)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => toast.success(`Payslip emailed to ${employee.name}`)}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Email Payslip
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips">
          <Card>
            <CardHeader>
              <CardTitle>My Payslips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payslips.map((payslip, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p>{payslip.employee_name}</p>
                        <p className="text-sm text-gray-600 mt-1">Period: {new Date(payslip.period_start).toLocaleDateString()} - {new Date(payslip.period_end).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p>${payslip.net_salary.toLocaleString()}</p>
                        {getStatusBadge(payslip.status)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Downloading payslip for ${payslip.employee_name}`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info(`Viewing details for ${payslip.employee_name}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
