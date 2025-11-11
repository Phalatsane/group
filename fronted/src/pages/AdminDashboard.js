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
import './AdminDashboard.css';

// =============================================
// FORM COMPONENTS - KEEPING EXACT FUNCTIONALITY
// =============================================

const InstitutionForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    type: initialData?.type || 'University',
    status: initialData?.status || 'active',
    email: initialData?.email || '',
    password: initialData?.password || '',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.code && formData.email && (!initialData ? formData.password : true)) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scrollable-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Institution' : 'Add New Institution'}
          </h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body scroll-pane">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Institution Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Institution Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {initialData ? 'New Password (leave blank to keep current)' : 'Login Password *'}
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                  placeholder={initialData ? "Enter new password or leave blank" : "Set login password"}
                  required={!initialData}
                  minLength="6"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "" : ""}
                </button>
              </div>
              <small className="form-text">
                Password must be at least 6 characters long
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="form-input"
                placeholder="Name of primary contact"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input"
                placeholder="Contact phone number"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Institution Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="form-input"
                disabled={loading}
              >
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="School">School</option>
                <option value="Institute">Institute</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="form-input"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? ' Saving...' : initialData ? 'Update Institution' : 'Add Institution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FacultyForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.code) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scrollable-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Faculty' : 'Add New Faculty'}
          </h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body scroll-pane">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Faculty Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Faculty Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="4"
                className="form-textarea"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="form-input"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? ' Saving...' : initialData ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseForm = ({ onSubmit, onCancel, initialData = null, faculties = [] }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    duration: initialData?.duration || '',
    faculty: initialData?.faculty || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.code && formData.faculty) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scrollable-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Course' : 'Add New Course'}
          </h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body scroll-pane">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Course Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Course Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Duration *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 4 years, 2 semesters"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Faculty *
              </label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">Select Faculty</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="form-textarea"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="form-input"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? ' Saving...' : initialData ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdmissionForm = ({ onSubmit, onCancel, initialData = null, institutions = [] }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    institution: initialData?.institution || '',
    deadline: initialData?.deadline ? new Date(initialData.deadline.seconds * 1000).toISOString().split('T')[0] : '',
    requirements: Array.isArray(initialData?.requirements) ? initialData.requirements.join(', ') : '',
    status: initialData?.status || 'active',
    published: initialData?.published || true
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.institution && formData.deadline) {
      setLoading(true);
      try {
        const submissionData = {
          ...formData,
          requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
          deadline: new Date(formData.deadline).toISOString()
        };
        await onSubmit(submissionData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scrollable-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Admission' : 'Publish New Admission'}
          </h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body scroll-pane">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Admission Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="4"
                className="form-textarea"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Institution *
              </label>
              <select
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">Select Institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Application Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Requirements (comma separated)
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                rows="3"
                placeholder="e.g., High School Diploma, Entrance Exam, Interview"
                className="form-textarea"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="form-input"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="checkbox-input"
                  disabled={loading}
                />
                Published
              </label>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? ' Saving...' : initialData ? 'Update Admission' : 'Publish Admission'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// NEW PROFESSIONAL COMPONENTS
// =============================================

const DashboardHeader = ({ user, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: '', description: 'System overview and quick stats' },
    { id: 'institutions', label: 'Institutions', icon: '', description: 'Manage educational institutions' },
    { id: 'companies', label: 'Companies', icon: '', description: 'Manage business partners' },
    { id: 'admissions', label: 'Admissions', icon: '', description: 'Manage admission processes' },
    { id: 'reports', label: 'Analytics & Reports', icon: '', description: 'Generate system reports' },
    { id: 'users', label: 'User Management', icon: '', description: 'Manage user roles and permissions' }
  ];

  return (
    <div className="dashboard-header">
      <div className="header-main">
        <div className="header-title-section">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="welcome-text">
            Welcome back, <strong className="user-email">{user?.email}</strong>
          </p>
        </div>
        <div className="header-stats">
          <div className="admin-badge">
            <span className="badge-icon"></span>
            <span className="badge-text">Administrator</span>
          </div>
        </div>
      </div>
      
      <nav className="dashboard-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-item ${activeTab === tab.id ? 'nav-item-active' : ''}`}
            title={tab.description}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
            {activeTab === tab.id && <div className="nav-indicator"></div>}
          </button>
        ))}
      </nav>
    </div>
  );
};

