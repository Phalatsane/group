// src/pages/InstituteDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getFaculties, 
  addFaculty, 
  updateFaculty,
  deleteFaculty,
  getCourses, 
  addCourse, 
  updateCourse,
  deleteCourse,
  getApplications,
  updateApplicationStatus,
  addAdmission,
  getAdmissions,
  updateAdmission,
  deleteAdmission,
  getInstitutions,
  addInstitution,
  updateInstitution
} from '../services/firebaseService';

const InstituteDashboard = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [facultiesData, coursesData, applicationsData, admissionsData, institutionsData] = await Promise.all([
          getFaculties(),
          getCourses(),
          getApplications(),
          getAdmissions(),
          getInstitutions()
        ]);
        
        setFaculties(facultiesData);
        setCourses(coursesData);
        setApplications(applicationsData.filter(app => app.type === 'admission'));
        setAdmissions(admissionsData);
        
        // Find the institution associated with the current user
        const userInstitution = institutionsData.find(inst => 
          inst.createdBy === user.uid || 
          inst.email === user.email ||
          inst.name?.toLowerCase().includes(user.name?.toLowerCase())
        );
        setInstitution(userInstitution);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(`Error loading data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Institution Profile Management
  const handleCreateInstitutionProfile = async () => {
    const name = prompt('Institution Name:');
    const code = prompt('Institution Code:');
    const type = prompt('Institution Type (University/College/School):', 'University');
    const description = prompt('Institution Description:');
    const contactEmail = prompt('Contact Email:', user.email);
    const phone = prompt('Phone Number:');
    const address = prompt('Address:');
    const website = prompt('Website:');
    
    if (name && code) {
      try {
        const newInstitution = await addInstitution({
          name,
          code,
          type: type || 'University',
          description: description || '',
          contactEmail: contactEmail || user.email,
          phone: phone || '',
          address: address || '',
          website: website || '',
          status: 'active',
          createdBy: user.uid,
          createdByName: user.name,
          createdAt: new Date().toISOString()
        });
        setInstitution(newInstitution);
        alert('Institution profile created successfully!');
      } catch (error) {
        console.error('Error creating institution profile:', error);
        alert(`Failed to create institution profile: ${error.message}`);
      }
    }
  };

  const handleUpdateInstitutionProfile = async () => {
    if (!institution) {
      handleCreateInstitutionProfile();
      return;
    }

    const name = prompt('Institution Name:', institution.name);
    const code = prompt('Institution Code:', institution.code);
    const type = prompt('Institution Type:', institution.type);
    const description = prompt('Institution Description:', institution.description);
    const contactEmail = prompt('Contact Email:', institution.contactEmail);
    const phone = prompt('Phone Number:', institution.phone);
    const address = prompt('Address:', institution.address);
    const website = prompt('Website:', institution.website);
    const status = prompt('Status (active/inactive):', institution.status);
    
    if (name && code) {
      try {
        await updateInstitution(institution.id, {
          name,
          code,
          type,
          description,
          contactEmail,
          phone,
          address,
          website,
          status,
          updatedAt: new Date().toISOString()
        });
        
        setInstitution(prev => ({
          ...prev,
          name,
          code,
          type,
          description,
          contactEmail,
          phone,
          address,
          website,
          status
        }));
        
        alert('Institution profile updated successfully!');
      } catch (error) {
        console.error('Error updating institution profile:', error);
        alert(`Failed to update institution profile: ${error.message}`);
      }
    }
  };

  // Faculties Management
  const handleAddFaculty = async () => {
    if (!institution) {
      alert('Please create an institution profile first!');
      setActiveTab('profile');
      return;
    }

    const name = prompt('Faculty Name:');
    const code = prompt('Faculty Code:');
    const description = prompt('Faculty Description:');
    if (name && code) {
      try {
        const newFaculty = await addFaculty({ 
          name, 
          code, 
          description: description || '',
          status: 'active',
          institution: institution.name,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
          createdByName: user.name
        });
        setFaculties(prev => [...prev, newFaculty]);
        alert('Faculty added successfully!');
      } catch (error) {
        console.error('Error adding faculty:', error);
        alert(`Failed to add faculty: ${error.message}`);
      }
    }
  };

  const handleUpdateFaculty = async (faculty) => {
    const name = prompt('Faculty Name:', faculty.name);
    const code = prompt('Faculty Code:', faculty.code);
    const description = prompt('Faculty Description:', faculty.description);
    const status = prompt('Status (active/inactive):', faculty.status);
    
    if (name && code) {
      try {
        await updateFaculty(faculty.id, { 
          name, 
          code, 
          description,
          status,
          updatedAt: new Date().toISOString()
        });
        setFaculties(prev => prev.map(f => 
          f.id === faculty.id ? { ...f, name, code, description, status } : f
        ));
        alert('Faculty updated successfully!');
      } catch (error) {
        console.error('Error updating faculty:', error);
        alert(`Failed to update faculty: ${error.message}`);
      }
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        await deleteFaculty(id);
        setFaculties(prev => prev.filter(f => f.id !== id));
        alert('Faculty deleted successfully!');
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert(`Failed to delete faculty: ${error.message}`);
      }
    }
  };

  // Courses Management
  const handleAddCourse = async () => {
    if (!institution) {
      alert('Please create an institution profile first!');
      setActiveTab('profile');
      return;
    }

    const name = prompt('Course Name:');
    const code = prompt('Course Code:');
    const duration = prompt('Duration (e.g., 4 years):');
    const faculty = prompt('Faculty:');
    const description = prompt('Course Description:');
    const credits = prompt('Credits:');
    if (name && code) {
      try {
        const newCourse = await addCourse({ 
          name, 
          code, 
          duration: duration || '4 years', 
          faculty: faculty || 'General',
          description: description || '',
          credits: credits || '0',
          institution: institution.name,
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
          createdByName: user.name
        });
        setCourses(prev => [...prev, newCourse]);
        alert('Course added successfully!');
      } catch (error) {
        console.error('Error adding course:', error);
        alert(`Failed to add course: ${error.message}`);
      }
    }
  };

  const handleUpdateCourse = async (course) => {
    const name = prompt('Course Name:', course.name);
    const code = prompt('Course Code:', course.code);
    const duration = prompt('Duration:', course.duration);
    const faculty = prompt('Faculty:', course.faculty);
    const description = prompt('Course Description:', course.description);
    const credits = prompt('Credits:', course.credits);
    const status = prompt('Status (active/inactive):', course.status);
    
    if (name && code) {
      try {
        await updateCourse(course.id, { 
          name, 
          code, 
          duration, 
          faculty,
          description,
          credits,
          status,
          updatedAt: new Date().toISOString()
        });
        setCourses(prev => prev.map(c => 
          c.id === course.id ? { ...c, name, code, duration, faculty, description, credits, status } : c
        ));
        alert('Course updated successfully!');
      } catch (error) {
        console.error('Error updating course:', error);
        alert(`Failed to update course: ${error.message}`);
      }
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
        alert('Course deleted successfully!');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert(`Failed to delete course: ${error.message}`);
      }
    }
  };

  // Admissions Management
  const handlePublishAdmission = async () => {
    if (!institution) {
      alert('Please create an institution profile first!');
      setActiveTab('profile');
      return;
    }

    try {
      const title = prompt('Admission Title:', `Admission Cycle ${new Date().getFullYear()}`);
      const description = prompt('Admission Description:');
      const deadline = prompt('Application Deadline (YYYY-MM-DD):', 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      const requirements = prompt('Requirements (comma separated):');
      const availableSeats = prompt('Available Seats:');
      
      if (!title) return;

      const admissionData = {
        title,
        description: description || '',
        requirements: requirements ? requirements.split(',') : [],
        deadline,
        availableSeats: parseInt(availableSeats) || 0,
        publishedBy: user.uid,
        publishedByName: user.name,
        publishedAt: new Date().toISOString(),
        status: 'active',
        published: true,
        institution: institution.name,
        institutionId: institution.id
      };
      
      const newAdmission = await addAdmission(admissionData);
      setAdmissions(prev => [...prev, newAdmission]);
      alert('Admission published successfully!');
    } catch (error) {
      console.error('Error publishing admission:', error);
      alert(`Failed to publish admission: ${error.message}`);
    }
  };

  const handleUpdateAdmission = async (admission) => {
    const title = prompt('Admission Title:', admission.title);
    const description = prompt('Admission Description:', admission.description);
    const status = prompt('Status (active/inactive):', admission.status);
    const published = window.confirm('Published?') ? true : false;
    const availableSeats = prompt('Available Seats:', admission.availableSeats);
    
    if (title && description) {
      try {
        await updateAdmission(admission.id, {
          title,
          description,
          status,
          published,
          availableSeats: parseInt(availableSeats) || 0,
          updatedAt: new Date().toISOString()
        });
        
        setAdmissions(prev => prev.map(a => 
          a.id === admission.id ? { ...a, title, description, status, published, availableSeats } : a
        ));
        
        alert('Admission updated successfully!');
      } catch (error) {
        console.error('Error updating admission:', error);
        alert(`Failed to update admission: ${error.message}`);
      }
    }
  };

  const handleDeleteAdmission = async (id) => {
    if (window.confirm('Are you sure you want to delete this admission?')) {
      try {
        await deleteAdmission(id);
        setAdmissions(prev => prev.filter(a => a.id !== id));
        alert('Admission deleted successfully!');
      } catch (error) {
        console.error('Error deleting admission:', error);
        alert(`Failed to delete admission: ${error.message}`);
      }
    }
  };

  // Application Management
  const handleApplicationDecision = async (applicationId, decision) => {
    try {
      await updateApplicationStatus(applicationId, decision);
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: decision } : app
        )
      );
      alert(`Application ${decision} successfully!`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert(`Failed to update application: ${error.message}`);
    }
  };

  // Filter applications by status
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Institute Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="institute-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Institute Dashboard</h1>
          <div className="user-welcome">
            <div className="welcome-avatar">
              {user?.name?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="welcome-text">
              <p className="welcome-message">Welcome back,</p>
              <p className="user-name">{user?.name || user?.displayName || user?.email}</p>
              {institution && (
                <p className="institution-info">
                  {institution.name} • {institution.type}
                </p>
              )}
            </div>
          </div>
        </div>
        {!institution && (
          <div className="alert alert-warning">
            <strong> Setup Required:</strong> Please create your institution profile to access all features.
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          {[
            { key: 'overview', label: 'Overview', icon: '', count: null },
            { key: 'faculties', label: 'Faculties', icon: '', count: faculties.length },
            { key: 'courses', label: 'Courses', icon: '', count: courses.length },
            { key: 'admissions', label: 'Admissions', icon: '', count: admissions.length },
            { key: 'applications', label: 'Applications', icon: '', count: applications.length },
            { key: 'profile', label: 'Institution Profile', icon: '', count: institution ? 1 : 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
              {tab.count !== null && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {!institution && (
              <div className="alert alert-warning">
                <div className="alert-content">
                  <div>
                    <h3>🎓 Welcome to Your Institute Dashboard!</h3>
                    <p>To get started, please set up your institution profile first.</p>
                  </div>
                  <button 
                    onClick={handleCreateInstitutionProfile}
                    className="btn btn-success"
                  >
                    🏛️ Setup Institution Profile
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🎓</div>
                <div className="stat-content">
                  <h3>Faculties</h3>
                  <p className="stat-number">{faculties.length}</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Courses</h3>
                  <p className="stat-number">{courses.length}</p>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Active Admissions</h3>
                  <p className="stat-number">{admissions.filter(a => a.status === 'active').length}</p>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Applications</h3>
                  <p className="stat-number">{applications.length}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-grid">
              {/* Recent Applications */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Recent Applications</h3>
                </div>
                <div className="card-content">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="data-item">
                      <div className="item-header">
                        <strong>{app.studentName || 'Unknown Student'}</strong>
                        <span className={`status-badge ${app.status}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="item-detail">{app.courseName}</p>
                      <small className="item-meta">
                        Applied: {formatTimestamp(app.createdAt)}
                      </small>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div className="empty-state">
                      No applications yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Admissions */}
              <div className="content-card">
                <div className="card-header">
                  <h3>Recent Admissions</h3>
                </div>
                <div className="card-content">
                  {admissions.slice(0, 5).map(admission => (
                    <div key={admission.id} className="data-item">
                      <div className="item-header">
                        <strong>{admission.title}</strong>
                        <span className={`status-badge ${admission.status}`}>
                          {admission.status}
                        </span>
                      </div>
                      <p className="item-detail">{admission.description}</p>
                      <div className="item-footer">
                        <small>Seats: {admission.availableSeats}</small>
                        <small>{formatTimestamp(admission.publishedAt)}</small>
                      </div>
                    </div>
                  ))}
                  {admissions.length === 0 && (
                    <div className="empty-state">
                      No admissions published yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Faculties Management Tab */}
        {activeTab === 'faculties' && (
          <div className="content-card">
            <div className="card-header">
              <h2>Manage Faculties</h2>
              <span className="badge badge-primary">{faculties.length} Faculties</span>
            </div>

            {!institution ? (
              <div className="alert alert-warning">
                <div className="alert-content">
                  <div>
                    <h4>Institution Profile Required</h4>
                    <p>Please set up your institution profile first to manage faculties.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-primary"
                  >
                     Go to Institution Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={handleAddFaculty} 
                  className="btn btn-success"
                >
                   Add Faculty
                </button>
                
                <div className="data-grid">
                  {faculties.length === 0 ? (
                    <div className="empty-state">
                      <h3>No faculties added yet</h3>
                      <p>Start by adding your first faculty!</p>
                    </div>
                  ) : (
                    faculties.map(f => (
                      <div key={f.id} className="data-item">
                        <div className="item-header">
                          <h4>{f.name} <span className="item-code">({f.code})</span></h4>
                          <span className={`status-badge ${f.status}`}>
                            {f.status}
                          </span>
                        </div>
                        <p className="item-detail">{f.description}</p>
                        <div className="item-footer">
                          <small>Created: {formatTimestamp(f.createdAt)}</small>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleUpdateFaculty(f)}
                              className="btn btn-primary btn-sm"
                            >
                               Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteFaculty(f.id)} 
                              className="btn btn-danger btn-sm"
                            >
                               Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Courses Management Tab */}
        {activeTab === 'courses' && (
          <div className="content-card">
            <div className="card-header">
              <h2>Manage Courses</h2>
              <span className="badge badge-primary">{courses.length} Courses</span>
            </div>

            {!institution ? (
              <div className="alert alert-warning">
                <div className="alert-content">
                  <div>
                    <h4>Institution Profile Required</h4>
                    <p>Please set up your institution profile first to manage courses.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-primary"
                  >
                    🏛️ Go to Institution Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={handleAddCourse} 
                  className="btn btn-success"
                >
                   Add Course
                </button>
                
                <div className="data-grid">
                  {courses.length === 0 ? (
                    <div className="empty-state">
                      <h3>No courses added yet</h3>
                      <p>Start by adding your first course!</p>
                    </div>
                  ) : (
                    courses.map(c => (
                      <div key={c.id} className="data-item">
                        <div className="item-header">
                          <h4>{c.name} <span className="item-code">({c.code})</span></h4>
                          <span className={`status-badge ${c.status}`}>
                            {c.status}
                          </span>
                        </div>
                        
                        <div className="item-badges">
                          <span className="badge badge-info">Duration: {c.duration}</span>
                          <span className="badge badge-info">Faculty: {c.faculty}</span>
                          <span className="badge badge-info">Credits: {c.credits}</span>
                        </div>
                        
                        <p className="item-detail">{c.description}</p>
                        
                        <div className="item-footer">
                          <small>Created: {formatTimestamp(c.createdAt)}</small>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleUpdateCourse(c)}
                              className="btn btn-primary btn-sm"
                            >
                               Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(c.id)} 
                              className="btn btn-danger btn-sm"
                            >
                               Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Admissions Management Tab */}
        {activeTab === 'admissions' && (
          <div className="content-card">
            <div className="card-header">
              <h2>Manage Admissions</h2>
              <span className="badge badge-primary">{admissions.length} Admissions</span>
            </div>

            {!institution ? (
              <div className="alert alert-warning">
                <div className="alert-content">
                  <div>
                    <h4>Institution Profile Required</h4>
                    <p>Please set up your institution profile first to publish admissions.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-primary"
                  >
                     Go to Institution Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={handlePublishAdmission} 
                  className="btn btn-success"
                >
                   Publish New Admission
                </button>
                
                <div className="data-grid">
                  {admissions.length === 0 ? (
                    <div className="empty-state">
                      <h3>No admissions published yet</h3>
                      <p>Start by publishing your first admission cycle!</p>
                    </div>
                  ) : (
                    admissions.map(admission => (
                      <div key={admission.id} className="data-item">
                        <div className="item-header">
                          <h4>{admission.title}</h4>
                          <div className="status-group">
                            <span className={`status-badge ${admission.status}`}>
                              {admission.status}
                            </span>
                            <span className={`status-badge ${admission.published ? 'active' : 'inactive'}`}>
                              {admission.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="item-detail">{admission.description}</p>
                        
                        <div className="item-badges">
                          <span className="badge badge-warning">Deadline: {formatTimestamp(admission.deadline)}</span>
                          <span className="badge badge-warning">Seats: {admission.availableSeats}</span>
                        </div>
                        
                        {admission.requirements && admission.requirements.length > 0 && (
                          <div className="requirements-section">
                            <strong>Requirements:</strong>
                            <div className="requirements-list">
                              {admission.requirements.map((req, index) => (
                                <span key={index} className="badge badge-secondary">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="item-footer">
                          <small>Published: {formatTimestamp(admission.publishedAt)}</small>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleUpdateAdmission(admission)}
                              className="btn btn-primary btn-sm"
                            >
                               Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAdmission(admission.id)} 
                              className="btn btn-danger btn-sm"
                            >
                               Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Applications Management Tab */}
        {activeTab === 'applications' && (
          <div className="content-card">
            <div className="card-header">
              <h2>Student Applications</h2>
              <span className="badge badge-primary">{applications.length} Applications</span>
            </div>

            {/* Application Statistics */}
            <div className="stats-grid">
              <div className="stat-card warning">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h4>Pending</h4>
                  <p className="stat-number">{pendingApplications.length}</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h4>Accepted</h4>
                  <p className="stat-number">{acceptedApplications.length}</p>
                </div>
              </div>
              <div className="stat-card danger">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h4>Rejected</h4>
                  <p className="stat-number">{rejectedApplications.length}</p>
                </div>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <h3>No applications received yet</h3>
                <p>Applications will appear here when students apply to your courses.</p>
              </div>
            ) : (
              <div>
                {/* Pending Applications */}
                {pendingApplications.length > 0 && (
                  <div className="application-section">
                    <h3>Pending Applications ({pendingApplications.length})</h3>
                    <div className="data-grid">
                      {pendingApplications.map(app => (
                        <div key={app.id} className="data-item pending">
                          <h4>{app.studentName || 'Unknown Student'}</h4>
                          <p><strong>Course:</strong> {app.courseName}</p>
                          <p><strong>Email:</strong> {app.studentEmail}</p>
                          <small>Applied: {formatTimestamp(app.createdAt)}</small>
                          
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleApplicationDecision(app.id, 'accepted')}
                              className="btn btn-success"
                            >
                               Accept
                            </button>
                            <button 
                              onClick={() => handleApplicationDecision(app.id, 'rejected')}
                              className="btn btn-danger"
                            >
                               Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Applications */}
                {acceptedApplications.length > 0 && (
                  <div className="application-section">
                    <h3>Accepted Applications ({acceptedApplications.length})</h3>
                    <div className="data-grid">
                      {acceptedApplications.map(app => (
                        <div key={app.id} className="data-item accepted">
                          <h4>{app.studentName || 'Unknown Student'}</h4>
                          <p><strong>Course:</strong> {app.courseName}</p>
                          <p><strong>Email:</strong> {app.studentEmail}</p>
                          <small>Applied: {formatTimestamp(app.createdAt)}</small>
                          <div className="status-badge accepted"> Accepted</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Applications */}
                {rejectedApplications.length > 0 && (
                  <div className="application-section">
                    <h3>Rejected Applications ({rejectedApplications.length})</h3>
                    <div className="data-grid">
                      {rejectedApplications.map(app => (
                        <div key={app.id} className="data-item rejected">
                          <h4>{app.studentName || 'Unknown Student'}</h4>
                          <p><strong>Course:</strong> {app.courseName}</p>
                          <p><strong>Email:</strong> {app.studentEmail}</p>
                          <small>Applied: {formatTimestamp(app.createdAt)}</small>
                          <div className="status-badge rejected"> Rejected</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Institution Profile Tab */}
        {activeTab === 'profile' && (
          <div className="content-card">
            <h2>Institution Profile</h2>
            
            {institution ? (
              <div>
                <div className="profile-info">
                  <h3>Current Profile Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong>
                      <span>{institution.name}</span>
                    </div>
                    <div className="info-item">
                      <strong>Code:</strong>
                      <span>{institution.code}</span>
                    </div>
                    <div className="info-item">
                      <strong>Type:</strong>
                      <span>{institution.type}</span>
                    </div>
                    <div className="info-item">
                      <strong>Status:</strong>
                      <span className={`status-badge ${institution.status}`}>
                        {institution.status}
                      </span>
                    </div>
                    <div className="info-item full-width">
                      <strong>Description:</strong>
                      <span>{institution.description}</span>
                    </div>
                    <div className="info-item">
                      <strong>Contact Email:</strong>
                      <span>{institution.contactEmail}</span>
                    </div>
                    <div className="info-item">
                      <strong>Phone:</strong>
                      <span>{institution.phone}</span>
                    </div>
                    <div className="info-item">
                      <strong>Address:</strong>
                      <span>{institution.address}</span>
                    </div>
                    <div className="info-item">
                      <strong>Website:</strong>
                      <span>{institution.website}</span>
                    </div>
                  </div>
                  <div className="profile-meta">
                    <small>Created: {formatTimestamp(institution.createdAt)}</small>
                  </div>
                </div>

                <button 
                  onClick={handleUpdateInstitutionProfile}
                  className="btn btn-primary"
                >
                   Update Institution Profile
                </button>
              </div>
            ) : (
              <div className="setup-profile">
                <div className="setup-icon"></div>
                <h3>Create Your Institution Profile</h3>
                <p>
                  To start using the Institute Dashboard, please create your institution profile first.
                </p>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon"></div>
                    <strong>Manage Faculties</strong>
                    <p>Create and organize academic departments</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon"></div>
                    <strong>Manage Courses</strong>
                    <p>Add and update academic programs</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon"></div>
                    <strong>Publish Admissions</strong>
                    <p>Launch admission cycles and manage applications</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon"></div>
                    <strong>Track Performance</strong>
                    <p>Monitor applications and institutional metrics</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleCreateInstitutionProfile}
                  className="btn btn-success btn-large"
                >
                   Create Institution Profile
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .institute-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #228B22 0%, #8B4513 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #2c3e50;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          border-bottom: 2px solid #228B22;
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
          background: linear-gradient(135deg, #228B22, #006400);
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
          background: linear-gradient(135deg, #228B22, #006400);
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

        .institution-info {
          margin: 0;
          font-size: 0.8rem;
          color: #228B22;
          font-weight: 500;
        }

        .dashboard-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 0 2rem;
          border-bottom: 2px solid #8B4513;
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
          border-color: #228B22;
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #228B22, #006400);
          color: white;
          border-color: #006400;
          box-shadow: 0 4px 15px rgba(34, 139, 34, 0.4);
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .tab-count {
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
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
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
          border: 2px solid #228B22;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(34, 139, 34, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #8B4513;
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
          background: linear-gradient(135deg, #228B22, #006400);
          border-color: #006400;
        }

        .stat-card.success {
          background: linear-gradient(135deg, #32CD32, #228B22);
          border-color: #228B22;
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #8B4513, #A0522D);
          border-color: #A0522D;
        }

        .stat-card.info {
          background: linear-gradient(135deg, #90EE90, #32CD32);
          border-color: #32CD32;
          color: #2c3e50;
        }

        .stat-card.danger {
          background: linear-gradient(135deg, #CD5C5C, #B22222);
          border-color: #B22222;
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-right: 1rem;
          opacity: 0.9;
        }

        .stat-content h3, .stat-content h4 {
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

        .activity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .data-item {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 1.5rem;
          border-radius: 15px;
          border: 2px solid #dee2e6;
          transition: all 0.3s ease;
        }

        .data-item:hover {
          transform: translateY(-2px);
          border-color: #228B22;
          box-shadow: 0 4px 15px rgba(34, 139, 34, 0.1);
        }

        .data-item.pending {
          border-left: 4px solid #8B4513;
          background: linear-gradient(135deg, #FFF3CD, #FFEAA7);
        }

        .data-item.accepted {
          border-left: 4px solid #228B22;
          background: linear-gradient(135deg, #D1F2EB, #A3E4D7);
        }

        .data-item.rejected {
          border-left: 4px solid #CD5C5C;
          background: linear-gradient(135deg, #FADBD8, #F5B7B1);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .item-header h4 {
          margin: 0;
          color: #2c3e50;
        }

        .item-code {
          color: #7f8c8d;
          font-weight: normal;
        }

        .item-detail {
          margin: 0 0 1rem 0;
          color: #5a6c7d;
          line-height: 1.5;
        }

        .item-meta {
          color: #7f8c8d;
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }

        .item-badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .status-group {
          display: flex;
          gap: 0.5rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background: #8B4513;
          color: white;
        }

        .status-badge.active {
          background: #228B22;
          color: white;
        }

        .status-badge.inactive {
          background: #CD5C5C;
          color: white;
        }

        .status-badge.accepted {
          background: #228B22;
          color: white;
        }

        .status-badge.rejected {
          background: #CD5C5C;
          color: white;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge-primary {
          background: #D4EDDA;
          color: #155724;
        }

        .badge-success {
          background: #D1F2EB;
          color: #0E6251;
        }

        .badge-warning {
          background: #FDEBD0;
          color: #7E5109;
        }

        .badge-danger {
          background: #FADBD8;
          color: #78281F;
        }

        .badge-info {
          background: #D6EAF8;
          color: #1B4F72;
        }

        .badge-secondary {
          background: #E8E8E8;
          color: #515A5A;
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
          background: linear-gradient(135deg, #228B22, #006400);
          color: white;
        }

        .btn-success {
          background: linear-gradient(135deg, #32CD32, #228B22);
          color: white;
        }

        .btn-danger {
          background: linear-gradient(135deg, #CD5C5C, #B22222);
          color: white;
        }

        .btn-warning {
          background: linear-gradient(135deg, #8B4513, #A0522D);
          color: white;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .alert {
          padding: 1.5rem;
          border-radius: 15px;
          margin-bottom: 1.5rem;
          border: 2px solid;
        }

        .alert-warning {
          background: linear-gradient(135deg, #FFF3CD, #FFEAA7);
          border-color: #FFD700;
          color: #856404;
        }

        .alert-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #7f8c8d;
        }

        .empty-state h3 {
          margin: 0 0 1rem 0;
          color: #95a5a6;
        }

        .application-section {
          margin-bottom: 2rem;
        }

        .application-section h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .requirements-section {
          margin-bottom: 1rem;
        }

        .requirements-list {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .profile-info {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          border: 2px solid #dee2e6;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-item strong {
          color: #2c3e50;
          font-weight: 600;
        }

        .info-item span {
          color: #5a6c7d;
        }

        .profile-meta {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }

        .setup-profile {
          text-align: center;
          padding: 3rem 2rem;
        }

        .setup-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .setup-profile h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .setup-profile p {
          margin: 0 0 2rem 0;
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .feature-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid #228B22;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .feature-card strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .feature-card p {
          margin: 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .activity-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
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

          .alert-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .action-buttons {
            flex-direction: column;
          }

          .item-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default InstituteDashboard;