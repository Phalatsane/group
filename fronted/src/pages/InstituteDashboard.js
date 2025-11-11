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

import './InstututeDashboard.css'

const InstituteDashboard = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Professional CSS Styles
  const styles = {
    // Main container
    container: {
      padding: '30px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    
    // Header
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '16px',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
    },
    
    // Navigation Tabs
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '30px',
      background: 'white',
      padding: '8px',
      borderRadius: '12px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
      flexWrap: 'wrap'
    },
    
    tabButton: {
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      background: 'transparent',
      color: '#64748b',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      whiteSpace: 'nowrap'
    },
    
    tabButtonActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    
    // Cards
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
    },
    
    // Stats Grid
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    
    statCard: {
      padding: '25px',
      borderRadius: '16px',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      transition: 'transform 0.3s ease'
    },
    
    statCardHover: {
      transform: 'scale(1.05)'
    },
    
    // Buttons
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    buttonPrimary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    
    buttonSuccess: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
    },
    
    buttonDanger: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
    },
    
    buttonWarning: {
      background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(255, 216, 155, 0.4)'
    },
    
    buttonInfo: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      color: '#2d3748',
      boxShadow: '0 4px 15px rgba(168, 237, 234, 0.4)'
    },
    
    // Loading
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '18px',
      color: '#64748b'
    },
    
    // Data Items
    dataItem: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      margin: '15px 0',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    
    dataItemHover: {
      transform: 'translateX(5px)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    
    // Status Indicators
    statusActive: {
      background: '#10b981',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    statusInactive: {
      background: '#ef4444',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    statusPending: {
      background: '#f59e0b',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    // Badges
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      margin: '2px'
    },
    
    badgePrimary: {
      background: '#dbeafe',
      color: '#1e40af'
    },
    
    badgeSuccess: {
      background: '#d1fae5',
      color: '#065f46'
    },
    
    badgeWarning: {
      background: '#fef3c7',
      color: '#92400e'
    },
    
    badgeDanger: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    
    // Grid Layouts
    gridAuto: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    
    // Section Headers
    sectionHeader: {
      color: '#334155',
      marginBottom: '20px',
      fontSize: '1.5rem',
      fontWeight: '700'
    },
    
    // Alert Styles
    alert: {
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '25px',
      border: '1px solid',
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      borderColor: '#ffeaa7'
    },
    
    alertSuccess: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      borderColor: '#a7f3d0'
    },
    
    alertInfo: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
      borderColor: '#93c5fd'
    }
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
  // In your InstituteDashboard.js, update the handleCreateInstitutionProfile function:

const handleCreateInstitutionProfile = async () => {
  try {
    const name = prompt('Institution Name:');
    if (!name) return;

    const code = prompt('Institution Code:');
    const type = prompt('Institution Type (University/College/School):', 'University');
    const description = prompt('Institution Description:');
    const contactEmail = prompt('Contact Email:', user.email);
    const phone = prompt('Phone Number:');
    const address = prompt('Address:');
    const website = prompt('Website:');
    
    if (name && code) {
      console.log('Creating institution with data:', {
        name, code, type, description, contactEmail, phone, address, website
      });

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
      
      console.log('Institution created successfully:', newInstitution);
      setInstitution(newInstitution);
      alert('Institution profile created successfully!');
    }
  } catch (error) {
    console.error('Error creating institution profile:', error);
    alert(`Failed to create institution profile: ${error.message}`);
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
    return <div style={styles.loading}>Loading Institute Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>Institute Dashboard</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
          Welcome back, <strong>{user?.name}</strong>
          {institution && (
            <span style={{ display: 'block', marginTop: '5px', fontSize: '1rem' }}>
              {institution.name} • {institution.type}
            </span>
          )}
        </p>
        {!institution && (
          <div style={{ 
            ...styles.alert,
            marginTop: '20px',
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'
          }}>
            <strong> Setup Required:</strong> Please create your institution profile to access all features.
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', count: null },
          { key: 'faculties', label: 'Faculties', count: faculties.length },
          { key: 'courses', label: 'Courses', count: courses.length },
          { key: 'admissions', label: 'Admissions', count: admissions.length },
          { key: 'applications', label: 'Applications', count: applications.length },
          { key: 'profile', label: 'Institution Profile', count: institution ? 1 : 0 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.key ? styles.tabButtonActive : {})
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <span style={{ 
                marginLeft: '8px', 
                background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                color: activeTab === tab.key ? 'white' : '#64748b',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {!institution && (
            <div style={styles.alert}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>🎓 Welcome to Your Institute Dashboard!</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#92400e' }}>
                    To get started, please set up your institution profile first.
                  </p>
                </div>
                <button 
                  onClick={handleCreateInstitutionProfile}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess
                  }}
                >
                   Setup Institution Profile
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Faculties</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{faculties.length}</p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Courses</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{courses.length}</p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Active Admissions</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                {admissions.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#2d3748'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Applications</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{applications.length}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
            {/* Recent Applications */}
            <div style={styles.card}>
              <h3 style={styles.sectionHeader}>Recent Applications</h3>
              {applications.slice(0, 5).map(app => (
                <div key={app.id} style={styles.dataItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong style={{ color: '#1e293b' }}>{app.studentName || 'Unknown Student'}</strong>
                    <span style={{ 
                      ...styles.badge,
                      background: app.status === 'accepted' ? '#10b981' : 
                                 app.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      color: 'white'
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>{app.courseName}</p>
                  <small style={{ color: '#94a3b8' }}>
                    Applied: {formatTimestamp(app.createdAt)}
                  </small>
                </div>
              ))}
              {applications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No applications yet.
                </div>
              )}
            </div>

            {/* Recent Admissions */}
            <div style={styles.card}>
              <h3 style={styles.sectionHeader}>Recent Admissions</h3>
              {admissions.slice(0, 5).map(admission => (
                <div key={admission.id} style={styles.dataItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong style={{ color: '#1e293b' }}>{admission.title}</strong>
                    <span style={admission.status === 'active' ? styles.statusActive : styles.statusInactive}>
                      {admission.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>
                    {admission.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#94a3b8' }}>
                      Seats: {admission.availableSeats}
                    </small>
                    <small style={{ color: '#94a3b8' }}>
                      {formatTimestamp(admission.publishedAt)}
                    </small>
                  </div>
                </div>
              ))}
              {admissions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No admissions published yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Faculties Management Tab */}
      {activeTab === 'faculties' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}>Manage Faculties</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {faculties.length} Faculties
            </span>
          </div>

          {!institution ? (
            <div style={styles.alert}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Institution Profile Required</h4>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    Please set up your institution profile first to manage faculties.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('profile')}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary
                  }}
                >
                   Go to Institution Profile
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={handleAddFaculty} 
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess
                }}
              >
                ➕ Add Faculty
              </button>
              
              <div style={{ marginTop: '25px' }}>
                {faculties.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <h3 style={{ color: '#94a3b8' }}>No faculties added yet</h3>
                    <p>Start by adding your first faculty!</p>
                  </div>
                ) : (
                  <div style={styles.gridAuto}>
                    {faculties.map(f => (
                      <div key={f.id} style={styles.dataItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <h4 style={{ margin: '0', color: '#1e293b' }}>
                            {f.name} <span style={{ color: '#64748b' }}>({f.code})</span>
                          </h4>
                          <span style={f.status === 'active' ? styles.statusActive : styles.statusInactive}>
                            {f.status}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 15px 0', color: '#475569' }}>{f.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: '#94a3b8' }}>
                            Created: {formatTimestamp(f.createdAt)}
                          </small>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleUpdateFaculty(f)}
                              style={{ 
                                ...styles.button,
                                ...styles.buttonPrimary
                              }}
                            >
                               Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteFaculty(f.id)} 
                              style={{ 
                                ...styles.button,
                                ...styles.buttonDanger
                              }}
                            >
                               Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Courses Management Tab */}
      {activeTab === 'courses' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}>Manage Courses</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {courses.length} Courses
            </span>
          </div>

          {!institution ? (
            <div style={styles.alert}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Institution Profile Required</h4>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    Please set up your institution profile first to manage courses.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('profile')}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary
                  }}
                >
                   Go to Institution Profile
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={handleAddCourse} 
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess
                }}
              >
                ➕ Add Course
              </button>
              
              <div style={{ marginTop: '25px' }}>
                {courses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <h3 style={{ color: '#94a3b8' }}>No courses added yet</h3>
                    <p>Start by adding your first course!</p>
                  </div>
                ) : (
                  <div style={styles.gridAuto}>
                    {courses.map(c => (
                      <div key={c.id} style={styles.dataItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <h4 style={{ margin: '0', color: '#1e293b' }}>
                            {c.name} <span style={{ color: '#64748b' }}>({c.code})</span>
                          </h4>
                          <span style={c.status === 'active' ? styles.statusActive : styles.statusInactive}>
                            {c.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                          <div style={styles.badge}>
                            <strong>Duration:</strong> {c.duration}
                          </div>
                          <div style={styles.badge}>
                            <strong>Faculty:</strong> {c.faculty}
                          </div>
                          <div style={styles.badge}>
                            <strong>Credits:</strong> {c.credits}
                          </div>
                        </div>
                        
                        <p style={{ margin: '0 0 15px 0', color: '#475569' }}>{c.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: '#94a3b8' }}>
                            Created: {formatTimestamp(c.createdAt)}
                          </small>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleUpdateCourse(c)}
                              style={{ 
                                ...styles.button,
                                ...styles.buttonPrimary
                              }}
                            >
                               Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(c.id)} 
                              style={{ 
                                ...styles.button,
                                ...styles.buttonDanger
                              }}
                            >
                               Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Admissions Management Tab */}
      {activeTab === 'admissions' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}>Manage Admissions</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {admissions.length} Admissions
            </span>
          </div>

          {!institution ? (
            <div style={styles.alert}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Institution Profile Required</h4>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    Please set up your institution profile first to publish admissions.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('profile')}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary
                  }}
                >
                   Go to Institution Profile
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={handlePublishAdmission} 
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess
                }}
              >
                 Publish New Admission
              </button>
              
              <div style={{ marginTop: '25px' }}>
                {admissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <h3 style={{ color: '#94a3b8' }}>No admissions published yet</h3>
                    <p>Start by publishing your first admission cycle!</p>
                  </div>
                ) : (
                  <div style={styles.gridAuto}>
                    {admissions.map(admission => (
                      <div key={admission.id} style={styles.dataItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <h4 style={{ margin: '0', color: '#1e293b' }}>{admission.title}</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={admission.status === 'active' ? styles.statusActive : styles.statusInactive}>
                              {admission.status}
                            </span>
                            <span style={admission.published ? styles.statusActive : styles.statusInactive}>
                              {admission.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        
                        <p style={{ margin: '0 0 15px 0', color: '#475569' }}>{admission.description}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                          <div style={styles.badge}>
                            <strong>Deadline:</strong> {formatTimestamp(admission.deadline)}
                          </div>
                          <div style={styles.badge}>
                            <strong>Seats:</strong> {admission.availableSeats}
                          </div>
                        </div>
                        
                        {admission.requirements && admission.requirements.length > 0 && (
                          <div style={{ marginBottom: '15px' }}>
                            <strong style={{ color: '#374151' }}>Requirements:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                              {admission.requirements.map((req, index) => (
                                <span key={index} style={{ ...styles.badge, ...styles.badgeWarning }}>
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: '#94a3b8' }}>
                            Published: {formatTimestamp(admission.publishedAt)}
                          </small>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleUpdateAdmission(admission)}
                              style={{ 
                                ...styles.button,
                                ...styles.buttonPrimary
                              }}
                            >
                               Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAdmission(admission.id)} 
                              style={{ 
                                ...styles.button,
                                ...styles.buttonDanger
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Applications Management Tab */}
      {activeTab === 'applications' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}>Student Applications</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {applications.length} Applications
            </span>
          </div>

          {/* Application Statistics */}
          <div style={styles.statsGrid}>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.9 }}>Pending</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{pendingApplications.length}</p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.9 }}>Accepted</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{acceptedApplications.length}</p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.9 }}>Rejected</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{rejectedApplications.length}</p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <h3 style={{ color: '#94a3b8' }}>No applications received yet</h3>
              <p>Applications will appear here when students apply to your courses.</p>
            </div>
          ) : (
            <div>
              {/* Pending Applications */}
              {pendingApplications.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ ...styles.sectionHeader, fontSize: '1.3rem' }}>
                    Pending Applications ({pendingApplications.length})
                  </h3>
                  <div style={styles.gridAuto}>
                    {pendingApplications.map(app => (
                      <div key={app.id} style={{ 
                        ...styles.dataItem,
                        borderLeft: '4px solid #f59e0b',
                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
                          {app.studentName || 'Unknown Student'}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                          <strong>Course:</strong> {app.courseName}
                        </p>
                        <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                          <strong>Email:</strong> {app.studentEmail}
                        </p>
                        <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem' }}>
                          Applied: {formatTimestamp(app.createdAt)}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleApplicationDecision(app.id, 'accepted')}
                            style={{ 
                              ...styles.button,
                              ...styles.buttonSuccess
                            }}
                          >
                            ✅ Accept
                          </button>
                          <button 
                            onClick={() => handleApplicationDecision(app.id, 'rejected')}
                            style={{ 
                              ...styles.button,
                              ...styles.buttonDanger
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accepted Applications */}
              {acceptedApplications.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ ...styles.sectionHeader, fontSize: '1.3rem' }}>
                    Accepted Applications ({acceptedApplications.length})
                  </h3>
                  <div style={styles.gridAuto}>
                    {acceptedApplications.map(app => (
                      <div key={app.id} style={{ 
                        ...styles.dataItem,
                        borderLeft: '4px solid #10b981',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
                          {app.studentName || 'Unknown Student'}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                          <strong>Course:</strong> {app.courseName}
                        </p>
                        <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                          <strong>Email:</strong> {app.studentEmail}
                        </p>
                        <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem' }}>
                          Applied: {formatTimestamp(app.createdAt)}
                        </p>
                        <div style={styles.statusActive}>
                          ✅ Accepted
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Applications */}
              {rejectedApplications.length > 0 && (
                <div>
                  <h3 style={{ ...styles.sectionHeader, fontSize: '1.3rem' }}>
                    Rejected Applications ({rejectedApplications.length})
                  </h3>
                  <div style={styles.gridAuto}>
                    {rejectedApplications.map(app => (
                      <div key={app.id} style={{ 
                        ...styles.dataItem,
                        borderLeft: '4px solid #ef4444',
                        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
                          {app.studentName || 'Unknown Student'}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                          <strong>Course:</strong> {app.courseName}
                        </p>
                        <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                          <strong>Email:</strong> {app.studentEmail}
                        </p>
                        <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem' }}>
                          Applied: {formatTimestamp(app.createdAt)}
                        </p>
                        <div style={styles.statusInactive}>
                          ❌ Rejected
                        </div>
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
        <div style={styles.card}>
          <h2 style={styles.sectionHeader}>Institution Profile</h2>
          
          {institution ? (
            <div>
              <div style={{ 
                ...styles.dataItem,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                marginBottom: '25px'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Current Profile Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div>
                    <strong style={{ color: '#374151' }}>Name:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.name}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Code:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.code}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Type:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.type}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Status:</strong>
                    <span style={institution.status === 'active' ? styles.statusActive : styles.statusInactive}>
                      {institution.status}
                    </span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong style={{ color: '#374151' }}>Description:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.description}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Contact Email:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.contactEmail}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Phone:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.phone}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Address:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.address}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Website:</strong>
                    <p style={{ margin: '5px 0', color: '#1e293b' }}>{institution.website}</p>
                  </div>
                </div>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#94a3b8' }}>
                    Created: {formatTimestamp(institution.createdAt)}
                  </small>
                </div>
              </div>

              <button 
                onClick={handleUpdateInstitutionProfile}
                style={{ 
                  ...styles.button,
                  ...styles.buttonPrimary
                }}
              >
                ✏️ Update Institution Profile
              </button>
            </div>
          ) : (
            <div style={{ 
              ...styles.dataItem,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎓</div>
              <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Create Your Institution Profile</h3>
              <p style={{ margin: '0 0 25px 0', color: '#64748b', fontSize: '1.1rem' }}>
                To start using the Institute Dashboard, please create your institution profile first.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}></div>
                  <strong>Manage Faculties</strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Create and organize academic departments</p>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}></div>
                  <strong>Manage Courses</strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Add and update academic programs</p>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}></div>
                  <strong>Publish Admissions</strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Launch admission cycles and manage applications</p>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}></div>
                  <strong>Track Performance</strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Monitor applications and institutional metrics</p>
                </div>
              </div>
              
              <button 
                onClick={handleCreateInstitutionProfile}
                style={{ 
                  ...styles.button,
                  ...styles.buttonSuccess,
                  fontSize: '16px',
                  padding: '15px 30px'
                }}
              >
                 Create Institution Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;