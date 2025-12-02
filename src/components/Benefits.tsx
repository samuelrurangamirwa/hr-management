import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Gift, FileText, Plus, Check, Clock, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface BenefitsProps {
  user: User;
}

export function Benefits({ user }: BenefitsProps) {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [benefitsResponse, expensesResponse] = await Promise.all([
          fetch('/api/benefits/', { headers }),
          fetch('/api/expenses/', { headers })
        ]);

        if (benefitsResponse.ok) {
          const benefitsData = await benefitsResponse.json();
          setBenefits(benefitsData);
        }

        if (expensesResponse.ok) {
          const expensesData = await expensesResponse.json();
          setExpenses(expensesData);
        }
      } catch (error) {
        console.error('Error fetching benefits data:', error);
        toast.error('Failed to load benefits data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseDetailDialogOpen, setExpenseDetailDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: '',
    amount: '',
    description: '',
  });

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseForm.title || !expenseForm.category || !expenseForm.amount || !expenseForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expenses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: expenseForm.title,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
        }),
      });

      if (response.ok) {
        const newExpense = await response.json();
        setExpenses([newExpense, ...expenses]);
        setExpenseForm({ title: '', category: '', amount: '', description: '' });
        setExpenseDialogOpen(false);
        toast.success('Expense claim submitted successfully!');
      } else {
        toast.error('Failed to submit expense claim');
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Failed to submit expense claim');
    }
  };

  const handleEnrollBenefit = async (benefitId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employee-benefits/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          benefit: benefitId,
          status: 'enrolled'
        }),
      });

      if (response.ok) {
        toast.success('Successfully enrolled in benefit!');
        // Refresh benefits data
        const benefitsResponse = await fetch('/api/benefits/', { headers: { 'Authorization': `Bearer ${token}` } });
        if (benefitsResponse.ok) {
          const benefitsData = await benefitsResponse.json();
          setBenefits(benefitsData);
        }
      } else {
        toast.error('Failed to enroll in benefit');
      }
    } catch (error) {
      console.error('Error enrolling in benefit:', error);
      toast.error('Failed to enroll in benefit');
    }
  };

  const handleApproveExpense = async (expenseId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expenses/${expenseId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'approved'
        }),
      });

      if (response.ok) {
        setExpenses(expenses.map(expense =>
          expense.id === expenseId
            ? { ...expense, status: 'approved' }
            : expense
        ));
        toast.success('Expense claim approved');
      } else {
        toast.error('Failed to approve expense');
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleRejectExpense = async (expenseId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expenses/${expenseId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected'
        }),
      });

      if (response.ok) {
        setExpenses(expenses.map(expense =>
          expense.id === expenseId
            ? { ...expense, status: 'rejected' }
            : expense
        ));
        toast.error('Expense claim rejected');
      } else {
        toast.error('Failed to reject expense');
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  const handleViewExpenseDetail = (expense: any) => {
    setSelectedExpense(expense);
    setExpenseDetailDialogOpen(true);
  };

  const stats = [
    { label: 'Total Benefits', value: benefits.length.toString(), icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Benefits', value: benefits.filter(b => b.is_active).length.toString(), icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Expenses', value: expenses.filter(e => e.status === 'pending').length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Expenses', value: `$${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      enrolled: { label: 'Enrolled', className: 'bg-green-100 text-green-700' },
      available: { label: 'Available', className: 'bg-blue-100 text-blue-700' },
      pending: { label: 'Pending', className: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    
    const variant = variants[status] || variants.available;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Benefits & Expense Management</h1>
          <p className="text-gray-600 mt-2">Manage employee benefits and expense claims</p>
        </div>
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Submit Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Expense Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitExpense} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Brief title for the expense"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={expenseForm.category} onValueChange={(value: string) => setExpenseForm({...expenseForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the expense..."
                  rows={4}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Receipt</Label>
                <Input type="file" />
              </div>
              <Button type="submit" className="w-full">Submit Claim</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Expense Detail Dialog */}
        <Dialog open={expenseDetailDialogOpen} onOpenChange={setExpenseDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Expense Claim Details</DialogTitle>
            </DialogHeader>
            {selectedExpense && (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Claim Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {selectedExpense.title}</p>
                      <p><strong>Employee:</strong> {selectedExpense.employee_name}</p>
                      <p><strong>Category:</strong> {selectedExpense.category}</p>
                      <p><strong>Amount:</strong> ${selectedExpense.amount.toLocaleString()}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedExpense.status)}</p>
                      <p><strong>Submitted Date:</strong> {new Date(selectedExpense.submitted_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Additional Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Description:</strong></p>
                      <p className="text-gray-700">{selectedExpense.description}</p>
                      {selectedExpense.approved_by_name && (
                        <p><strong>Approved By:</strong> {selectedExpense.approved_by_name}</p>
                      )}
                      {selectedExpense.approved_date && (
                        <p><strong>Approved Date:</strong> {new Date(selectedExpense.approved_date).toLocaleDateString()}</p>
                      )}
                      {selectedExpense.comments && (
                        <>
                          <p><strong>Comments:</strong></p>
                          <p className="text-gray-700">{selectedExpense.comments}</p>
                        </>
                      )}
                      {selectedExpense.receipt && (
                        <p><strong>Receipt:</strong> <a href={selectedExpense.receipt} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Receipt</a></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      <Tabs defaultValue="benefits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="benefits">My Benefits</TabsTrigger>
          <TabsTrigger value="expenses">Expense Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Available Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benefits.map(benefit => (
                  <div key={benefit.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3>{benefit.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{benefit.description}</p>
                        <p className="text-gray-600 text-sm">Provider: {benefit.provider}</p>
                      </div>
                      {getStatusBadge(benefit.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Monthly Cost</p>
                        <p>${benefit.monthlyCost}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Employer Pays</p>
                        <p className="text-green-600">${benefit.employerContribution}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">You Pay</p>
                        <p className="text-blue-600">${benefit.employeeContribution}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Coverage</p>
                        <p>{benefit.coverage}</p>
                      </div>
                    </div>

                    {benefit.status === 'enrolled' ? (
                      <Button size="sm" variant="outline" onClick={() => toast.info('Benefit details coming soon')}>View Details</Button>
                    ) : (
                      <Button size="sm" onClick={() => handleEnrollBenefit(benefit.id)}>Enroll Now</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Employee</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{expense.employee}</td>
                        <td className="py-3 px-4">{expense.category}</td>
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4">${expense.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{getStatusBadge(expense.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {expense.status === 'pending' && (user.role === 'admin' || user.role === 'manager') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => handleApproveExpense(expense.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => handleRejectExpense(expense.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleViewExpenseDetail(expense)}>View</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
