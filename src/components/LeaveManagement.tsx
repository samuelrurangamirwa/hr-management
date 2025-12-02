import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface LeaveManagementProps {
  user: User;
}

interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: string;
  submitted_date: string;
  approved_by_name?: string;
  approved_date?: string;
  comments?: string;
}

export function LeaveManagement({ user }: LeaveManagementProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [newRequest, setNewRequest] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/leave-requests/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date(newRequest.start_date);
    const endDate = new Date(newRequest.end_date);
    const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysRequested <= 0) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leave-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          leave_type: newRequest.leave_type,
          start_date: newRequest.start_date,
          end_date: newRequest.end_date,
          days_requested: daysRequested,
          reason: newRequest.reason
        }),
      });

      if (response.ok) {
        toast.success('Leave request submitted successfully!');
        setIsRequestOpen(false);
        setNewRequest({
          leave_type: 'annual',
          start_date: '',
          end_date: '',
          reason: ''
        });
        fetchLeaveRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const handleApproveReject = async (requestId: number, action: 'approve' | 'reject', comments?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/leave-requests/${requestId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          comments: comments || ''
        }),
      });

      if (response.ok) {
        toast.success(`Leave request ${action}d successfully!`);
        fetchLeaveRequests();
      } else {
        toast.error(`Failed to ${action} leave request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error);
      toast.error(`Failed to ${action} leave request`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const myRequests = leaveRequests.filter(req => req.employee === user.employee_id);
  const pendingApprovals = leaveRequests.filter(req => req.status === 'pending' && user.role !== 'employee');

  if (loading) {
    return <div className="p-8">Loading leave management...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage leave requests and approvals</p>
        </div>
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={newRequest.leave_type} onValueChange={(value: string) => setNewRequest({...newRequest, leave_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newRequest.start_date}
                    onChange={(e) => setNewRequest({...newRequest, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newRequest.end_date}
                    onChange={(e) => setNewRequest({...newRequest, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Please provide a reason for your leave request..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          {user.role !== 'employee' && <TabsTrigger value="approvals">Pending Approvals ({pendingApprovals.length})</TabsTrigger>}
          <TabsTrigger value="all-requests">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No leave requests found.</p>
                ) : (
                  myRequests.map(request => (
                    <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-medium capitalize">{request.leave_type.replace('_', ' ')}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</p>
                            <p>{request.days_requested} day(s) requested</p>
                            <p>Submitted: {new Date(request.submitted_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user.role !== 'employee' && (
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending approvals.</p>
                  ) : (
                    pendingApprovals.map(request => (
                      <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <UserCheck className="w-5 h-5 text-orange-600" />
                              <span className="font-medium">{request.employee_name}</span>
                              <span className="capitalize">{request.leave_type.replace('_', ' ')}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</p>
                              <p>{request.days_requested} day(s) requested</p>
                              <p>Reason: {request.reason}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveReject(request.id, 'approve')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproveReject(request.id, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="all-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No leave requests found.</p>
                ) : (
                  leaveRequests.map(request => (
                    <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{request.employee_name}</span>
                            <span className="capitalize">{request.leave_type.replace('_', ' ')}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</p>
                            <p>{request.days_requested} day(s) requested</p>
                            <p>Submitted: {new Date(request.submitted_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Request Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Employee:</strong> {selectedRequest.employee_name}</p>
                    <p><strong>Leave Type:</strong> {selectedRequest.leave_type.replace('_', ' ')}</p>
                    <p><strong>Start Date:</strong> {new Date(selectedRequest.start_date).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                    <p><strong>Days Requested:</strong> {selectedRequest.days_requested}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedRequest.submitted_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Additional Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Reason:</strong></p>
                    <p className="text-gray-700">{selectedRequest.reason}</p>
                    {selectedRequest.approved_by_name && (
                      <p><strong>Approved By:</strong> {selectedRequest.approved_by_name}</p>
                    )}
                    {selectedRequest.approved_date && (
                      <p><strong>Approved Date:</strong> {new Date(selectedRequest.approved_date).toLocaleDateString()}</p>
                    )}
                    {selectedRequest.comments && (
                      <>
                        <p><strong>Comments:</strong></p>
                        <p className="text-gray-700">{selectedRequest.comments}</p>
                      </>
                    )}
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