const StatsOverview = ({ users, companies, jobPostings, admissions }) => {
  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';

  const stats = [
    { 
      label: 'Total Users', 
      value: formatNumber(users.length), 
      icon: '', 
      color: 'primary',
      trend: '+12%',
      description: 'Registered users in system'
    },
    { 
      label: 'Companies', 
      value: formatNumber(companies.length), 
      icon: '', 
      color: 'success',
      trend: '+5%',
      description: 'Business partners'
    },
    { 
      label: 'Job Postings', 
      value: formatNumber(jobPostings.length), 
      icon: '', 
      color: 'warning',
      trend: '+8%',
      description: 'Active job opportunities'
    },
    { 
      label: 'Admissions', 
      value: formatNumber(admissions.length), 
      icon: '', 
      color: 'info',
      trend: '+15%',
      description: 'Published admissions'
    }
  ];

  return (
    <div className="stats-overview-section">
      <div className="section-header">
        <h2 className="section-title">System Overview</h2>
        <p className="section-subtitle">Real-time statistics and system metrics</p>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-card-header">
              <div className="stat-icon-container">
                <span className="stat-icon">{stat.icon}</span>
              </div>
              <div className="stat-trend">
                <span className="trend-value">{stat.trend}</span>
              </div>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
            <div className="stat-card-footer">
              <p className="stat-description">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DatabaseManagement = ({ onInitialize, initializing, dbStatus }) => {
  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';

  return (
    <div className="database-management-section">
      <div className="section-header">
        <h2 className="section-title">Database Management</h2>
        <p className="section-subtitle">Initialize and monitor database collections</p>
      </div>
      
      <div className="database-controls">
        <div className="control-description">
          <p>Initialize the database with sample data for testing and demonstration purposes.</p>
          <button 
            onClick={onInitialize} 
            disabled={initializing}
            className={`btn btn-primary btn-initialize ${initializing ? 'btn-disabled' : ''}`}
          >
            {initializing ? (
              <>
                <span className="loading-spinner"></span>
                Initializing Database...
              </>
            ) : (
              <>
                <span className="btn-icon"></span>
                Initialize Database with Sample Data
              </>
            )}
          </button>
        </div>
      </div>
      
      {dbStatus && (
        <div className="database-status">
          <h3 className="status-title">Collection Status</h3>
          <div className="status-table-container">
            <table className="status-table">
              <thead>
                <tr>
                  <th>Collection Name</th>
                  <th>Status</th>
                  <th>Record Count</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dbStatus).map(([collection, status]) => (
                  <tr key={collection} className="status-row">
                    <td className="collection-cell">
                      <span className="collection-icon"></span>
                      <span className="collection-name">{collection}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${status.exists ? 'status-active' : 'status-inactive'}`}>
                        {status.exists ? ' Active' : ' Empty'}
                      </span>
                    </td>
                    <td className="count-cell">
                      {formatNumber(status.count)} records
                    </td>
                    <td>
                      <span className={`health-indicator ${status.exists ? 'health-good' : 'health-poor'}`}>
                        {status.exists ? ' Healthy' : ' No Data'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const DataTable = ({ 
  data, 
  columns, 
  title, 
  onAdd, 
  onEdit, 
  onDelete, 
  addButtonText = "Add New",
  emptyMessage = "No data found",
  emptyIcon = "",
  actions = true 
}) => {
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

  return (
    <div className="data-table-section">
      <div className="table-header">
        <div className="table-title-section">
          <h3 className="table-title">{title}</h3>
          <span className="record-count">{data.length} records</span>
        </div>
        <div className="table-actions">
          <button onClick={onAdd} className="btn btn-primary btn-add">
            <span className="btn-icon"></span>
            {addButtonText}
          </button>
        </div>
      </div>
      
      <div className="table-container">
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{emptyIcon}</div>
            <h4 className="empty-title">No Data Available</h4>
            <p className="empty-message">{emptyMessage}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column.key} className={`column-${column.key}`}>
                    {column.label}
                  </th>
                ))}
                {actions && <th className="column-actions">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id || index} className="data-row">
                  {columns.map(column => (
                    <td key={column.key} className={`cell-${column.key}`}>
                      {column.render ? column.render(item[column.key], item) : 
                       column.key.includes('date') || column.key.includes('At') ? formatTimestamp(item[column.key]) : 
                       String(item[column.key] || 'N/A')}
                    </td>
                  ))}
                  {actions && (
                    <td className="cell-actions">
                      <div className="action-buttons">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(item)} 
                            className="btn-action btn-edit"
                            title="Edit Record"
                          >
                            <span className="action-icon"></span>
                            <span className="action-text">Edit</span>
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(item.id)} 
                            className="btn-action btn-delete"
                            title="Delete Record"
                          >
                            <span className="action-icon"></span>
                            <span className="action-text">Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const InstitutionManagementSection = ({ institutions, onAdd, onEdit, onDelete }) => {
  const columns = [
    { key: 'name', label: 'Institution Name' },
    { key: 'code', label: 'Code' },
    { key: 'type', label: 'Type' },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value === 'active' ? 'status-active' : 'status-inactive'}`}>
          {value}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <DataTable
      data={institutions}
      columns={columns}
      title="Educational Institutions"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Add Institution"
      emptyMessage="No institutions found. Add your first institution to get started."
      emptyIcon=""
    />
  );
};

const FacultyManagementSection = ({ faculties, onAdd, onEdit, onDelete }) => {
  const columns = [
    { key: 'name', label: 'Faculty Name' },
    { key: 'code', label: 'Code' },
    { 
      key: 'description', 
      label: 'Description',
      render: (value) => value?.substring(0, 60) + (value?.length > 60 ? '...' : '') || 'No description'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value === 'active' ? 'status-active' : 'status-inactive'}`}>
          {value}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <DataTable
      data={faculties}
      columns={columns}
      title="Faculty Management"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Add Faculty"
      emptyMessage="No faculties found. Add your first faculty to get started."
      emptyIcon=""
    />
  );
};

const CourseManagementSection = ({ courses, onAdd, onEdit, onDelete }) => {
  const columns = [
    { key: 'name', label: 'Course Name' },
    { key: 'code', label: 'Code' },
    { key: 'duration', label: 'Duration' },
    { key: 'faculty', label: 'Faculty' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value === 'active' ? 'status-active' : 'status-inactive'}`}>
          {value}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <DataTable
      data={courses}
      columns={columns}
      title="Course Management"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Add Course"
      emptyMessage="No courses found. Add your first course to get started."
      emptyIcon="🎓"
    />
  );
};

const CompanyManagementSection = ({ companies, onStatusUpdate, onDelete }) => {
  const columns = [
    { 
      key: 'name', 
      label: 'Company Name', 
      render: (value, item) => item.companyName || value || 'Unnamed Company'
    },
    { key: 'email', label: 'Email' },
    { key: 'industry', label: 'Industry' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          approved: { class: 'status-active', label: 'Approved' },
          pending: { class: 'status-pending', label: ' Pending' },
          suspended: { class: 'status-inactive', label: ' Suspended' }
        };
        const config = statusConfig[value] || { class: 'status-inactive', label: value };
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
      }
    },
    { 
      key: 'verified', 
      label: 'Verified',
      render: (value) => (
        <span className={`status-badge ${value ? 'status-active' : 'status-inactive'}`}>
          {value ? ' Verified' : ' Not Verified'}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <div className="data-table-section">
      <div className="table-header">
        <div className="table-title-section">
          <h3 className="table-title">Company Management</h3>
          <span className="record-count">{companies.length} companies</span>
        </div>
      </div>
      
      <div className="table-container">
        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h4 className="empty-title">No Companies Found</h4>
            <p className="empty-message">Companies will appear here when they register.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column.key} className={`column-${column.key}`}>
                    {column.label}
                  </th>
                ))}
                <th className="column-actions">Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="data-row">
                  {columns.map(column => (
                    <td key={column.key} className={`cell-${column.key}`}>
                      {column.render ? column.render(company[column.key], company) : String(company[column.key] || 'N/A')}
                    </td>
                  ))}
                  <td className="cell-actions">
                    <div className="action-buttons">
                      <button 
                        onClick={() => onStatusUpdate(company.id, 'approved')}
                        className={`btn-action btn-success ${company.status === 'approved' ? 'btn-disabled' : ''}`}
                        disabled={company.status === 'approved'}
                        title="Approve Company"
                      >
                        <span className="action-icon"></span>
                        <span className="action-text">Approve</span>
                      </button>
                      <button 
                        onClick={() => onStatusUpdate(company.id, 'suspended')}
                        className={`btn-action btn-warning ${company.status === 'suspended' ? 'btn-disabled' : ''}`}
                        disabled={company.status === 'suspended'}
                        title="Suspend Company"
                      >
                        <span className="action-icon"></span>
                        <span className="action-text">Suspend</span>
                      </button>
                      <button 
                        onClick={() => onStatusUpdate(company.id, 'pending')}
                        className={`btn-action btn-info ${company.status === 'pending' ? 'btn-disabled' : ''}`}
                        disabled={company.status === 'pending'}
                        title="Set Pending"
                      >
                        <span className="action-icon"></span>
                        <span className="action-text">Pending</span>
                      </button>
                      <button 
                        onClick={() => onDelete(company.id)} 
                        className="btn-action btn-delete"
                        title="Delete Company"
                      >
                        <span className="action-icon"></span>
                        <span className="action-text">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const AdmissionManagementSection = ({ admissions, onAdd, onEdit, onDelete }) => {
  const columns = [
    { key: 'title', label: 'Admission Title' },
    { 
      key: 'description', 
      label: 'Description',
      render: (value) => value?.substring(0, 80) + (value?.length > 80 ? '...' : '') || 'No description'
    },
    { key: 'institution', label: 'Institution' },
    { key: 'deadline', label: 'Deadline' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value === 'active' ? 'status-active' : 'status-inactive'}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'published', 
      label: 'Published',
      render: (value) => (
        <span className={`status-badge ${value ? 'status-active' : 'status-inactive'}`}>
          {value ? ' Published' : ' Draft'}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <DataTable
      data={admissions}
      columns={columns}
      title="Admission Management"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Publish Admission"
      emptyMessage="No admissions found. Publish your first admission to get started."
      emptyIcon=""
    />
  );
};

const UserManagementSection = ({ users, onRoleUpdate }) => {
  const columns = [
    { 
      key: 'name', 
      label: 'User Name', 
      render: (value) => value || <span className="text-muted">No Name</span>
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Role',
      render: (value) => (
        <span className={`role-badge role-${value}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value === 'active' ? 'status-active' : 'status-inactive'}`}>
          {value || 'active'}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  const roles = [
    { value: 'admin', label: ' Admin', class: 'btn-admin' },
    { value: 'student', label: ' Student', class: 'btn-student' },
    { value: 'company', label: ' Company', class: 'btn-company' },
    { value: 'institute', label: ' Institute', class: 'btn-institute' }
  ];

  return (
    <div className="data-table-section">
      <div className="table-header">
        <div className="table-title-section">
          <h3 className="table-title">User Management</h3>
          <span className="record-count">{users.length} users</span>
        </div>
      </div>
      
      <div className="table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h4 className="empty-title">No Users Found</h4>
            <p className="empty-message">No users are currently registered in the system.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column.key} className={`column-${column.key}`}>
                    {column.label}
                  </th>
                ))}
                <th className="column-actions">Role Management</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="data-row">
                  {columns.map(column => (
                    <td key={column.key} className={`cell-${column.key}`}>
                      {column.render ? column.render(user[column.key], user) : String(user[column.key] || 'N/A')}
                    </td>
                  ))}
                  <td className="cell-actions">
                    <div className="role-management">
                      <span className="role-management-label">Change Role:</span>
                      <div className="role-buttons-grid">
                        {roles.map(role => (
                          <button
                            key={role.value}
                            onClick={() => onRoleUpdate(user.id, role.value)}
                            className={`btn-role ${role.class} ${user.role === role.value ? 'btn-disabled' : ''}`}
                            disabled={user.role === role.value}
                            title={`Change role to ${role.value}`}
                          >
                            <span className="role-icon">{role.label.split(' ')[0]}</span>
                            <span className="role-text">{role.label.split(' ')[1]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const ReportsAnalyticsSection = ({ reports, generatedReports, generatingReport, onGenerateReport, users, companies, jobPostings, admissions }) => {
  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';

  const handleDownloadReport = (reportType, report) => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderReportData = (report) => {
    if (!report) return null;

    return (
      <div className="report-details">
        <div className="report-header">
          <h4>{report.title}</h4>
          <span className="report-badge"></span>
        </div>
        <p className="report-description">{report.description}</p>
        <div className="report-meta">
          <span>Generated: {new Date(report.data.generatedAt).toLocaleString()}</span>
        </div>
        <div className="report-content">
          <pre className="report-data">
            {JSON.stringify(report.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-analytics-section">
      <div className="section-header">
        <h2 className="section-title">Analytics & Reports</h2>
        <p className="section-subtitle">
          Generate comprehensive reports and analytics for system monitoring and decision making.
        </p>
      </div>

      <div className="reports-overview">
        <h3 className="overview-title">Quick Statistics</h3>
        <div className="stats-grid compact">
          <div className="stat-card stat-card-primary">
            <div className="stat-value">{formatNumber(users.length)}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-value">{formatNumber(companies.filter(c => c.status === 'approved').length)}</div>
            <div className="stat-label">Active Companies</div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-value">{formatNumber(jobPostings.length)}</div>
            <div className="stat-label">Job Postings</div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-value">{formatNumber(admissions.filter(a => a.status === 'active').length)}</div>
            <div className="stat-label">Active Admissions</div>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-card-header">
              <h4>{report.title}</h4>
              <span className="report-type-badge">{report.type}</span>
            </div>
            <p className="report-card-description">{report.description}</p>
            
            <div className="report-card-actions">
              <button 
                onClick={() => onGenerateReport(report.type)}
                disabled={generatingReport === report.type}
                className={`btn btn-primary ${generatingReport === report.type ? 'btn-disabled' : ''}`}
              >
                {generatingReport === report.type ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating Report...
                  </>
                ) : (
                  ' Generate Report'
                )}
              </button>

              {generatedReports[report.type] && (
                <button 
                  onClick={() => handleDownloadReport(report.type, generatedReports[report.type])}
                  className="btn btn-success"
                >
                   Download JSON
                </button>
              )}
            </div>

            {generatedReports[report.type] && (
              <div className="report-card-preview">
                {renderReportData(generatedReports[report.type])}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================
// MAIN ADMIN DASHBOARD COMPONENT
// =============================================

const AdminDashboard = () => {
  const { user } = useAuth();
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

  // Form states
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);

  // Helper functions
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
      alert('Error fetching data. Please check console for details.');
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
        alert('Failed to initialize database. Please check console for details.');
      } finally {
        setInitializing(false);
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
      alert('Failed to generate report. Please check console for details.');
    } finally {
      setGeneratingReport(null);
    }
  };

  // Institutions Management with Forms
  const handleAddInstitution = async (formData) => {
    try {
      console.log('Adding institution:', formData);
      
      // Create institution data without password for Firestore
      const institutionData = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        status: formData.status,
        email: formData.email,
        contactPerson: formData.contactPerson || '',
        phone: formData.phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newInst = await addInstitution(institutionData, formData.password);
      console.log('Institution added successfully:', newInst);
      
      setInstitutions(prev => [...prev, newInst]);
      setShowInstitutionForm(false);
      alert('Institution added successfully! The institution can now login using the provided email and password.');
    } catch (error) {
      console.error('Error adding institution:', error);
      
      let errorMessage = 'Failed to add institution';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check the email format.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      throw error; // Re-throw to handle in form component
    }
  };

  const handleUpdateInstitution = async (formData) => {
    try {
      console.log('Updating institution:', editingInstitution.id, formData);
      
      // For updates, remove password if it's empty
      const updateData = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        status: formData.status,
        email: formData.email,
        contactPerson: formData.contactPerson || '',
        phone: formData.phone || '',
        updatedAt: new Date().toISOString()
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateInstitution(editingInstitution.id, updateData);
      
      setInstitutions(prev => prev.map(i => 
        i.id === editingInstitution.id ? { ...i, ...updateData } : i
      ));
      setEditingInstitution(null);
      setShowInstitutionForm(false);
      alert('Institution updated successfully!');
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Failed to update institution. Please check console for details.');
      throw error; // Re-throw to handle in form component
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution? This will also delete the associated user account.')) {
      try {
        await deleteInstitution(id);
        setInstitutions(prev => prev.filter(i => i.id !== id));
        alert('Institution deleted successfully!');
      } catch (error) {
        console.error('Error deleting institution:', error);
        alert('Failed to delete institution. Please check console for details.');
      }
    }
  };

  // Faculties Management with Forms
  const handleAddFaculty = async (formData) => {
    try {
      const newFac = await addFaculty({ 
        ...formData,
        createdAt: new Date().toISOString()
      });
      setFaculties(prev => [...prev, newFac]);
      setShowFacultyForm(false);
      alert('Faculty added successfully!');
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty. Please check console for details.');
      throw error;
    }
  };

  const handleUpdateFaculty = async (formData) => {
    try {
      await updateFaculty(editingFaculty.id, { 
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setFaculties(prev => prev.map(f => 
        f.id === editingFaculty.id ? { ...f, ...formData } : f
      ));
      setEditingFaculty(null);
      setShowFacultyForm(false);
      alert('Faculty updated successfully!');
    } catch (error) {
      console.error('Error updating faculty:', error);
      alert('Failed to update faculty. Please check console for details.');
      throw error;
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
        alert('Failed to delete faculty. Please check console for details.');
      }
    }
  };

  // Courses Management with Forms
  const handleAddCourse = async (formData) => {
    try {
      const newCourse = await addCourse({ 
        ...formData,
        createdAt: new Date().toISOString()
      });
      setCourses(prev => [...prev, newCourse]);
      setShowCourseForm(false);
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please check console for details.');
      throw error;
    }
  };

  const handleUpdateCourse = async (formData) => {
    try {
      await updateCourse(editingCourse.id, { 
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setCourses(prev => prev.map(c => 
        c.id === editingCourse.id ? { ...c, ...formData } : c
      ));
      setEditingCourse(null);
      setShowCourseForm(false);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please check console for details.');
      throw error;
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
        alert('Failed to delete course. Please check console for details.');
      }
    }
  };

  // Admissions Management with Forms
  const handleAddAdmission = async (formData) => {
    try {
      const newAdmission = await addAdmission({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setAdmissions(prev => [...prev, newAdmission]);
      setShowAdmissionForm(false);
      alert('Admission published successfully!');
    } catch (error) {
      console.error('Error adding admission:', error);
      alert('Failed to add admission. Please check console for details.');
      throw error;
    }
  };

  const handleUpdateAdmission = async (formData) => {
    try {
      await updateAdmission(editingAdmission.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      setAdmissions(prev => prev.map(a => 
        a.id === editingAdmission.id ? { ...a, ...formData } : a
      ));
      
      setEditingAdmission(null);
      setShowAdmissionForm(false);
      alert('Admission updated successfully!');
    } catch (error) {
      console.error('Error updating admission:', error);
      alert('Failed to update admission. Please check console for details.');
      throw error;
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
        alert('Failed to delete admission. Please check console for details.');
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
        alert('Failed to update company status. Please check console for details.');
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
        alert('Failed to delete company. Please check console for details.');
      }
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
        alert('Failed to update user role. Please check console for details.');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Form Modals */}
      {showInstitutionForm && (
        <InstitutionForm
          onSubmit={editingInstitution ? handleUpdateInstitution : handleAddInstitution}
          onCancel={() => {
            setShowInstitutionForm(false);
            setEditingInstitution(null);
          }}
          initialData={editingInstitution}
        />
      )}

      {showFacultyForm && (
        <FacultyForm
          onSubmit={editingFaculty ? handleUpdateFaculty : handleAddFaculty}
          onCancel={() => {
            setShowFacultyForm(false);
            setEditingFaculty(null);
          }}
          initialData={editingFaculty}
        />
      )}

      {showCourseForm && (
        <CourseForm
          onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}
          onCancel={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
          initialData={editingCourse}
          faculties={faculties}
        />
      )}

      {showAdmissionForm && (
        <AdmissionForm
          onSubmit={editingAdmission ? handleUpdateAdmission : handleAddAdmission}
          onCancel={() => {
            setShowAdmissionForm(false);
            setEditingAdmission(null);
          }}
          initialData={editingAdmission}
          institutions={institutions}
        />
      )}

      <DashboardHeader 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <StatsOverview 
              users={users}
              companies={companies}
              jobPostings={jobPostings}
              admissions={admissions}
            />
            <DatabaseManagement 
              onInitialize={handleInitializeDatabase}
              initializing={initializing}
              dbStatus={dbStatus}
            />
          </div>
        )}

        {/* Institutions Management Tab */}
        {activeTab === 'institutions' && (
          <div className="institutions-tab">
            <InstitutionManagementSection
              institutions={institutions}
              onAdd={() => setShowInstitutionForm(true)}
              onEdit={(institution) => {
                setEditingInstitution(institution);
                setShowInstitutionForm(true);
              }}
              onDelete={handleDeleteInstitution}
            />
            <div className="management-grid">
              <FacultyManagementSection
                faculties={faculties}
                onAdd={() => setShowFacultyForm(true)}
                onEdit={(faculty) => {
                  setEditingFaculty(faculty);
                  setShowFacultyForm(true);
                }}
                onDelete={handleDeleteFaculty}
              />
              <CourseManagementSection
                courses={courses}
                onAdd={() => setShowCourseForm(true)}
                onEdit={(course) => {
                  setEditingCourse(course);
                  setShowCourseForm(true);
                }}
                onDelete={handleDeleteCourse}
              />
            </div>
          </div>
        )}

        {/* Companies Management Tab */}
        {activeTab === 'companies' && (
          <div className="companies-tab">
            <CompanyManagementSection
              companies={companies}
              onStatusUpdate={handleUpdateCompanyStatus}
              onDelete={handleDeleteCompany}
            />
          </div>
        )}

        {/* Admissions Management Tab */}
        {activeTab === 'admissions' && (
          <div className="admissions-tab">
            <AdmissionManagementSection
              admissions={admissions}
              onAdd={() => setShowAdmissionForm(true)}
              onEdit={(admission) => {
                setEditingAdmission(admission);
                setShowAdmissionForm(true);
              }}
              onDelete={handleDeleteAdmission}
            />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="reports-tab">
            <ReportsAnalyticsSection
              reports={reports}
              generatedReports={generatedReports}
              generatingReport={generatingReport}
              onGenerateReport={handleGenerateReport}
              users={users}
              companies={companies}
              jobPostings={jobPostings}
              admissions={admissions}
            />
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <UserManagementSection
              users={users}
              onRoleUpdate={handleUpdateUserRole}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;