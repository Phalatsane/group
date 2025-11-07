// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getInstitutions, addInstitution, updateInstitution, deleteInstitution,
  getFaculties, addFaculty, updateFaculty, deleteFaculty,
  getCourses, addCourse, updateCourse, deleteCourse,
  getUsers, updateUser,
  getCompanies, updateCompany, deleteCompany,
  getJobPostings,
  getAdmissions, addAdmission, updateAdmission, deleteAdmission,
  getSystemReports, generateUserReport, generateJobReport, generateAdmissionReport, generateSystemHealthReport,
  initializeDatabase, checkDatabaseStatus
} from '../services/firebaseService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatedReports, setGeneratedReports] = useState({});
  const [generatingReport, setGeneratingReport] = useState(null);

  // Form state variables
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    code: '',
    type: 'University',
    status: 'active'
  });

  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active'
  });

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    duration: '',
    faculty: '',
    description: '',
    status: 'active'
  });

  const [editingAdmission, setEditingAdmission] = useState(null);
  const [newAdmission, setNewAdmission] = useState({
    title: '',
    description: '',
    institution: '',
    deadline: '',
    requirements: [],
    status: 'active',
    published: true
  });

  // Helper function to format Firestore timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };

  // Helper function to format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      if (date.seconds && date.nanoseconds !== undefined) {
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  };

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  useEffect(() => {
    fetchAllData();
    checkDbStatus();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [instData, facData, courseData, usersData, companiesData, jobsData, admissionsData, reportsData] = await Promise.all([
        getInstitutions(),
        getFaculties(),
        getCourses(),
        getUsers(),
        getCompanies(),
        getJobPostings(),
        getAdmissions(),
        getSystemReports()
      ]);
      
      setInstitutions(instData);
      setFaculties(facData);
      setCourses(courseData);
      setUsers(usersData);
      setCompanies(companiesData);
      setJobPostings(jobsData);
      setAdmissions(admissionsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDbStatus = async () => {
    try {
      const status = await checkDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error('Error checking database status:', error);
    }
  };

  const handleInitializeDatabase = async () => {
    if (window.confirm('This will initialize the database with sample data. Continue?')) {
      try {
        setInitializing(true);
        await initializeDatabase();
        await checkDbStatus();
        await fetchAllData();
        alert('Database initialized successfully!');
      } catch (error) {
        console.error('Error initializing database:', error);
        alert('Failed to initialize database');
      } finally {
        setInitializing(false);
      }
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    }
  };

  // Institution Form Functions
  const handleAddInstitution = async (e) => {
    if (e) e.preventDefault();
    
    if (!newInstitution.name || !newInstitution.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const institutionData = {
        ...newInstitution,
        createdAt: new Date().toISOString()
      };
      
      const newInst = await addInstitution(institutionData);
      setInstitutions(prev => [...prev, newInst]);
      
      // Reset form and hide it
      setNewInstitution({
        name: '',
        code: '',
        type: 'University',
        status: 'active'
      });
      setShowInstitutionForm(false);
      
      alert('Institution added successfully!');
    } catch (error) {
      console.error('Error adding institution:', error);
      alert('Failed to add institution');
    }
  };

  const handleUpdateInstitution = async (e) => {
    if (e) e.preventDefault();
    
    if (!editingInstitution.name || !editingInstitution.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateInstitution(editingInstitution.id, { 
        ...editingInstitution,
        updatedAt: new Date().toISOString()
      });
      
      setInstitutions(prev => prev.map(i => 
        i.id === editingInstitution.id ? { ...i, ...editingInstitution } : i
      ));
      
      setEditingInstitution(null);
      alert('Institution updated successfully!');
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Failed to update institution');
    }
  };

  const handleInstitutionInputChange = (e) => {
    const { name, value } = e.target;
    if (editingInstitution) {
      setEditingInstitution(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewInstitution(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCancelInstitution = () => {
    setShowInstitutionForm(false);
    setEditingInstitution(null);
    setNewInstitution({
      name: '',
      code: '',
      type: 'University',
      status: 'active'
    });
  };

  const handleEditInstitution = (institution) => {
    setEditingInstitution({ ...institution });
    setShowInstitutionForm(false);
  };

  // Faculty Form Functions
  const handleAddFaculty = async (e) => {
    if (e) e.preventDefault();
    
    if (!newFaculty.name || !newFaculty.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const facultyData = {
        ...newFaculty,
        createdAt: new Date().toISOString()
      };
      
      const newFac = await addFaculty(facultyData);
      setFaculties(prev => [...prev, newFac]);
      
      // Reset form and hide it
      setNewFaculty({
        name: '',
        code: '',
        description: '',
        status: 'active'
      });
      setShowFacultyForm(false);
      
      alert('Faculty added successfully!');
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty');
    }
  };

  const handleUpdateFaculty = async (e) => {
    if (e) e.preventDefault();
    
    if (!editingFaculty.name || !editingFaculty.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateFaculty(editingFaculty.id, { 
        ...editingFaculty,
        updatedAt: new Date().toISOString()
      });
      
      setFaculties(prev => prev.map(f => 
        f.id === editingFaculty.id ? { ...f, ...editingFaculty } : f
      ));
      
      setEditingFaculty(null);
      alert('Faculty updated successfully!');
    } catch (error) {
      console.error('Error updating faculty:', error);
      alert('Failed to update faculty');
    }
  };

  const handleFacultyInputChange = (e) => {
    const { name, value } = e.target;
    if (editingFaculty) {
      setEditingFaculty(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewFaculty(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCancelFaculty = () => {
    setShowFacultyForm(false);
    setEditingFaculty(null);
    setNewFaculty({
      name: '',
      code: '',
      description: '',
      status: 'active'
    });
  };

  const handleEditFaculty = (faculty) => {
    setEditingFaculty({ ...faculty });
    setShowFacultyForm(false);
  };

  // Course Form Functions
  const handleAddCourse = async (e) => {
    if (e) e.preventDefault();
    
    if (!newCourse.name || !newCourse.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const courseData = {
        ...newCourse,
        createdAt: new Date().toISOString()
      };
      
      const newCourseItem = await addCourse(courseData);
      setCourses(prev => [...prev, newCourseItem]);
      
      // Reset form and hide it
      setNewCourse({
        name: '',
        code: '',
        duration: '',
        faculty: '',
        description: '',
        status: 'active'
      });
      setShowCourseForm(false);
      
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
    }
  };

  const handleUpdateCourse = async (e) => {
    if (e) e.preventDefault();
    
    if (!editingCourse.name || !editingCourse.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateCourse(editingCourse.id, { 
        ...editingCourse,
        updatedAt: new Date().toISOString()
      });
      
      setCourses(prev => prev.map(c => 
        c.id === editingCourse.id ? { ...c, ...editingCourse } : c
      ));
      
      setEditingCourse(null);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCourse) {
      setEditingCourse(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewCourse(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCancelCourse = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    setNewCourse({
      name: '',
      code: '',
      duration: '',
      faculty: '',
      description: '',
      status: 'active'
    });
  };

  const handleEditCourse = (course) => {
    setEditingCourse({ ...course });
    setShowCourseForm(false);
  };

  const handleDeleteInstitution = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await deleteInstitution(id);
        setInstitutions(prev => prev.filter(i => i.id !== id));
        alert('Institution deleted successfully!');
      } catch (error) {
        console.error('Error deleting institution:', error);
        alert('Failed to delete institution');
      }
    }
  };

  // Report Generation Functions
  const handleGenerateReport = async (reportType) => {
    try {
      setGeneratingReport(reportType);
      let report;

      switch (reportType) {
        case 'user_analytics':
          report = await generateUserReport();
          break;
        case 'job_analytics':
          report = await generateJobReport();
          break;
        case 'admission_analytics':
          report = await generateAdmissionReport();
          break;
        case 'system_health':
          report = await generateSystemHealthReport();
          break;
        default:
          throw new Error('Unknown report type');
      }

      setGeneratedReports(prev => ({
        ...prev,
        [reportType]: report
      }));

      alert(`${report.title} generated successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  };

  // Function to render report data in a readable format
  const renderReportData = (report) => {
    if (!report) return null;

    switch (report.type) {
      case 'user_analytics':
        return (
          <div>
            <h4 className="report-section-title">User Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card primary">
                <strong>Total Users:</strong> {formatNumber(report.data.userStats.total)}
              </div>
              <div className="stat-card success">
                <strong>Active Users:</strong> {formatNumber(report.data.userStats.active)}
              </div>
              <div className="stat-card warning">
                <strong>New (30 days):</strong> {formatNumber(report.data.userStats.last30Days)}
              </div>
            </div>
            
            <h5 className="report-subtitle">Users by Role</h5>
            <div className="badges-grid">
              {Object.entries(report.data.userStats.byRole).map(([role, count]) => (
                <div key={role} className="badge primary">
                  <strong>{role}:</strong> {formatNumber(count)}
                </div>
              ))}
            </div>

            <h5 className="report-subtitle">Company Statistics</h5>
            <div className="stats-grid">
              <div className="stat-card secondary">
                <strong>Total:</strong> {formatNumber(report.data.companyStats.total)}
              </div>
              <div className="stat-card success">
                <strong>Approved:</strong> {formatNumber(report.data.companyStats.approved)}
              </div>
              <div className="stat-card warning">
                <strong>Pending:</strong> {formatNumber(report.data.companyStats.pending)}
              </div>
              <div className="stat-card danger">
                <strong>Suspended:</strong> {formatNumber(report.data.companyStats.suspended)}
              </div>
            </div>
          </div>
        );

      case 'job_analytics':
        return (
          <div>
            <h4 className="report-section-title">Job Market Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card primary">
                <strong>Total Jobs:</strong> {formatNumber(report.data.jobStats.total)}
              </div>
              <div className="stat-card success">
                <strong>Active Jobs:</strong> {formatNumber(report.data.jobStats.active)}
              </div>
              <div className="stat-card warning">
                <strong>Expired Jobs:</strong> {formatNumber(report.data.jobStats.expired)}
              </div>
            </div>

            <h5 className="report-subtitle">Applications Statistics</h5>
            <div className="stats-grid">
              <div className="stat-card secondary">
                <strong>Total Applications:</strong> {formatNumber(report.data.applicationStats.total)}
              </div>
            </div>

            <h5 className="report-subtitle">Applications by Status</h5>
            <div className="badges-grid">
              {Object.entries(report.data.applicationStats.byStatus).map(([status, count]) => (
                <div key={status} className="badge success">
                  <strong>{status}:</strong> {formatNumber(count)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'admission_analytics':
        return (
          <div>
            <h4 className="report-section-title">Admission Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card primary">
                <strong>Total Admissions:</strong> {formatNumber(report.data.admissionStats.total)}
              </div>
              <div className="stat-card success">
                <strong>Active Admissions:</strong> {formatNumber(report.data.admissionStats.active)}
              </div>
              <div className="stat-card warning">
                <strong>Published:</strong> {formatNumber(report.data.admissionStats.published)}
              </div>
            </div>

            <h5 className="report-subtitle">Institution Statistics</h5>
            <div className="stats-grid">
              <div className="stat-card secondary">
                <strong>Total Institutions:</strong> {formatNumber(report.data.institutionStats.total)}
              </div>
              <div className="stat-card success">
                <strong>Active Institutions:</strong> {formatNumber(report.data.institutionStats.active)}
              </div>
              <div className="stat-card warning">
                <strong>With Admissions:</strong> {formatNumber(report.data.institutionStats.withAdmissions)}
              </div>
            </div>
          </div>
        );

      case 'system_health':
        return (
          <div>
            <h4 className="report-section-title">System Health Metrics</h4>
            <div className="stats-grid">
              <div className="stat-card primary">
                <strong>Server Time:</strong> {new Date(report.data.serverTime).toLocaleString()}
              </div>
              <div className="stat-card success">
                <strong>Report Generated:</strong> {new Date(report.data.generatedAt).toLocaleString()}
              </div>
            </div>

            <h5 className="report-subtitle">Database Collections Status</h5>
            <div className="badges-grid">
              {Object.entries(report.data.systemStats.database).map(([collection, status]) => (
                <div key={collection} className={`data-item ${status.exists ? 'success' : 'danger'}`}>
                  <strong>{collection}:</strong> {status.exists ? `✓ Healthy (${formatNumber(status.count)} items)` : '✗ Empty'}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p>No data available for this report type.</p>;
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
        alert('Failed to delete faculty');
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
        alert('Failed to delete course');
      }
    }
  };

  // Companies Management
  const handleUpdateCompanyStatus = async (companyId, status) => {
    if (window.confirm(`Are you sure you want to ${status} this company?`)) {
      try {
        await updateCompany(companyId, { 
          status,
          updatedAt: new Date().toISOString()
        });
        
        setCompanies(prev => prev.map(c => 
          c.id === companyId ? { ...c, status } : c
        ));
        
        alert(`Company status updated to ${status} successfully!`);
      } catch (error) {
        console.error('Error updating company status:', error);
        alert('Failed to update company status');
      }
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await deleteCompany(id);
        
        setCompanies(prev => prev.filter(c => c.id !== id));
        setUsers(prev => prev.filter(u => u.id !== id));
        
        alert('Company deleted successfully!');
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Failed to delete company');
      }
    }
  };

  // Admissions Management - FIXED
  const handleAddAdmission = async (e) => {
    if (e) e.preventDefault();
    
    if (!newAdmission.title || !newAdmission.description || !newAdmission.institution) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const admissionData = {
        ...newAdmission,
        requirements: newAdmission.requirements.split(',').map(req => req.trim()),
        createdAt: new Date().toISOString()
      };
      
      const newAdm = await addAdmission(admissionData);
      setAdmissions(prev => [...prev, newAdm]);
      
      // Reset form
      setNewAdmission({
        title: '',
        description: '',
        institution: '',
        deadline: '',
        requirements: [],
        status: 'active',
        published: true
      });
      
      alert('Admission published successfully!');
    } catch (error) {
      console.error('Error adding admission:', error);
      alert('Failed to add admission');
    }
  };

  const handleUpdateAdmission = async (admission) => {
    setEditingAdmission({ ...admission });
  };

  const handleSaveAdmission = async (e) => {
    if (e) e.preventDefault();
    
    if (!editingAdmission.title || !editingAdmission.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const admissionData = {
        ...editingAdmission,
        updatedAt: new Date().toISOString()
      };
      
      await updateAdmission(editingAdmission.id, admissionData);
      
      // Update the local state immediately
      setAdmissions(prev => prev.map(a => 
        a.id === editingAdmission.id ? { ...a, ...admissionData } : a
      ));
      
      setEditingAdmission(null);
      alert('Admission updated successfully!');
    } catch (error) {
      console.error('Error updating admission:', error);
      alert('Failed to update admission');
    }
  };

  const handleCancelAdmission = () => {
    setEditingAdmission(null);
  };

  const handleDeleteAdmission = async (id) => {
    if (window.confirm('Are you sure you want to delete this admission?')) {
      try {
        await deleteAdmission(id);
        setAdmissions(prev => prev.filter(a => a.id !== id));
        alert('Admission deleted successfully!');
      } catch (error) {
        console.error('Error deleting admission:', error);
        alert('Failed to delete admission');
      }
    }
  };

  const handleAdmissionInputChange = (e) => {
    const { name, value } = e.target;
    if (editingAdmission) {
      setEditingAdmission(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewAdmission(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // User Management
  const handleUpdateUserRole = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await updateUser(userId, { 
          role: newRole,
          updatedAt: new Date().toISOString()
        });
        
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
        
        if (newRole === 'company') {
          const updatedUser = users.find(u => u.id === userId);
          setCompanies(prev => [...prev, { ...updatedUser, role: newRole }]);
        } else {
          setCompanies(prev => prev.filter(c => c.id !== userId));
        }
        
        alert(`User role updated to ${newRole} successfully!`);
      } catch (error) {
        console.error('Error updating user role:', error);
        alert('Failed to update user role');
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user?.email}</p>
        </div>
        
        <div className="sidebar-nav">
          {[
            { key: 'overview', label: 'Dashboard', icon: '' },
            { key: 'institutions', label: 'Institutions', icon: '' },
            { key: 'companies', label: 'Companies', icon: '' },
            { key: 'admissions', label: 'Admissions', icon: '' },
            { key: 'reports', label: 'Analytics', icon: '' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`sidebar-nav-item ${activeTab === tab.key ? 'active' : ''}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {tab.key === 'institutions' && institutions.length > 0 && (
                <span className="nav-badge">{institutions.length}</span>
              )}
              {tab.key === 'companies' && companies.length > 0 && (
                <span className="nav-badge">{companies.length}</span>
              )}
              {tab.key === 'admissions' && admissions.length > 0 && (
                <span className="nav-badge">{admissions.length}</span>
              )}
              {tab.key === 'reports' && reports.length > 0 && (
                <span className="nav-badge">{reports.length}</span>
              )}
            </button>
          ))}
          
          {/* Logout Button */}
          <div className="sidebar-footer">
            <button 
              onClick={handleLogout}
              className="sidebar-nav-item logout-btn"
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <div className="main-header">
          <div className="header-title">
            <h1>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'institutions' && 'Institutions Management'}
              {activeTab === 'companies' && 'Companies Management'}
              {activeTab === 'admissions' && 'Admissions Management'}
              {activeTab === 'reports' && 'Analytics & Reports'}
            </h1>
            <p>Welcome back, {user?.email}</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleInitializeDatabase} 
              disabled={initializing}
              className={`btn btn-secondary ${initializing ? 'disabled' : ''}`}
            >
              {initializing ? 'Initializing...' : 'Initialize DB'}
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="main-content">
            {/* Quick Stats */}
            <div className="stats-grid overview-stats">
              <div className="stat-card primary">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p>{formatNumber(users.length)}</p>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Companies</h3>
                  <p>{formatNumber(companies.length)}</p>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Job Postings</h3>
                  <p>{formatNumber(jobPostings.length)}</p>
                </div>
              </div>
              <div className="stat-card danger">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Admissions</h3>
                  <p>{formatNumber(admissions.length)}</p>
                </div>
              </div>
            </div>

            {/* Database Setup */}
            <div className="content-section">
              <div className="section-header">
                <h2>Database Setup</h2>
              </div>
              <div className="setup-card">
                <p>Initialize the database with sample data for testing and development.</p>
                <button 
                  onClick={handleInitializeDatabase} 
                  disabled={initializing}
                  className={`btn btn-primary ${initializing ? 'disabled' : ''}`}
                >
                  {initializing ? 'Initializing...' : 'Initialize Database'}
                </button>
                
                {dbStatus && (
                  <div className="db-status">
                    <h4>Collection Status:</h4>
                    <div className="status-grid">
                      {Object.entries(dbStatus).map(([collection, status]) => (
                        <div key={collection} className={`status-item ${status.exists ? 'success' : 'danger'}`}>
                          <strong>{collection}:</strong> {status.exists ? `${status.count} items` : 'Empty'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="content-section">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="actions-grid">
                <button 
                  onClick={() => setActiveTab('institutions')}
                  className="action-card primary"
                >
                  <span className="action-icon"></span>
                  <span className="action-text">Manage Institutions</span>
                </button>
                <button 
                  onClick={() => setActiveTab('companies')}
                  className="action-card success"
                >
                  <span className="action-icon"></span>
                  <span className="action-text">Manage Companies</span>
                </button>
                <button 
                  onClick={() => setActiveTab('admissions')}
                  className="action-card warning"
                >
                  <span className="action-icon"></span>
                  <span className="action-text">Manage Admissions</span>
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="action-card danger"
                >
                  <span className="action-icon"></span>
                  <span className="action-text">View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Institutions Management Tab */}
        {activeTab === 'institutions' && (
          <div className="main-content">
            <div className="content-section">
              <div className="section-header">
                <h2>Institutions Management</h2>
                <span className="section-badge">{institutions.length} Institutions</span>
              </div>

              {/* Institutions */}
              <div className="management-section">
                <div className="section-toolbar">
                  <h3>Institutions</h3>
                  <button 
                    onClick={() => {
                      setShowInstitutionForm(!showInstitutionForm);
                      setEditingInstitution(null);
                    }} 
                    className="btn btn-primary"
                  >
                    {showInstitutionForm || editingInstitution ? 'Cancel' : 'Add Institution'}
                  </button>
                </div>

                {(showInstitutionForm || editingInstitution) && (
                  <div className="form-card">
                    <h4>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</h4>
                    <form onSubmit={editingInstitution ? handleUpdateInstitution : handleAddInstitution}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Institution Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={editingInstitution ? editingInstitution.name : newInstitution.name}
                            onChange={handleInstitutionInputChange}
                            placeholder="Enter institution name"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Institution Code *</label>
                          <input
                            type="text"
                            name="code"
                            value={editingInstitution ? editingInstitution.code : newInstitution.code}
                            onChange={handleInstitutionInputChange}
                            placeholder="Enter institution code"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Institution Type</label>
                          <select
                            name="type"
                            value={editingInstitution ? editingInstitution.type : newInstitution.type}
                            onChange={handleInstitutionInputChange}
                          >
                            <option value="University">University</option>
                            <option value="College">College</option>
                            <option value="School">School</option>
                            <option value="Institute">Institute</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            name="status"
                            value={editingInstitution ? editingInstitution.status : newInstitution.status}
                            onChange={handleInstitutionInputChange}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-success">
                          {editingInstitution ? 'Update Institution' : 'Add Institution'}
                        </button>
                        <button 
                          type="button"
                          onClick={handleCancelInstitution}
                          className="btn btn-danger"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="data-grid">
                  {institutions.map(i => (
                    <div key={i.id} className="data-card">
                      <div className="card-header">
                        <h4>{i.name}</h4>
                        <span className={`status-badge ${i.status}`}>{i.status}</span>
                      </div>
                      <div className="card-content">
                        <p><strong>Code:</strong> {i.code}</p>
                        <p><strong>Type:</strong> {i.type}</p>
                        <p><strong>Created:</strong> {formatTimestamp(i.createdAt)}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          onClick={() => handleEditInstitution(i)}
                          className="btn btn-outline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteInstitution(i.id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faculties */}
              <div className="management-section">
                <div className="section-toolbar">
                  <h3>Faculties</h3>
                  <button 
                    onClick={() => {
                      setShowFacultyForm(!showFacultyForm);
                      setEditingFaculty(null);
                    }} 
                    className="btn btn-primary"
                  >
                    {showFacultyForm || editingFaculty ? 'Cancel' : 'Add Faculty'}
                  </button>
                </div>

                {(showFacultyForm || editingFaculty) && (
                  <div className="form-card">
                    <h4>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h4>
                    <form onSubmit={editingFaculty ? handleUpdateFaculty : handleAddFaculty}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Faculty Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={editingFaculty ? editingFaculty.name : newFaculty.name}
                            onChange={handleFacultyInputChange}
                            placeholder="Enter faculty name"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Faculty Code *</label>
                          <input
                            type="text"
                            name="code"
                            value={editingFaculty ? editingFaculty.code : newFaculty.code}
                            onChange={handleFacultyInputChange}
                            placeholder="Enter faculty code"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={editingFaculty ? editingFaculty.description : newFaculty.description}
                          onChange={handleFacultyInputChange}
                          placeholder="Enter faculty description"
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={editingFaculty ? editingFaculty.status : newFaculty.status}
                          onChange={handleFacultyInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-success">
                          {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                        </button>
                        <button 
                          type="button"
                          onClick={handleCancelFaculty}
                          className="btn btn-danger"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="data-grid">
                  {faculties.map(f => (
                    <div key={f.id} className="data-card">
                      <div className="card-header">
                        <h4>{f.name}</h4>
                        <span className={`status-badge ${f.status}`}>{f.status}</span>
                      </div>
                      <div className="card-content">
                        <p><strong>Code:</strong> {f.code}</p>
                        <p><strong>Description:</strong> {f.description}</p>
                        <p><strong>Created:</strong> {formatTimestamp(f.createdAt)}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          onClick={() => handleEditFaculty(f)}
                          className="btn btn-outline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFaculty(f.id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courses */}
              <div className="management-section">
                <div className="section-toolbar">
                  <h3>Courses</h3>
                  <button 
                    onClick={() => {
                      setShowCourseForm(!showCourseForm);
                      setEditingCourse(null);
                    }} 
                    className="btn btn-primary"
                  >
                    {showCourseForm || editingCourse ? 'Cancel' : 'Add Course'}
                  </button>
                </div>

                {(showCourseForm || editingCourse) && (
                  <div className="form-card">
                    <h4>{editingCourse ? 'Edit Course' : 'Add New Course'}</h4>
                    <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Course Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={editingCourse ? editingCourse.name : newCourse.name}
                            onChange={handleCourseInputChange}
                            placeholder="Enter course name"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Course Code *</label>
                          <input
                            type="text"
                            name="code"
                            value={editingCourse ? editingCourse.code : newCourse.code}
                            onChange={handleCourseInputChange}
                            placeholder="Enter course code"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Duration</label>
                          <input
                            type="text"
                            name="duration"
                            value={editingCourse ? editingCourse.duration : newCourse.duration}
                            onChange={handleCourseInputChange}
                            placeholder="e.g., 4 years, 2 semesters"
                          />
                        </div>
                        <div className="form-group">
                          <label>Faculty ID</label>
                          <input
                            type="text"
                            name="faculty"
                            value={editingCourse ? editingCourse.faculty : newCourse.faculty}
                            onChange={handleCourseInputChange}
                            placeholder="Enter faculty ID"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={editingCourse ? editingCourse.description : newCourse.description}
                          onChange={handleCourseInputChange}
                          placeholder="Enter course description"
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={editingCourse ? editingCourse.status : newCourse.status}
                          onChange={handleCourseInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-success">
                          {editingCourse ? 'Update Course' : 'Add Course'}
                        </button>
                        <button 
                          type="button"
                          onClick={handleCancelCourse}
                          className="btn btn-danger"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="data-grid">
                  {courses.map(c => (
                    <div key={c.id} className="data-card">
                      <div className="card-header">
                        <h4>{c.name}</h4>
                        <span className={`status-badge ${c.status}`}>{c.status}</span>
                      </div>
                      <div className="card-content">
                        <p><strong>Code:</strong> {c.code}</p>
                        <p><strong>Duration:</strong> {c.duration}</p>
                        <p><strong>Faculty:</strong> {c.faculty}</p>
                        <p><strong>Description:</strong> {c.description}</p>
                        <p><strong>Created:</strong> {formatTimestamp(c.createdAt)}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          onClick={() => handleEditCourse(c)}
                          className="btn btn-outline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(c.id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Companies Management Tab */}
        {activeTab === 'companies' && (
          <div className="main-content">
            <div className="content-section">
              <div className="section-header">
                <h2>Companies Management</h2>
                <span className="section-badge">{companies.length} Companies</span>
              </div>

              <div className="data-grid">
                {companies.map(company => (
                  <div key={company.id} className="data-card company-card">
                    <div className="card-header">
                      <h4>{company.companyName || company.name}</h4>
                      <div className="status-group">
                        <span className={`status-badge ${company.status}`}>{company.status}</span>
                        <span className={`status-badge ${company.verified ? 'active' : 'inactive'}`}>
                          {company.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                    <div className="card-content">
                      <p><strong>Email:</strong> {company.email}</p>
                      <p><strong>Phone:</strong> {company.phone}</p>
                      <p><strong>Industry:</strong> {company.industry}</p>
                      <p><strong>Role:</strong> {company.role}</p>
                      <p><strong>Created:</strong> {formatTimestamp(company.createdAt)}</p>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => handleUpdateCompanyStatus(company.id, 'approved')}
                        className={`btn btn-success ${company.status === 'approved' ? 'disabled' : ''}`}
                        disabled={company.status === 'approved'}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateCompanyStatus(company.id, 'suspended')}
                        className={`btn btn-warning ${company.status === 'suspended' ? 'disabled' : ''}`}
                        disabled={company.status === 'suspended'}
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => handleUpdateCompanyStatus(company.id, 'pending')}
                        className={`btn btn-secondary ${company.status === 'pending' ? 'disabled' : ''}`}
                        disabled={company.status === 'pending'}
                      >
                        Set Pending
                      </button>
                      <button 
                        onClick={() => handleDeleteCompany(company.id)} 
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Admissions Management Tab - FIXED */}
        {activeTab === 'admissions' && (
          <div className="main-content">
            <div className="content-section">
              <div className="section-header">
                <h2>Admissions Management</h2>
                <span className="section-badge">{admissions.length} Admissions</span>
              </div>

              {/* Add Admission Form */}
              <div className="management-section">
                <div className="section-toolbar">
                  <h3>Add New Admission</h3>
                </div>
                <div className="form-card">
                  <h4>Create New Admission</h4>
                  <form onSubmit={handleAddAdmission}>
                    <div className="form-group">
                      <label>Admission Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={newAdmission.title}
                        onChange={handleAdmissionInputChange}
                        placeholder="Enter admission title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        name="description"
                        value={newAdmission.description}
                        onChange={handleAdmissionInputChange}
                        placeholder="Enter admission description"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Institution ID *</label>
                        <input
                          type="text"
                          name="institution"
                          value={newAdmission.institution}
                          onChange={handleAdmissionInputChange}
                          placeholder="Enter institution ID"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          value={newAdmission.deadline}
                          onChange={handleAdmissionInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Requirements (comma separated)</label>
                      <input
                        type="text"
                        name="requirements"
                        value={newAdmission.requirements}
                        onChange={handleAdmissionInputChange}
                        placeholder="e.g., Transcript, ID, Certificate"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={newAdmission.status}
                          onChange={handleAdmissionInputChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Published</label>
                        <select
                          name="published"
                          value={newAdmission.published}
                          onChange={handleAdmissionInputChange}
                        >
                          <option value={true}>Yes</option>
                          <option value={false}>No</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        Publish Admission
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Edit Admission Form */}
              {editingAdmission && (
                <div className="management-section">
                  <div className="section-toolbar">
                    <h3>Edit Admission</h3>
                    <button 
                      onClick={handleCancelAdmission}
                      className="btn btn-danger"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="form-card">
                    <h4>Edit Admission</h4>
                    <form onSubmit={handleSaveAdmission}>
                      <div className="form-group">
                        <label>Admission Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={editingAdmission.title}
                          onChange={(e) => setEditingAdmission(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter admission title"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          name="description"
                          value={editingAdmission.description}
                          onChange={(e) => setEditingAdmission(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter admission description"
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            name="status"
                            value={editingAdmission.status}
                            onChange={(e) => setEditingAdmission(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Published</label>
                          <select
                            name="published"
                            value={editingAdmission.published}
                            onChange={(e) => setEditingAdmission(prev => ({ ...prev, published: e.target.value === 'true' }))}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-success">
                          Update Admission
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Admissions List */}
              <div className="management-section">
                <div className="section-toolbar">
                  <h3>All Admissions ({admissions.length})</h3>
                </div>
                <div className="data-grid">
                  {admissions.map(admission => (
                    <div key={admission.id} className="data-card admission-card">
                      <div className="card-header">
                        <h4>{admission.title}</h4>
                        <div className="status-group">
                          <span className={`status-badge ${admission.status}`}>
                            Status: {admission.status}
                          </span>
                          <span className={`status-badge ${admission.published ? 'active' : 'inactive'}`}>
                            {admission.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="card-content">
                        <p><strong>Description:</strong> {admission.description}</p>
                        <p><strong>Institution:</strong> {admission.institution}</p>
                        <p><strong>Deadline:</strong> {formatDate(admission.deadline)}</p>
                        <p><strong>Requirements:</strong> {Array.isArray(admission.requirements) ? admission.requirements.join(', ') : 'N/A'}</p>
                        <p><strong>Created:</strong> {formatTimestamp(admission.createdAt)}</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          onClick={() => handleUpdateAdmission(admission)}
                          className="btn btn-outline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAdmission(admission.id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="main-content">
            <div className="content-section">
              <div className="section-header">
                <h2>Analytics & Reports</h2>
                <p>Generate comprehensive reports and analytics for system monitoring</p>
              </div>

              {/* Reports Grid */}
              <div className="reports-grid">
                {reports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>{report.title}</h3>
                      <p>{report.description}</p>
                    </div>
                    <div className="report-actions">
                      <button 
                        onClick={() => handleGenerateReport(report.type)}
                        disabled={generatingReport === report.type}
                        className={`btn btn-primary ${generatingReport === report.type ? 'disabled' : ''}`}
                      >
                        {generatingReport === report.type ? 'Generating...' : 'Generate Report'}
                      </button>

                      {generatedReports[report.type] && (
                        <button 
                          onClick={() => {
                            const dataStr = JSON.stringify(generatedReports[report.type], null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${report.type}_${new Date().toISOString().split('T')[0]}.json`;
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="btn btn-success"
                        >
                          Download JSON
                        </button>
                      )}
                    </div>

                    {generatedReports[report.type] && (
                      <div className="report-data">
                        {renderReportData(generatedReports[report.type])}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* User Management */}
              <div className="management-section">
                <div className="section-header">
                  <h3>User Management</h3>
                  <span className="section-badge">{users.length} Users</span>
                </div>

                <div className="data-grid">
                  {users.map(u => (
                    <div key={u.id} className="data-card user-card">
                      <div className="card-header">
                        <h4>{u.name || 'No Name'} <span className="muted">({u.email})</span></h4>
                        <div className="status-group">
                          <span className={`status-badge ${u.role}`}>{u.role}</span>
                          <span className={`status-badge ${u.status}`}>Status: {u.status}</span>
                        </div>
                      </div>
                      <div className="card-content">
                        <p><strong>Created:</strong> {formatTimestamp(u.createdAt)}</p>
                      </div>
                      <div className="card-actions role-actions">
                        <span>Change Role:</span>
                        <button 
                          onClick={() => handleUpdateUserRole(u.id, 'admin')}
                          className={`btn ${u.role === 'admin' ? 'btn-dark disabled' : 'btn-primary'}`}
                          disabled={u.role === 'admin'}
                        >
                          Make Admin
                        </button>
                        <button 
                          onClick={() => handleUpdateUserRole(u.id, 'student')}
                          className={`btn ${u.role === 'student' ? 'btn-dark disabled' : 'btn-success'}`}
                          disabled={u.role === 'student'}
                        >
                          Make Student
                        </button>
                        <button 
                          onClick={() => handleUpdateUserRole(u.id, 'company')}
                          className={`btn ${u.role === 'company' ? 'btn-dark disabled' : 'btn-warning'}`}
                          disabled={u.role === 'company'}
                        >
                          Make Company
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;