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

  // Safe render function to handle all types of values safely
  const safeRender = (value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'object') {
      // If it's a Firestore timestamp
      if (value.seconds && value.nanoseconds !== undefined) {
        return new Date(value.seconds * 1000).toLocaleDateString();
      }
      // If it's an array
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      // For review objects specifically
      if (value.reviewedByName || value.status) {
        return `Reviewed by: ${value.reviewedByName || 'N/A'}, Status: ${value.status || 'N/A'}`;
      }
      // For decision objects
      if (value.decisionStatus || value.comments) {
        return `Decision: ${value.decisionStatus || 'N/A'}, Comments: ${value.comments || 'N/A'}`;
      }
      // For any other objects, return a placeholder or stringify
      try {
        return JSON.stringify(value);
      } catch {
        return 'Object data';
      }
    }
    return String(value);
  };

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

  useEffect(() => {
    fetchData();
  }, [user]);

  // Replace the existing fetchData function with this:
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
      
      // Safely process applications data
      const safeApplications = applicationsData.map(app => ({
        ...app,
        // Ensure nested objects are safely handled
        review: app.review ? {
          reviewedByName: safeRender(app.review.reviewedByName),
          status: safeRender(app.review.status),
          updatedAt: app.review.updatedAt
        } : null,
        decision: app.decision ? {
          decisionStatus: safeRender(app.decision.decisionStatus),
          comments: safeRender(app.decision.comments),
          decisionDate: app.decision.decisionDate
        } : null
      }));
      
      setAllApplications(safeApplications);
      setMyApplications(safeApplications);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Replace the existing handleCourseApplication function with this:
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

      // Refresh applications with safe processing
      const updatedApplications = await getUserApplications(user.uid);
      const safeApplications = updatedApplications.map(app => ({
        ...app,
        review: app.review ? {
          reviewedByName: safeRender(app.review.reviewedByName),
          status: safeRender(app.review.status),
          updatedAt: app.review.updatedAt
        } : null,
        decision: app.decision ? {
          decisionStatus: safeRender(app.decision.decisionStatus),
          comments: safeRender(app.decision.comments),
          decisionDate: app.decision.decisionDate
        } : null
      }));
      
      setMyApplications(safeApplications);
      setAllApplications(safeApplications);

      alert('Applications submitted successfully!');
      setApplications({});
      setActiveTab('myApplications');
    } catch (error) {
      console.error('Error submitting applications:', error);
      alert(`Failed to submit applications: ${error.message}`);
    }
  };

  // Replace the existing handleJobApplication function with this:
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
      
      // Refresh applications with safe processing
      const updatedApplications = await getUserApplications(user.uid);
      const safeApplications = updatedApplications.map(app => ({
        ...app,
        review: app.review ? {
          reviewedByName: safeRender(app.review.reviewedByName),
          status: safeRender(app.review.status),
          updatedAt: app.review.updatedAt
        } : null,
        decision: app.decision ? {
          decisionStatus: safeRender(app.decision.decisionStatus),
          comments: safeRender(app.decision.comments),
          decisionDate: app.decision.decisionDate
        } : null
      }));
      
      setMyApplications(safeApplications);
      setAllApplications(safeApplications);

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

  // Replace the existing handleWithdrawApplication function with this:
  const handleWithdrawApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await updateApplicationStatus(applicationId, 'withdrawn');
        
        // Refresh applications with safe processing
        const updatedApplications = await getUserApplications(user.uid);
        const safeApplications = updatedApplications.map(app => ({
          ...app,
          review: app.review ? {
            reviewedByName: safeRender(app.review.reviewedByName),
            status: safeRender(app.review.status),
            updatedAt: app.review.updatedAt
          } : null,
          decision: app.decision ? {
            decisionStatus: safeRender(app.decision.decisionStatus),
            comments: safeRender(app.decision.comments),
            decisionDate: app.decision.decisionDate
          } : null
        }));
        
        setMyApplications(safeApplications);
        setAllApplications(safeApplications);
        
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
  const pendingApplications = allApplications.filter(app => app.status === 'pending');
  const acceptedApplications = allApplications.filter(app => app.status === 'accepted');
  const rejectedApplications = allApplications.filter(app => app.status === 'rejected');
  const withdrawnApplications = allApplications.filter(app => app.status === 'withdrawn');

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
                          {app.type === 'admission' ? safeRender(app.courseName) : safeRender(app.jobTitle)}
                        </strong>
                        <span className={`status-badge ${app.status}`}>
                          {safeRender(app.status)}
                        </span>
                      </div>
                      <div className="app-details">
                        <small className="app-institution">
                          {app.type === 'admission' ? safeRender(app.institutionName) : safeRender(app.company)}
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
                    <h4>{safeRender(institution.name)}</h4>
                    <span className="institution-type">{safeRender(institution.type)}</span>
                  </div>
                  <p className="institution-contact">
                    <strong>Contact:</strong> {safeRender(institution.contactEmail) || 'N/A'}
                  </p>
                  <p className="institution-description">
                    {safeRender(institution.description) || 'No description available.'}
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
                            {safeRender(course.name)} ({safeRender(course.code)}) - {safeRender(course.duration)}
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
                      <h3>{safeRender(job.title)}</h3>
                      <span className={`job-status ${job.status}`}>
                        {safeRender(job.status)}
                      </span>
                    </div>
                    <div className="job-company">
                      <strong>Company:</strong> {safeRender(job.company)}
                    </div>
                    <div className="job-details">
                      <div className="job-detail">
                        <span className="detail-label">Qualifications:</span>
                        <span className="detail-value">{safeRender(job.qualifications)}</span>
                      </div>
                      <div className="job-detail">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">{safeRender(job.experience)}</span>
                      </div>
                      <div className="job-detail full-width">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{safeRender(job.description)}</span>
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
                      <div key={app.id} className={`application-card ${app.status}`}>
                        <div className="app-content">
                          <div className="app-main">
                            <h4>{safeRender(app.courseName)}</h4>
                            <p className="app-institution">{safeRender(app.institutionName)}</p>
                            <div className="app-meta">
                              <span className="app-date">
                                Applied: {formatTimestamp(app.appliedAt)}
                              </span>
                              <span className={`status-badge ${app.status}`}>
                                {safeRender(app.status)}
                              </span>
                            </div>
                            {/* Display review information if available */}
                            {app.review && (
                              <div className="app-review">
                                <small className="review-info">
                                  {safeRender(app.review)}
                                </small>
                              </div>
                            )}
                            {/* Display decision information if available */}
                            {app.decision && (
                              <div className="app-decision">
                                <small className="decision-info">
                                  {safeRender(app.decision)}
                                </small>
                              </div>
                            )}
                          </div>
                          {app.status === 'pending' && (
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
                      <div key={app.id} className={`application-card ${app.status}`}>
                        <div className="app-content">
                          <div className="app-main">
                            <h4>{safeRender(app.jobTitle)}</h4>
                            <p className="app-company">{safeRender(app.company)}</p>
                            <div className="app-meta">
                              <span className="app-date">
                                Applied: {formatTimestamp(app.appliedAt)}
                              </span>
                              <span className={`status-badge ${app.status}`}>
                                {safeRender(app.status)}
                              </span>
                            </div>
                            {/* Display review information if available */}
                            {app.review && (
                              <div className="app-review">
                                <small className="review-info">
                                  {safeRender(app.review)}
                                </small>
                              </div>
                            )}
                            {/* Display decision information if available */}
                            {app.decision && (
                              <div className="app-decision">
                                <small className="decision-info">
                                  {safeRender(app.decision)}
                                </small>
                              </div>
                            )}
                          </div>
                          {app.status === 'pending' && (
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
                        <div className="doc-name">{safeRender(doc.name)}</div>
                        <div className="doc-type">{safeRender(doc.type)}</div>
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
                        {safeRender(doc)}
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

      <style jsx>{`
        .student-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #40E0D0 0%, #FFDAB9 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #2c3e50;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          border-bottom: 2px solid #40E0D0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #40E0D0, #20B2AA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .user-welcome {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #40E0D0, #20B2AA);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .welcome-text {
          display: flex;
          flex-direction: column;
        }

        .welcome-message {
          margin: 0;
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .user-name {
          margin: 0;
          font-weight: 600;
          color: #2c3e50;
        }

        .dashboard-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 0 2rem;
          border-bottom: 2px solid #FFDAB9;
        }

        .nav-tabs {
          display: flex;
          gap: 0.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 0;
          overflow-x: auto;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #f8f9fa;
          border: 2px solid transparent;
          border-radius: 25px;
          color: #7f8c8d;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-button:hover {
          background: #e9ecef;
          border-color: #40E0D0;
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #40E0D0, #20B2AA);
          color: white;
          border-color: #20B2AA;
          box-shadow: 0 4px 15px rgba(64, 224, 208, 0.4);
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .application-count {
          background: rgba(255, 255, 255, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .dashboard-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          color: #2c3e50;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(64, 224, 208, 0.3);
          border-top: 4px solid #40E0D0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .content-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          border: 2px solid #40E0D0;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(64, 224, 208, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #FFDAB9;
        }

        .card-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-radius: 20px;
          color: white;
          border: 2px solid;
          transition: transform 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #40E0D0, #20B2AA);
          border-color: #20B2AA;
        }

        .stat-card.success {
          background: linear-gradient(135deg, #40E0D0, #48D1CC);
          border-color: #48D1CC;
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #FFDAB9, #FFB6C1);
          border-color: #FFB6C1;
        }

        .stat-card.info {
          background: linear-gradient(135deg, #20B2AA, #008B8B);
          border-color: #008B8B;
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-right: 1rem;
          opacity: 0.9;
        }

        .stat-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .stat-number {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .status-summary {
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          border: 2px solid #FFDAB9;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.2);
        }

        .status-summary h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 15px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .status-item:hover {
          border-color: #40E0D0;
          transform: translateY(-2px);
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .status-item.pending .status-dot { background: #FFD700; }
        .status-item.accepted .status-dot { background: #40E0D0; }
        .status-item.rejected .status-dot { background: #FF6B6B; }
        .status-item.withdrawn .status-dot { background: #95a5a6; }

        .status-info {
          display: flex;
          flex-direction: column;
        }

        .status-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .status-label {
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .activity-card {
          background: white;
          border-radius: 20px;
          border: 2px solid #FFDAB9;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.2);
        }

        .activity-card .card-header {
          background: #FFDAB9;
          padding: 1rem 1.5rem;
          margin: 0;
          border-bottom: 2px solid #40E0D0;
        }

        .activity-card .card-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .card-content {
          padding: 1.5rem;
        }

        .application-item {
          padding: 1rem;
          border-radius: 15px;
          background: #f8f9fa;
          margin-bottom: 1rem;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .application-item:hover {
          border-color: #40E0D0;
          transform: translateY(-2px);
        }

        .app-main-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .app-title {
          color: #2c3e50;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background: #FFF3CD;
          color: #856404;
          border: 1px solid #FFD700;
        }

        .status-badge.accepted {
          background: #D1F2EB;
          color: #155724;
          border: 1px solid #40E0D0;
        }

        .status-badge.rejected {
          background: #F8D7DA;
          color: #721C24;
          border: 1px solid #FF6B6B;
        }

        .status-badge.withdrawn {
          background: #F8F9FA;
          color: #383D41;
          border: 1px solid #95a5a6;
        }

        .app-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .opportunity-stats {
          margin-bottom: 1.5rem;
        }

        .opp-stat {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 2px solid #FFDAB9;
        }

        .opp-stat:last-child {
          border-bottom: none;
        }

        .opp-label {
          color: #7f8c8d;
        }

        .opp-value {
          font-weight: 600;
          color: #2c3e50;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #40E0D0, #20B2AA);
          color: white;
        }

        .btn-success {
          background: linear-gradient(135deg, #40E0D0, #48D1CC);
          color: white;
        }

        .btn-danger {
          background: linear-gradient(135deg, #FFDAB9, #FFB6C1);
          color: #2c3e50;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn.disabled:hover {
          transform: none;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .selection-counter {
          font-size: 1.1rem;
          color: #7f8c8d;
        }

        .counter {
          font-weight: 700;
          color: #40E0D0;
        }

        .institutions-grid {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .institution-card {
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          border: 2px solid #FFDAB9;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.1);
        }

        .institution-card:hover {
          border-color: #40E0D0;
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(64, 224, 208, 0.2);
        }

        .institution-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .institution-header h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .institution-type {
          background: #FFDAB9;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #2c3e50;
        }

        .institution-contact {
          color: #7f8c8d;
          margin-bottom: 0.5rem;
        }

        .institution-description {
          color: #7f8c8d;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .course-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .course-dropdown {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #FFDAB9;
          border-radius: 15px;
          font-size: 1rem;
          background: white;
          transition: border-color 0.3s ease;
        }

        .course-dropdown:focus {
          outline: none;
          border-color: #40E0D0;
        }

        .selected-badge {
          background: #40E0D0;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .action-bar {
          display: flex;
          justify-content: flex-end;
        }

        .job-count {
          background: #FFDAB9;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #2c3e50;
        }

        .jobs-grid {
          display: grid;
          gap: 1.5rem;
        }

        .job-card {
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          border: 2px solid #FFDAB9;
          border-left: 4px solid #40E0D0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.1);
        }

        .job-card:hover {
          transform: translateY(-5px);
          border-color: #40E0D0;
          box-shadow: 0 8px 25px rgba(64, 224, 208, 0.2);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .job-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .job-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .job-status.active {
          background: #D1F2EB;
          color: #155724;
          border: 1px solid #40E0D0;
        }

        .job-status.inactive {
          background: #F8D7DA;
          color: #721C24;
          border: 1px solid #FF6B6B;
        }

        .job-company {
          color: #7f8c8d;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .job-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .job-detail.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          font-weight: 600;
          color: #2c3e50;
          display: block;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          color: #7f8c8d;
          line-height: 1.5;
        }

        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 2px solid #FFDAB9;
        }

        .post-date {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .application-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem;
          border-radius: 20px;
          background: white;
          border: 2px solid #FFDAB9;
          transition: transform 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.1);
        }

        .stat-item:hover {
          transform: translateY(-5px);
          border-color: #40E0D0;
        }

        .stat-item.pending { border-top: 4px solid #FFD700; }
        .stat-item.accepted { border-top: 4px solid #40E0D0; }
        .stat-item.rejected { border-top: 4px solid #FF6B6B; }
        .stat-item.withdrawn { border-top: 4px solid #95a5a6; }

        .stat-item .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .stat-item .stat-label {
          color: #7f8c8d;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
        }

        .applications-container {
          display: grid;
          gap: 2rem;
        }

        .application-section {
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          border: 2px solid #FFDAB9;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.1);
        }

        .section-title {
          margin: 0 0 1.5rem 0;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .applications-list {
          display: grid;
          gap: 1rem;
        }

        .application-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          border: 2px solid #FFDAB9;
          border-left: 4px solid #40E0D0;
          transition: all 0.3s ease;
        }

        .application-card:hover {
          transform: translateX(5px);
          border-color: #40E0D0;
        }

        .application-card.accepted {
          border-left-color: #40E0D0;
        }

        .application-card.rejected {
          border-left-color: #FF6B6B;
        }

        .application-card.withdrawn {
          border-left-color: #95a5a6;
        }

        .app-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .app-main h4 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .app-institution, .app-company {
          color: #7f8c8d;
          margin-bottom: 1rem;
        }

        .app-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .app-date {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .app-review, .app-decision {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 3px solid #40E0D0;
        }

        .review-info, .decision-info {
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        .documents-section h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #7f8c8d;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .empty-state p {
          margin: 0;
          line-height: 1.5;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .document-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 15px;
          border: 2px solid #FFDAB9;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 218, 185, 0.1);
        }

        .document-card:hover {
          border-color: #40E0D0;
          transform: translateY(-5px);
        }

        .doc-icon {
          font-size: 2rem;
          opacity: 0.7;
        }

        .doc-info {
          flex: 1;
        }

        .doc-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .doc-type {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .doc-date {
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        .profile-form {
          max-width: 500px;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #FFDAB9;
          border-radius: 15px;
          font-size: 1rem;
          background: white;
          transition: border-color 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #40E0D0;
        }

        .docs-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
        }

        .doc-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 10px;
          margin-bottom: 0.5rem;
          border-left: 3px solid #40E0D0;
          color: #2c3e50;
        }

        .no-docs {
          color: #7f8c8d;
          font-style: italic;
        }

        .no-data {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          padding: 2rem;
        }

        .total-count {
          background: #40E0D0;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .activity-grid {
            grid-template-columns: 1fr;
          }

          .application-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .nav-tabs {
            flex-wrap: wrap;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .action-buttons {
            flex-direction: column;
          }

          .app-content {
            flex-direction: column;
            gap: 1rem;
          }

          .app-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .job-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;