import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Upload, Briefcase, MapPin, DollarSign } from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  salary_range: string;
  posted_date: string;
  status: string;
}

interface JobApplicationProps {
  jobId?: number;
}

export function JobApplication({ jobId }: JobApplicationProps) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [applicationData, setApplicationData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    experience_years: 0,
    current_position: '',
    expected_salary: '',
    cover_letter: '',
    resume: null as File | null
  });

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await fetch('/api/job-postings/?status=active');
        if (response.ok) {
          const jobs = await response.json();
          setJobPostings(jobs);

          // If jobId is provided, select that job
          if (jobId) {
            const job = jobs.find((j: JobPosting) => j.id === jobId);
            if (job) {
              setSelectedJob(job);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching job postings:', error);
        toast.error('Failed to load job postings');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob) {
      toast.error('Please select a job position');
      return;
    }

    if (!applicationData.first_name || !applicationData.last_name || !applicationData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('job_posting', selectedJob.id.toString());
      formData.append('first_name', applicationData.first_name);
      formData.append('last_name', applicationData.last_name);
      formData.append('email', applicationData.email);
      formData.append('phone', applicationData.phone);
      formData.append('experience_years', applicationData.experience_years.toString());
      formData.append('current_position', applicationData.current_position);
      if (applicationData.expected_salary) {
        formData.append('expected_salary', parseFloat(applicationData.expected_salary).toString());
      }
      formData.append('status', 'applied');

      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      const response = await fetch('/api/candidates/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        // Reset form
        setApplicationData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          experience_years: 0,
          current_position: '',
          expected_salary: '',
          cover_letter: '',
          resume: null
        });
        setSelectedJob(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setApplicationData({ ...applicationData, resume: file });
    }
  };

  if (loading) {
    return <div className="p-8">Loading job postings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Apply for a Position</h1>
        <p className="text-gray-600 mt-2">Submit your application for available positions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobPostings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No positions available at the moment.</p>
                ) : (
                  jobPostings.map(job => (
                    <div
                      key={job.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedJob?.id === job.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary_range}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{job.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              {selectedJob && (
                <p className="text-sm text-gray-600">Applying for: {selectedJob.title}</p>
              )}
            </CardHeader>
            <CardContent>
              {!selectedJob ? (
                <div className="text-center py-8">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Please select a position to apply for</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={applicationData.first_name}
                        onChange={(e) => setApplicationData({...applicationData, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={applicationData.last_name}
                        onChange={(e) => setApplicationData({...applicationData, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={applicationData.email}
                        onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={applicationData.experience_years}
                        onChange={(e) => setApplicationData({...applicationData, experience_years: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_position">Current Position</Label>
                      <Input
                        id="current_position"
                        value={applicationData.current_position}
                        onChange={(e) => setApplicationData({...applicationData, current_position: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected_salary">Expected Salary</Label>
                    <Input
                      id="expected_salary"
                      placeholder="e.g., $80,000 - $100,000"
                      value={applicationData.expected_salary}
                      onChange={(e) => setApplicationData({...applicationData, expected_salary: e.target.value})}
                    />
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="resume" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {applicationData.resume ? applicationData.resume.name : 'Click to upload resume (PDF, DOC, DOCX)'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                      </label>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-2">
                    <Label htmlFor="cover_letter">Cover Letter</Label>
                    <Textarea
                      id="cover_letter"
                      placeholder="Tell us why you're interested in this position..."
                      rows={6}
                      value={applicationData.cover_letter}
                      onChange={(e) => setApplicationData({...applicationData, cover_letter: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}