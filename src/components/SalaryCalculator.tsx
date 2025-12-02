import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import {
  Calculator,
  Download,
  DollarSign,
  FileText,
  Users,
  Calendar,
  Plus,
  Minus
} from 'lucide-react';

interface SalaryCalculatorProps {
  user: User;
}

interface Employee {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    department: string;
  };
  position: string;
  salary: string;
}

interface Deduction {
  id: number;
  name: string;
  amount: string;
  type: string;
  employee_name: string;
}

interface Payroll {
  id: number;
  employee: number;
  employee_name: string;
  period_start: string;
  period_end: string;
  base_salary: string;
  overtime_hours: number;
  overtime_rate: number;
  bonus: string;
  allowances: string;
  gross_salary: string;
  total_deductions: string;
  net_salary: string;
  status: string;
  deductions_breakdown: Deduction[];
}

interface SalaryCalculation {
  employee_name: string;
  base_salary: number;
  overtime_pay: number;
  bonus: number;
  allowances: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  calculation_date: string;
}

export function SalaryCalculator({ user }: SalaryCalculatorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [isDeductionDialogOpen, setIsDeductionDialogOpen] = useState(false);

  const [calculationParams, setCalculationParams] = useState({
    employee_id: '',
    period_start: '',
    period_end: '',
    overtime_hours: 0,
    overtime_rate: 0,
    bonus: 0,
    allowances: 0
  });

  const [newDeduction, setNewDeduction] = useState({
    employee: '',
    name: '',
    amount: '',
    type: 'tax',
    effective_date: '',
    is_recurring: true
  });

  const [salaryCalculation, setSalaryCalculation] = useState<SalaryCalculation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [employeesRes, payrollsRes, deductionsRes] = await Promise.all([
          fetch('/api/employees/', { headers }),
          fetch('/api/payroll/', { headers }),
          fetch('/api/deductions/', { headers })
        ]);

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setEmployees(employeesData);
          console.log('Employees loaded:', employeesData);
        } else {
          console.error('Failed to fetch employees:', employeesRes.status);
        }

        if (payrollsRes.ok) {
          const payrollsData = await payrollsRes.json();
          setPayrolls(payrollsData);
        }

        if (deductionsRes.ok) {
          const deductionsData = await deductionsRes.json();
          setDeductions(deductionsData);
        }

      } catch (error) {
        console.error('Error fetching salary calculator data:', error);
        toast.error('Failed to load salary calculator data');
      } finally {
        setLoading(false);
      }
    };

    console.log('SalaryCalculator component mounted, user:', user);
    console.log('Token exists:', !!localStorage.getItem('token'));
    fetchData();
  }, []);

  const handleCalculateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Calculate salary called with params:', calculationParams);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/employees/${calculationParams.employee_id}/calculate-salary/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          period_start: calculationParams.period_start,
          period_end: calculationParams.period_end,
          overtime_hours: calculationParams.overtime_hours.toString(),
          overtime_rate: calculationParams.overtime_rate.toString(),
          bonus: calculationParams.bonus.toString(),
          allowances: calculationParams.allowances.toString()
        }),
      });

      if (response.ok) {
        const calculation = await response.json();
        setSalaryCalculation(calculation);
        toast.success('Salary calculated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to calculate salary: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      toast.error('Failed to calculate salary');
    }
  };

  const handleCreateDeduction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/deductions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee: parseInt(newDeduction.employee),
          name: newDeduction.name,
          amount: parseFloat(newDeduction.amount),
          type: newDeduction.type,
          effective_date: newDeduction.effective_date,
          is_recurring: newDeduction.is_recurring
        }),
      });

      if (response.ok) {
        const createdDeduction = await response.json();
        setDeductions([...deductions, createdDeduction]);
        setIsDeductionDialogOpen(false);
        setNewDeduction({
          employee: '',
          name: '',
          amount: '',
          type: 'tax',
          effective_date: '',
          is_recurring: true
        });
        toast.success('Deduction created successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create deduction: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating deduction:', error);
      toast.error('Failed to create deduction');
    }
  };

  const handleSaveAsPayroll = async (calculation: SalaryCalculation) => {
    try {
      const token = localStorage.getItem('token');
      // Get the selected employee to get their base salary
      const selectedEmployee = employees.find(emp => emp.id === parseInt(calculationParams.employee_id));

      if (!selectedEmployee) {
        toast.error('Selected employee not found');
        return;
      }

      const payrollData = {
        employee: parseInt(calculationParams.employee_id),
        period_start: calculationParams.period_start,
        period_end: calculationParams.period_end,
        base_salary: selectedEmployee.salary,
        overtime_hours: calculationParams.overtime_hours.toString(),
        overtime_rate: calculationParams.overtime_rate.toString(),
        bonus: calculationParams.bonus.toString(),
        allowances: calculationParams.allowances.toString(),
        status: 'pending'
      };

      console.log('Saving payroll with data:', payrollData);

      const response = await fetch('/api/payroll/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payrollData),
      });

      console.log('Payroll save response status:', response.status);
      console.log('Payroll save response headers:', response.headers);

      if (response.ok) {
        const newPayroll = await response.json();
        console.log('Payroll saved successfully:', newPayroll);
        setPayrolls([...payrolls, newPayroll]);
        toast.success('Payroll record saved successfully!');
        setIsCalculateDialogOpen(false);
        setSalaryCalculation(null);
        // Reset form
        setCalculationParams({
          employee_id: '',
          period_start: '',
          period_end: '',
          overtime_hours: 0,
          overtime_rate: 0,
          bonus: 0,
          allowances: 0
        });
      } else {
        const errorData = await response.json();
        console.error('Payroll save failed:', errorData);
        toast.error(`Failed to save payroll: ${errorData.detail || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast.error('Failed to save payroll');
    }
  };

  const handleProcessPayroll = async (payrollId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payroll/${payrollId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'processed',
          processed_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const updatedPayroll = await response.json();
        setPayrolls(payrolls.map(p => p.id === payrollId ? updatedPayroll : p));
        toast.success('Payroll processed successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to process payroll: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.error('Failed to process payroll');
    }
  };

  const handleMarkAsPaid = async (payrollId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payroll/${payrollId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'paid',
          payment_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const updatedPayroll = await response.json();
        setPayrolls(payrolls.map(p => p.id === payrollId ? updatedPayroll : p));
        toast.success('Payroll marked as paid!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to mark payroll as paid: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      toast.error('Failed to mark payroll as paid');
    }
  };

  const handleGeneratePaySlip = async (payrollId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payroll/${payrollId}/generate-pay-slip/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Pay slip generated successfully!');

        // Trigger download
        const downloadResponse = await fetch(result.download_url);
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pay_slip_${payrollId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } else {
        const errorData = await response.json();
        toast.error(`Failed to generate pay slip: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating pay slip:', error);
      toast.error('Failed to generate pay slip');
    }
  };

  const stats = [
    { label: 'Total Employees', value: employees.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Deductions', value: deductions.length.toString(), icon: Minus, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Processed Payrolls', value: payrolls.filter(p => p.status === 'processed').length.toString(), icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Salary Budget', value: `$${employees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return <div className="p-8">Loading salary calculator...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Salary Calculator & Pay Slips</h1>
          <p className="text-gray-600 mt-2">Calculate employee salaries, manage deductions, and generate pay slips</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDeductionDialogOpen} onOpenChange={setIsDeductionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Minus className="w-4 h-4" />
                Add Deduction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto w-full sm:max-w-2xl mx-4 my-8 custom-scrollbar">
              <DialogHeader>
                <DialogTitle>Add New Deduction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDeduction} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deduction-employee">Employee *</Label>
                    <Select value={newDeduction.employee} onValueChange={(value: string) => setNewDeduction({...newDeduction, employee: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.user.first_name} {employee.user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deduction-name">Deduction Name *</Label>
                    <Input
                      id="deduction-name"
                      value={newDeduction.name}
                      onChange={(e) => setNewDeduction({...newDeduction, name: e.target.value})}
                      placeholder="e.g., Income Tax, Health Insurance"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deduction-amount">Amount *</Label>
                    <Input
                      id="deduction-amount"
                      type="number"
                      step="0.01"
                      value={newDeduction.amount}
                      onChange={(e) => setNewDeduction({...newDeduction, amount: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deduction-type">Type</Label>
                    <Select value={newDeduction.type} onValueChange={(value: string) => setNewDeduction({...newDeduction, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tax">Tax</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effective-date">Effective Date *</Label>
                    <Input
                      id="effective-date"
                      type="date"
                      value={newDeduction.effective_date}
                      onChange={(e) => setNewDeduction({...newDeduction, effective_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="is-recurring">Recurring</Label>
                    <Select value={newDeduction.is_recurring.toString()} onValueChange={(value: string) => setNewDeduction({...newDeduction, is_recurring: value === 'true'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Deduction</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Calculator className="w-4 h-4" />
                Calculate Salary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full sm:max-w-2xl mx-4 my-8" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <DialogHeader>
                <DialogTitle>Calculate Employee Salary</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCalculateSalary} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="calc-employee">Employee *</Label>
                  <Select value={calculationParams.employee_id} onValueChange={(value: string) => setCalculationParams({...calculationParams, employee_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.user.first_name} {employee.user.last_name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period-start">Period Start *</Label>
                    <Input
                      id="period-start"
                      type="date"
                      value={calculationParams.period_start}
                      onChange={(e) => setCalculationParams({...calculationParams, period_start: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period-end">Period End *</Label>
                    <Input
                      id="period-end"
                      type="date"
                      value={calculationParams.period_end}
                      onChange={(e) => setCalculationParams({...calculationParams, period_end: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overtime-hours">Overtime Hours</Label>
                    <Input
                      id="overtime-hours"
                      type="number"
                      step="0.5"
                      value={calculationParams.overtime_hours}
                      onChange={(e) => setCalculationParams({...calculationParams, overtime_hours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime-rate">Overtime Rate ($/hour)</Label>
                    <Input
                      id="overtime-rate"
                      type="number"
                      step="0.01"
                      value={calculationParams.overtime_rate}
                      onChange={(e) => setCalculationParams({...calculationParams, overtime_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bonus">Bonus</Label>
                    <Input
                      id="bonus"
                      type="number"
                      step="0.01"
                      value={calculationParams.bonus}
                      onChange={(e) => setCalculationParams({...calculationParams, bonus: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowances">Allowances</Label>
                    <Input
                      id="allowances"
                      type="number"
                      step="0.01"
                      value={calculationParams.allowances}
                      onChange={(e) => setCalculationParams({...calculationParams, allowances: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Calculate Salary</Button>
              </form>

              {salaryCalculation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-4">Salary Calculation Result</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Employee:</span>
                      <span className="font-medium">{salaryCalculation.employee_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Basic Salary:</span>
                      <span>${salaryCalculation.base_salary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overtime Pay:</span>
                      <span>${salaryCalculation.overtime_pay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus:</span>
                      <span>${salaryCalculation.bonus.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowances:</span>
                      <span>${salaryCalculation.allowances.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Gross Salary:</span>
                      <span>${salaryCalculation.gross_salary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Total Deductions:</span>
                      <span>-${salaryCalculation.total_deductions.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Net Salary:</span>
                      <span>${salaryCalculation.net_salary.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => handleSaveAsPayroll(salaryCalculation)}
                      className="flex-1"
                    >
                      Save as Payroll Record
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSalaryCalculation(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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

      <Tabs defaultValue="payroll" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Management</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="calculations">Salary Calculations</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrolls.map(payroll => (
                  <div key={payroll.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{payroll.employee_name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(payroll.period_start).toLocaleDateString()} - {new Date(payroll.period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          payroll.status === 'paid' ? 'bg-green-100 text-green-700' :
                          payroll.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {payroll.status}
                        </Badge>
                        <div className="flex gap-1">
                          {payroll.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayroll(payroll.id)}
                            >
                              Process
                            </Button>
                          )}
                          {payroll.status === 'processed' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleMarkAsPaid(payroll.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGeneratePaySlip(payroll.id)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Pay Slip
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Gross Salary</p>
                        <p className="font-medium">${parseFloat(payroll.gross_salary).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deductions</p>
                        <p className="font-medium text-red-600">-${parseFloat(payroll.total_deductions).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Net Salary</p>
                        <p className="font-medium text-green-600">${parseFloat(payroll.net_salary).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Overtime</p>
                        <p className="font-medium">{payroll.overtime_hours}h @ ${payroll.overtime_rate}/h</p>
                      </div>
                    </div>
                  </div>
                ))}
                {payrolls.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No payroll records found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle>Employee Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deductions.map(deduction => (
                  <div key={deduction.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Minus className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{deduction.name}</h3>
                            <p className="text-sm text-gray-600">{deduction.employee_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-red-100 text-red-700">
                          {deduction.type}
                        </Badge>
                        <div className="text-right">
                          <p className="font-medium text-red-600">${parseFloat(deduction.amount).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">per pay period</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {deductions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No deductions configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations">
          <Card>
            <CardHeader>
              <CardTitle>Salary Calculation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryCalculation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-blue-900">Latest Calculation</h3>
                      <span className="text-xs text-blue-600">
                        {new Date(salaryCalculation.calculation_date).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-500">Employee</p>
                        <p className="font-medium">{salaryCalculation.employee_name}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-500">Gross Salary</p>
                        <p className="font-medium">${salaryCalculation.gross_salary.toFixed(2)}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-500">Deductions</p>
                        <p className="font-medium text-red-600">-${salaryCalculation.total_deductions.toFixed(2)}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-500">Net Salary</p>
                        <p className="font-bold text-green-600">${salaryCalculation.net_salary.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!salaryCalculation && (
                  <p className="text-center text-gray-500 py-8">
                    No salary calculations performed yet. Use the "Calculate Salary" button to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}