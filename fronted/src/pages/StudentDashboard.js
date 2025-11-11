// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getInstitutions,
  getCourses,
  getJobPostings,
  submitApplication,
  submitJobApplication,
  getApplications,
  getFaculties,
  getAdmissions,
  updateApplicationStatus,
  getUserApplications,
  getUserJobApplications,
  getUserCourseApplications
} from '../services/firebaseService';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState({});
  const [myApplications, setMyApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [profile, setProfile] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    uploadedDocs: [] 
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [faculties, setFaculties] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [allApplications, setAllApplications] = useState([]);

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // ✅ FIX: Safe status rendering function
  const getStatusText = (status) => {
    if (typeof status === 'string') return status;
    if (status && typeof status === 'object') {
      return status.status || 'Unknown';
    }
    return 'Unknown';
  };

  // ✅ FIX: Safe status badge class
  const getStatusClass = (status) => {
    const statusText = getStatusText(status);
    return statusText.toLowerCase();
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        instData, 
        coursesData, 
        jobsData, 
        facultiesData, 
        admissionsData, 
        applicationsData
      ] = await Promise.all([
        getInstitutions(),
        getCourses(),
        getJobPostings(),
        getFaculties(),
        getAdmissions(),
        getUserApplications(user.uid)
      ]);
      
      setInstitutions(instData);
      setCourses(coursesData);
      setJobPostings(jobsData);
      setFaculties(facultiesData);
      setAdmissions(admissionsData);
      setAllApplications(applicationsData);
      setMyApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseApplication = async () => {
    const selectedCount = Object.keys(applications).length;
    if (selectedCount === 0) {
      alert('Please select at least one course to apply for.');
      return;
    }
    if (selectedCount > 2) {
      alert('You can only apply to a maximum of 2 courses.');
      return;
    }

    try {
      for (const [institutionId, courseId] of Object.entries(applications)) {
        const institution = institutions.find(inst => inst.id === institutionId);
        const course = courses.find(c => c.id === courseId);
        
        const applicationData = {
          studentId: user.uid,
          studentName: user.name || user.displayName || user.email,
          studentEmail: user.email,
          institutionId,
          institutionName: institution?.name,
          courseId,
          courseName: course?.name,
          type: 'admission',
          status: 'pending',
          appliedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        await submitApplication(applicationData);
      }

      // Refresh applications
      const updatedApplications = await getUserApplications(user.uid);
      setMyApplications(updatedApplications);
      setAllApplications(updatedApplications);

      alert('Applications submitted successfully!');
      setApplications({});
      setActiveTab('myApplications');
    } catch (error) {
      console.error('Error submitting applications:', error);
      alert(`Failed to submit applications: ${error.message}`);
    }
  };

  const handleJobApplication = async (jobId) => {
    const job = jobPostings.find(j => j.id === jobId);
    
    try {
      const applicationData = {
        studentId: user.uid,
        studentName: user.name || user.displayName || user.email,
        studentEmail: user.email,
        jobId,
        jobTitle: job.title,
        company: job.company,
        type: 'job',
        status: 'pending',
        appliedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      await submitJobApplication(applicationData);
      
      // Refresh applications
      const updatedApplications = await getUserApplications(user.uid);
      setMyApplications(updatedApplications);
      setAllApplications(updatedApplications);

      alert('Job application submitted successfully!');
      setActiveTab('myApplications');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert(`Failed to apply for job: ${error.message}`);
    }
  };

  const handleSelectCourse = (institutionId, courseId) => {
    if (courseId) {
      setApplications(prev => ({ ...prev, [institutionId]: courseId }));
    } else {
      const newApps = { ...applications };
      delete newApps[institutionId];
      setApplications(newApps);
    }
  };

  const handleDocumentUpload = () => {
    const docName = prompt('Enter document name:');
    const docType = prompt('Enter document type (Transcript/Certificate/Other):');
    
    if (docName && docType) {
      const newDoc = {
        id: Date.now().toString(),
        name: docName,
        type: docType,
        uploadedAt: new Date().toISOString()
      };
      
      setDocuments(prev => [...prev, newDoc]);
      setProfile(prev => ({
        ...prev,
        uploadedDocs: [...prev.uploadedDocs, `${docType}: ${docName}`]
      }));
      alert('Document uploaded successfully!');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // In a real app, you would update the profile in Firebase here
      // For now, we'll just show a success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await updateApplicationStatus(applicationId, 'withdrawn');
        
        // Refresh applications
        const updatedApplications = await getUserApplications(user.uid);
        setMyApplications(updatedApplications);
        setAllApplications(updatedApplications);
        
        alert('Application withdrawn successfully!');
      } catch (error) {
        console.error('Error withdrawing application:', error);
        alert(`Failed to withdraw application: ${error.message}`);
      }
    }
  };

  // Filter applications by type and status
  const courseApplications = allApplications.filter(app => app.type === 'admission');
  const jobApplications = allApplications.filter(app => app.type === 'job');
  const pendingApplications = allApplications.filter(app => getStatusText(app.status) === 'pending');
  const acceptedApplications = allApplications.filter(app => getStatusText(app.status) === 'accepted');
  const rejectedApplications = allApplications.filter(app => getStatusText(app.status) === 'rejected');
  const withdrawnApplications = allApplications.filter(app => getStatusText(app.status) === 'withdrawn');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Student Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Student Dashboard</h1>
          <div className="user-welcome">
            <div className="welcome-avatar">
              {user?.name?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="welcome-text">
              <p className="welcome-message">Welcome back,</p>
              <p className="user-name">{user?.name || user?.displayName || user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <span className="tab-icon"></span>
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('courseApplications')}
            className={`tab-button ${activeTab === 'courseApplications' ? 'active' : ''}`}
          >
            <span className="tab-icon"></span>
            Course Applications
          </button>
          <button 
            onClick={() => setActiveTab('jobApplications')}
            className={`tab-button ${activeTab === 'jobApplications' ? 'active' : ''}`}
          >
            <span className="tab-icon"></span>
            Job Opportunities
          </button>
          <button 
            onClick={() => setActiveTab('myApplications')}
            className={`tab-button ${activeTab === 'myApplications' ? 'active' : ''}`}
          >
            <span className="tab-icon"></span>
            My Applications 
            <span className="application-count">{allApplications.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          >
            <span className="tab-icon"></span>
            Documents
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <span className="tab-icon"></span>
            Profile
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Total Applications</h3>
                  <p className="stat-number">{allApplications.length}</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Course Applications</h3>
                  <p className="stat-number">{courseApplications.length}</p>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Job Applications</h3>
                  <p className="stat-number">{jobApplications.length}</p>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Pending</h3>
                  <p className="stat-number">{pendingApplications.length}</p>
                </div>
              </div>
            </div>

            {/* Application Status Summary */}
            <div className="status-summary">
              <h3>Application Status</h3>
              <div className="status-grid">
                <div className="status-item pending">
                  <div className="status-dot"></div>
                  <div className="status-info">
                    <span className="status-count">{pendingApplications.length}</span>
                    <span className="status-label">Pending</span>
                  </div>
                </div>
                <div className="status-item accepted">
                  <div className="status-dot"></div>
                  <div className="status-info">
                    <span className="status-count">{acceptedApplications.length}</span>
                    <span className="status-label">Accepted</span>
                  </div>
                </div>
                <div className="status-item rejected">
                  <div className="status-dot"></div>
                  <div className="status-info">
                    <span className="status-count">{rejectedApplications.length}</span>
                    <span className="status-label">Rejected</span>
                  </div>
                </div>
                <div className="status-item withdrawn">
                  <div className="status-dot"></div>
                  <div className="status-info">
                    <span className="status-count">{withdrawnApplications.length}</span>
                    <span className="status-label">Withdrawn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-grid">
              <section className="activity-card">
                <div className="card-header">
                  <h3>Recent Applications</h3>
                </div>
                <div className="card-content">
                  {allApplications.slice(0, 5).map(app => (
                    <div key={app.id} className="application-item">
                      <div className="app-main-info">
                        <strong className="app-title">
                          {app.type === 'admission' ? app.courseName : app.jobTitle}
                        </strong>
                        {/* ✅ FIXED: Use safe status rendering */}
                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                      <div className="app-details">
                        <small className="app-institution">
                          {app.type === 'admission' ? app.institutionName : app.company}
                        </small>
                        <small className="app-date">
                          Applied: {formatTimestamp(app.appliedAt)}
                        </small>
                      </div>
                    </div>
                  ))}
                  {allApplications.length === 0 && (
                    <p className="no-data">No applications yet.</p>
                  )}
                </div>
              </section>

              <section className="activity-card">
                <div className="card-header">
                  <h3>Available Opportunities</h3>
                </div>
                <div className="card-content">
                  <div className="opportunity-stats">
                    <div className="opp-stat">
                      <span className="opp-label">Available Courses:</span>
                      <span className="opp-value">{courses.length}</span>
                    </div>
                    <div className="opp-stat">
                      <span className="opp-label">Available Jobs:</span>
                      <span className="opp-value">{jobPostings.length}</span>
                    </div>
                    <div className="opp-stat">
                      <span className="opp-label">Active Admissions:</span>
                      <span className="opp-value">{admissions.filter(a => a.status === 'active').length}</span>
                    </div>
                    <div className="opp-stat">
                      <span className="opp-label">Participating Institutions:</span>
                      <span className="opp-value">{institutions.length}</span>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      onClick={() => setActiveTab('courseApplications')}
                      className="btn btn-primary"
                    >
                      Browse Courses
                    </button>
                    <button 
                      onClick={() => setActiveTab('jobApplications')}
                      className="btn btn-success"
                    >
                      Browse Jobs
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Course Applications Tab */}
        {activeTab === 'courseApplications' && (
          <section className="content-card">
            <div className="card-header">
              <h2>Apply for Courses</h2>
              <div className="selection-counter">
                Selected: <span className="counter">{Object.keys(applications).length}</span>/2 courses
              </div>
            </div>
            
            <div className="institutions-grid">
              {institutions.map(institution => (
                <div key={institution.id} className="institution-card">
                  <div className="institution-header">
                    <h4>{institution.name}</h4>
                    <span className="institution-type">{institution.type}</span>
                  </div>
                  <p className="institution-contact">
                    <strong>Contact:</strong> {institution.contactEmail || 'N/A'}
                  </p>
                  <p className="institution-description">
                    {institution.description || 'No description available.'}
                  </p>
                  
                  <div className="course-selector">
                    <select
                      onChange={(e) => handleSelectCourse(institution.id, e.target.value)}
                      value={applications[institution.id] || ''}
                      className="course-dropdown"
                    >
                      <option value="">Select a course</option>
                      {courses
                        .filter(course => course.institution === institution.name || !course.institution)
                        .map(course => (
                          <option key={course.id} value={course.id}>
                            {course.name} ({course.code}) - {course.duration}
                          </option>
                        ))
                      }
                    </select>
                    {applications[institution.id] && (
                      <span className="selected-badge">Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="action-bar">
              <button 
                onClick={handleCourseApplication}
                disabled={Object.keys(applications).length === 0}
                className={`btn btn-primary ${Object.keys(applications).length === 0 ? 'disabled' : ''}`}
              >
                Submit Course Applications
              </button>
            </div>
          </section>
        )}

        {/* Job Applications Tab */}
        {activeTab === 'jobApplications' && (
          <section className="content-card">
            <div className="card-header">
              <h2>Job Opportunities</h2>
              <span className="job-count">{jobPostings.length} positions available</span>
            </div>
            
            {jobPostings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>No Job Opportunities</h3>
                <p>There are no job opportunities available at the moment.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobPostings.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className={`job-status ${job.status}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="job-company">
                      <strong>Company:</strong> {job.company}
                    </div>
                    <div className="job-details">
                      <div className="job-detail">
                        <span className="detail-label">Qualifications:</span>
                        <span className="detail-value">{job.qualifications}</span>
                      </div>
                      <div className="job-detail">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">{job.experience}</span>
                      </div>
                      <div className="job-detail full-width">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{job.description}</span>
                      </div>
                    </div>
                    <div className="job-footer">
                      <span className="post-date">
                        Posted: {formatTimestamp(job.createdAt)}
                      </span>
                      <button 
                        onClick={() => handleJobApplication(job.id)}
                        className="btn btn-success"
                      >
                        Apply for this Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* My Applications Tab */}
        {activeTab === 'myApplications' && (
          <section className="content-card">
            <div className="card-header">
              <h2>My Applications</h2>
              <span className="total-count">{allApplications.length} total</span>
            </div>
            
            {/* Application Statistics */}
            <div className="application-stats">
              <div className="stat-item pending">
                <div className="stat-number">{pendingApplications.length}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item accepted">
                <div className="stat-number">{acceptedApplications.length}</div>
                <div className="stat-label">Accepted</div>
              </div>
              <div className="stat-item rejected">
                <div className="stat-number">{rejectedApplications.length}</div>
                <div className="stat-label">Rejected</div>
              </div>
              <div className="stat-item withdrawn">
                <div className="stat-number">{withdrawnApplications.length}</div>
                <div className="stat-label">Withdrawn</div>
              </div>
            </div>

            {allApplications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>No Applications Yet</h3>
                <p>You haven't submitted any applications yet. Start by browsing courses or jobs!</p>
              </div>
            ) : (
              <div className="applications-container">
                {/* Course Applications */}
                <div className="application-section">
                  <h3 className="section-title">
                    Course Applications ({courseApplications.length})
                  </h3>
                  <div className="applications-list">
                    {courseApplications.map(app => (
                      <div key={app.id} className={`application-card ${getStatusClass(app.status)}`}>
                        <div className="app-content">
                          <div className="app-main">
                            <h4>{app.courseName}</h4>
                            <p className="app-institution">{app.institutionName}</p>
                            <div className="app-meta">
                              <span className="app-date">
                                Applied: {formatTimestamp(app.appliedAt)}
                              </span>
                              {/* ✅ FIXED: Use safe status rendering */}
                              <span className={`status-badge ${getStatusClass(app.status)}`}>
                                {getStatusText(app.status)}
                              </span>
                            </div>
                          </div>
                          {getStatusText(app.status) === 'pending' && (
                            <button 
                              onClick={() => handleWithdrawApplication(app.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Applications */}
                <div className="application-section">
                  <h3 className="section-title">
                    Job Applications ({jobApplications.length})
                  </h3>
                  <div className="applications-list">
                    {jobApplications.map(app => (
                      <div key={app.id} className={`application-card ${getStatusClass(app.status)}`}>
                        <div className="app-content">
                          <div className="app-main">
                            <h4>{app.jobTitle}</h4>
                            <p className="app-company">{app.company}</p>
                            <div className="app-meta">
                              <span className="app-date">
                                Applied: {formatTimestamp(app.appliedAt)}
                              </span>
                              {/* ✅ FIXED: Use safe status rendering */}
                              <span className={`status-badge ${getStatusClass(app.status)}`}>
                                {getStatusText(app.status)}
                              </span>
                            </div>
                          </div>
                          {getStatusText(app.status) === 'pending' && (
                            <button 
                              onClick={() => handleWithdrawApplication(app.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <section className="content-card">
            <div className="card-header">
              <h2>Upload Documents</h2>
              <button 
                onClick={handleDocumentUpload}
                className="btn btn-primary"
              >
                Upload New Document
              </button>
            </div>
            
            <div className="documents-section">
              <h4>Uploaded Documents ({documents.length})</h4>
              {documents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h3>No Documents Uploaded</h3>
                  <p>Upload your documents to complete your profile.</p>
                </div>
              ) : (
                <div className="documents-grid">
                  {documents.map((doc) => (
                    <div key={doc.id} className="document-card">
                      <div className="doc-icon"></div>
                      <div className="doc-info">
                        <div className="doc-name">{doc.name}</div>
                        <div className="doc-type">{doc.type}</div>
                        <div className="doc-date">
                          Uploaded: {formatTimestamp(doc.uploadedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <section className="content-card">
            <div className="card-header">
              <h2>Student Profile</h2>
            </div>
            
            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div className="documents-section">
                <h4>Uploaded Documents</h4>
                {profile.uploadedDocs.length === 0 ? (
                  <p className="no-docs">No documents uploaded yet.</p>
                ) : (
                  <ul className="docs-list">
                    {profile.uploadedDocs.map((doc, index) => (
                      <li key={index} className="doc-item">
                        {doc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <button 
                onClick={handleProfileUpdate}
                className="btn btn-success"
              >
                Update Profile
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;