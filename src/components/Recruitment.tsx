import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Search, Briefcase, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface RecruitmentProps {
  user: User;
}

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  posted: string;
  applicants: number;
  status: string;
}

interface Candidate {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  experience: string;
  status: string;
  stage: string;
  score: number;
  appliedDate: string;
}

export function Recruitment({ user }: RecruitmentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApplicantsDialogOpen, setIsApplicantsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobApplicants, setJobApplicants] = useState<Candidate[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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

        const [jobsResponse, candidatesResponse] = await Promise.all([
          fetch('/api/job-postings/', { headers }),
          fetch('/api/candidates/', { headers })
        ]);

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          // Transform API data to match component expectations
          const transformedJobs = jobsData.map((job: any) => ({
            id: job.id,
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.employment_type,
            posted: job.posted_date,
            applicants: 0, // This would need to be calculated from candidates
            status: job.status
          }));
          setJobPostings(transformedJobs);
        }

        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          // Transform API data to match component expectations
          const transformedCandidates = candidatesData.map((candidate: any) => ({
            id: candidate.id,
            name: candidate.full_name || `${candidate.first_name} ${candidate.last_name}`,
            position: candidate.job_posting?.title || 'Unknown Position',
            email: candidate.email,
            phone: candidate.phone || '',
            experience: `${candidate.experience_years} years`,
            status: candidate.status,
            stage: candidate.stage,
            score: candidate.score,
            appliedDate: candidate.applied_date
          }));
          setCandidates(transformedCandidates);
        }
      } catch (error) {
        console.error('Error fetching recruitment data:', error);
        toast.error('Failed to load recruitment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    type: '',
    salaryRange: ''
  });

  const [editJob, setEditJob] = useState({
    id: 0,
    title: '',
    department: '',
    location: '',
    description: '',
    type: '',
    salaryRange: ''
  });

  const stats = [
    { label: 'Active Positions', value: jobPostings.length.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Applicants', value: jobPostings.reduce((sum, job) => sum + job.applicants, 0).toString(), icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'In Progress', value: candidates.filter(c => c.status === 'interview' || c.status === 'screening').length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Hired This Month', value: '8', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newJob.title || !newJob.department || !newJob.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Map user-friendly type to model choice
      const typeMapping = {
        'Full-time': 'full_time',
        'Part-time': 'part_time',
        'Contract': 'contract',
        'Internship': 'internship',
        'full_time': 'full_time',
        'part_time': 'part_time',
        'contract': 'contract',
        'internship': 'internship'
      };

      const employmentType = typeMapping[newJob.type] || 'full_time';

      const response = await fetch('/api/job-postings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newJob.title,
          department: newJob.department,
          location: newJob.location,
          employment_type: employmentType,
          description: newJob.description,
          salary_range: newJob.salaryRange
        }),
      });

      if (response.ok) {
        const newJobData = await response.json();
        setJobPostings([...jobPostings, newJobData]);
        setNewJob({
          title: '',
          department: '',
          location: '',
          description: '',
          type: '',
          salaryRange: ''
        });
        setIsJobDialogOpen(false);
        toast.success('Job posting created successfully!');
      } else {
        toast.error('Failed to create job posting');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job posting');
    }
  };

  const handleEditJob = async (jobId: number) => {
    const job = jobPostings.find(j => j.id === jobId);
    if (job) {
      setEditJob({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        description: '', // Would need to fetch full job details
        type: job.type,
        salaryRange: '' // Would need to fetch full job details
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const typeMapping = {
        'Full-time': 'full_time',
        'Part-time': 'part_time',
        'Contract': 'contract',
        'Internship': 'internship',
        'full_time': 'full_time',
        'part_time': 'part_time',
        'contract': 'contract',
        'internship': 'internship'
      };

      const employmentType = typeMapping[editJob.type] || 'full_time';

      const response = await fetch(`/api/job-postings/${editJob.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editJob.title,
          department: editJob.department,
          location: editJob.location,
          employment_type: employmentType,
          description: editJob.description,
          salary_range: editJob.salaryRange
        }),
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobPostings(jobPostings.map(j =>
          j.id === editJob.id ? {
            ...j,
            title: updatedJob.title,
            department: updatedJob.department,
            location: updatedJob.location,
            type: updatedJob.employment_type
          } : j
        ));
        setIsEditDialogOpen(false);
        toast.success('Job posting updated successfully!');
      } else {
        toast.error('Failed to update job posting');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job posting');
    }
  };

  const handleViewApplicants = async (jobId: number) => {
    const job = jobPostings.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      // Filter candidates for this job
      const applicants = candidates.filter(c => c.position === job.title);
      setJobApplicants(applicants);
      setIsApplicantsDialogOpen(true);
    }
  };

  const handleMoveToOffer = async (candidateId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${candidateId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'offer',
          stage: 'Offer Extended'
        }),
      });

      if (response.ok) {
        setCandidates(candidates.map(c =>
          c.id === candidateId
            ? { ...c, status: 'offer', stage: 'Offer Extended' }
            : c
        ));
        toast.success('Candidate moved to offer stage');
      } else {
        toast.error('Failed to update candidate status');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate status');
    }
  };

  const handleScheduleInterview = async (candidateId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${candidateId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'interview',
          stage: 'Technical Interview'
        }),
      });

      if (response.ok) {
        setCandidates(candidates.map(c =>
          c.id === candidateId && c.status === 'screening'
            ? { ...c, status: 'interview', stage: 'Technical Interview' }
            : c
        ));
        toast.success('Interview scheduled successfully');
      } else {
        toast.error('Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const handleClosePosition = async (jobId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/job-postings/${jobId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'closed'
        }),
      });

      if (response.ok) {
        setJobPostings(jobPostings.map(j =>
          j.id === jobId
            ? { ...j, status: 'closed' }
            : j
        ));
        toast.success('Position closed');
      } else {
        toast.error('Failed to close position');
      }
    } catch (error) {
      console.error('Error closing position:', error);
      toast.error('Failed to close position');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      screening: { label: 'Screening', className: 'bg-blue-100 text-blue-700' },
      interview: { label: 'Interview', className: 'bg-purple-100 text-purple-700' },
      offer: { label: 'Offer', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    
    const variant = variants[status] || variants.screening;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading recruitment data...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Recruitment Management</h1>
          <p className="text-gray-600 mt-2">Smart hiring and candidate tracking</p>
        </div>
        <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Job Posting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                  id="title"
                  placeholder="e.g., Senior Software Engineer" 
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input 
                    id="department"
                    placeholder="e.g., Engineering" 
                    value={newJob.department}
                    onChange={(e) => setNewJob({...newJob, department: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location"
                    placeholder="e.g., Remote" 
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Enter job description..." 
                  rows={6} 
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Input 
                    id="type"
                    placeholder="e.g., Full-time" 
                    value={newJob.type}
                    onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input 
                    id="salary"
                    placeholder="e.g., $80k - $120k" 
                    value={newJob.salaryRange}
                    onChange={(e) => setNewJob({...newJob, salaryRange: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Publish Job Posting</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateJob} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="e.g., Senior Software Engineer"
                  value={editJob.title}
                  onChange={(e) => setEditJob({...editJob, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department *</Label>
                  <Input
                    id="edit-department"
                    placeholder="e.g., Engineering"
                    value={editJob.department}
                    onChange={(e) => setEditJob({...editJob, department: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input
                    id="edit-location"
                    placeholder="e.g., Remote"
                    value={editJob.location}
                    onChange={(e) => setEditJob({...editJob, location: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Job Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter job description..."
                  rows={6}
                  value={editJob.description}
                  onChange={(e) => setEditJob({...editJob, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Employment Type</Label>
                  <Input
                    id="edit-type"
                    placeholder="e.g., Full-time"
                    value={editJob.type}
                    onChange={(e) => setEditJob({...editJob, type: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salary">Salary Range</Label>
                  <Input
                    id="edit-salary"
                    placeholder="e.g., $80k - $120k"
                    value={editJob.salaryRange}
                    onChange={(e) => setEditJob({...editJob, salaryRange: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Update Job Posting</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Applicants Dialog */}
        <Dialog open={isApplicantsDialogOpen} onOpenChange={setIsApplicantsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Applicants for {selectedJob?.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {jobApplicants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No applicants yet for this position.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {jobApplicants.map(applicant => (
                    <div key={applicant.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600">{applicant.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-sm text-gray-600">{applicant.position}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p>{applicant.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Experience</p>
                              <p>{applicant.experience}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Applied</p>
                              <p>{new Date(applicant.appliedDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Score</p>
                              <p>{applicant.score}/10</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(applicant.status)}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info(`Viewing details for ${applicant.name}`)}
                        >
                          View Details
                        </Button>
                        {applicant.status === 'screening' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleInterview(applicant.id)}
                          >
                            Schedule Interview
                          </Button>
                        )}
                        {applicant.status === 'interview' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleMoveToOffer(applicant.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Move to Offer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Candidate Pipeline</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCandidates.map(candidate => (
                  <div key={candidate.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600">{candidate.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p>{candidate.name}</p>
                            <p className="text-sm text-gray-600">{candidate.position}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p>{candidate.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Experience</p>
                            <p>{candidate.experience}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Stage</p>
                            <p>{candidate.stage}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Score</p>
                            <p>{candidate.score}/10</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(candidate.status)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.info(`Viewing details for ${candidate.name}`)}
                      >
                        View Details
                      </Button>
                      {candidate.status === 'screening' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleScheduleInterview(candidate.id)}
                        >
                          Schedule Interview
                        </Button>
                      )}
                      {candidate.status === 'interview' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleMoveToOffer(candidate.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Move to Offer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobPostings.map(job => (
                  <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="text-gray-600 mt-1">{job.department} • {job.location}</p>
                      </div>
                      <Badge className={job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {job.status === 'active' ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p>{job.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Posted</p>
                        <p>{new Date(job.posted).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Applicants</p>
                        <p>{job.applicants}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditJob(job.id)}
                      >
                        Edit Posting
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApplicants(job.id)}
                      >
                        View Applicants
                      </Button>
                      {job.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => handleClosePosition(job.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Close Position
                        </Button>
                      )}
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
