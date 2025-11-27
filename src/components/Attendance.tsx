import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Fingerprint, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface AttendanceProps {
  user: User;
}

export function Attendance({ user }: AttendanceProps) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [myAttendanceHistory, setMyAttendanceHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch today's attendance
        let todayData: any[] = [];
        const todayResponse = await fetch('/api/attendance/', { headers });
        if (todayResponse.ok) {
          todayData = await todayResponse.json();
          setTodayAttendance(todayData);
        }

        // Calculate stats
        const present = todayData.filter((record: any) => record.status === 'present').length;
        const absent = todayData.filter((record: any) => record.status === 'absent').length;
        const late = todayData.filter((record: any) => record.status === 'late').length;
        const avgHours = todayData.length > 0 ?
          todayData.reduce((sum: number, record: any) => sum + (record.hours || 0), 0) / todayData.length : 0;

        setStats([
          { label: 'Present Today', value: present.toString(), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Absent Today', value: absent.toString(), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Late Arrivals', value: late.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg Hours', value: avgHours.toFixed(1), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        ]);

        // Fetch user's attendance history
        const historyResponse = await fetch('/api/attendance/?employee__user=' + user.id, { headers });
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setMyAttendanceHistory(historyData.slice(0, 10)); // Last 10 records
        }

      } catch (error) {
        console.error('Error fetching attendance data:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user.id]);

  const handleBiometricScan = async () => {
    setShowBiometric(true);
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Get user's employee profile
        const employeeResponse = await fetch('/api/employees/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!employeeResponse.ok) {
          throw new Error('Failed to get employee profile');
        }

        const employees = await employeeResponse.json();
        const employee = employees.find((emp: any) => emp.user.id === user.id);

        if (!employee) {
          throw new Error('Employee profile not found');
        }

        if (!isClockedIn) {
          // Clock in
          const response = await fetch('/api/attendance/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              employee: employee.id,
              date: currentDate,
              check_in: currentTime,
              status: 'present'
            }),
          });

          if (response.ok) {
            setIsClockedIn(true);
            toast.success('Successfully clocked in! Have a great day!');
          } else {
            throw new Error('Failed to clock in');
          }
        } else {
          // Clock out - update existing record
          const todayRecordsResponse = await fetch(`/api/attendance/?employee=${employee.id}&date=${currentDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (todayRecordsResponse.ok) {
            const records = await todayRecordsResponse.json();
            if (records.length > 0) {
              const record = records[0];
              const response = await fetch(`/api/attendance/${record.id}/`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  check_out: currentTime
                }),
              });

              if (response.ok) {
                setIsClockedIn(false);
                toast.success('Successfully clocked out! See you tomorrow!');
              } else {
                throw new Error('Failed to clock out');
              }
            }
          }
        }
      } catch (error) {
        console.error('Clock operation failed:', error);
        toast.error('Clock operation failed. Please try again.');
      } finally {
        setShowBiometric(false);
      }
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      present: { label: 'Present', className: 'bg-green-100 text-green-700' },
      absent: { label: 'Absent', className: 'bg-red-100 text-red-700' },
      working: { label: 'Working', className: 'bg-blue-100 text-blue-700' },
      leave: { label: 'On Leave', className: 'bg-orange-100 text-orange-700' },
    };
    
    const variant = variants[status] || variants.present;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return <div className="p-8">Loading attendance data...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Attendance Management</h1>
        <p className="text-gray-600 mt-2">Biometric tracking and attendance monitoring</p>
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

      {/* Biometric Clock In/Out */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Biometric Clock In/Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Fingerprint className="w-16 h-16 text-blue-600" />
            </div>
            <p className="mb-2">Current Status: {isClockedIn ? 'Clocked In' : 'Clocked Out'}</p>
            <p className="text-sm text-gray-600 mb-6">
              {isClockedIn ? 'Started at 9:00 AM' : 'Click below to clock in'}
            </p>
            
            <Dialog open={showBiometric} onOpenChange={setShowBiometric}>
              <Button 
                onClick={handleBiometricScan}
                size="lg"
                className={isClockedIn ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </Button>
              <DialogContent className="max-w-md">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Fingerprint className="w-12 h-12 text-blue-600" />
                  </div>
                  <p>Scanning biometric...</p>
                  <p className="text-sm text-gray-600 mt-2">Please place your finger on the sensor</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance - {new Date().toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Employee</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Check In</th>
                      <th className="text-left py-3 px-4">Check Out</th>
                      <th className="text-left py-3 px-4">Hours</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.map(record => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{record.name}</td>
                        <td className="py-3 px-4">{record.department}</td>
                        <td className="py-3 px-4">{record.checkIn}</td>
                        <td className="py-3 px-4">{record.checkOut}</td>
                        <td className="py-3 px-4">{record.hours > 0 ? `${record.hours}h` : '-'}</td>
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Check In</th>
                      <th className="text-left py-3 px-4">Check Out</th>
                      <th className="text-left py-3 px-4">Total Hours</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendanceHistory.map((record, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{record.checkIn}</td>
                        <td className="py-3 px-4">{record.checkOut}</td>
                        <td className="py-3 px-4">{record.hours > 0 ? `${record.hours}h` : '-'}</td>
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
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
