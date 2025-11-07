// src/pages/CompanyDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getJobPostings, 
  addJobPosting, 
  updateJobPosting,
  deleteJobPosting,
  getApplications,
  updateApplicationStatus,
  getUsers,
  getCourses,
  getInstitutions,
  getCompanies,
  updateCompany,
  uploadCompanyDocument,
  deleteCompanyDocument
} from '../services/firebaseService';
import { storage, firestore } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [qualifiedApplicants, setQualifiedApplicants] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [profile, setProfile] = useState({ 
    companyName: '', 
    email: '', 
    industry: '',
    description: '',
    phone: '',
    website: '',
    location: '',
    size: '',
    founded: '',
    logo: '',
    uploadedDocs: [],
    status: 'pending',
    verified: false
  });
  const [newJob, setNewJob] = useState({ 
    title: '', 
    qualifications: '', 
    experience: '',
    description: '',
    requiredSkills: '',
    minGPA: '',
    requiredCertificates: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    category: '',
    deadline: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJobForFiltering, setSelectedJobForFiltering] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);

  // Safe render function to handle all types of values safely
  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      if (value.seconds && value.nanoseconds !== undefined) {
        return new Date(value.seconds * 1000).toLocaleDateString();
      }
      if (Array.isArray(value)) return value.join(', ');
      if (value.reviewedByName || value.status) {
        return `Status: ${value.status || 'N/A'}, Reviewed by: ${value.reviewedByName || 'N/A'}`;
      }
      if (value.decisionStatus || value.comments) {
        return `Decision: ${value.decisionStatus || 'N/A'}, Comments: ${value.comments || 'N/A'}`;
      }
      try {
        return JSON.stringify(value);
      } catch {
        return 'Object data';
      }
    }
    return String(value);
  };

  // Professional CSS Styles
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333'
    },
    
    header: {
      background: '#2c3e50',
      color: 'white',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    tabContainer: {
      display: 'flex',
      gap: '4px',
      marginBottom: '24px',
      background: 'white',
      padding: '4px',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      flexWrap: 'wrap',
      border: '1px solid #e0e0e0'
    },
    
    tabButton: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '4px',
      background: 'transparent',
      color: '#666',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      whiteSpace: 'nowrap'
    },
    
    tabButtonActive: {
      background: '#3498db',
      color: 'white',
      boxShadow: '0 1px 3px rgba(52,152,219,0.3)'
    },
    
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    
    statCard: {
      padding: '20px',
      borderRadius: '6px',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    
    buttonPrimary: {
      background: '#3498db',
      color: 'white',
      border: '1px solid #2980b9'
    },
    
    buttonSuccess: {
      background: '#27ae60',
      color: 'white',
      border: '1px solid #219a52'
    },
    
    buttonDanger: {
      background: '#e74c3c',
      color: 'white',
      border: '1px solid #c0392b'
    },
    
    buttonWarning: {
      background: '#f39c12',
      color: 'white',
      border: '1px solid #d35400'
    },
    
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'border 0.2s ease',
      backgroundColor: 'white'
    },
    
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'border 0.2s ease',
      backgroundColor: 'white',
      minHeight: '100px',
      resize: 'vertical'
    },
    
    select: {
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      transition: 'border 0.2s ease'
    },
    
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '16px',
      color: '#666'
    },
    
    dataItem: {
      background: '#f8f9fa',
      margin: '12px 0',
      padding: '16px',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      transition: 'background 0.2s ease'
    },
    
    statusActive: {
      background: '#27ae60',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    
    statusInactive: {
      background: '#e74c3c',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    
    statusPending: {
      background: '#f39c12',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    
    badge: {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500',
      margin: '1px'
    },
    
    badgePrimary: {
      background: '#d6eaf8',
      color: '#21618c'
    },
    
    badgeSuccess: {
      background: '#d5f4e6',
      color: '#186a3b'
    },
    
    badgeWarning: {
      background: '#fdebd0',
      color: '#7d6608'
    },
    
    badgeDanger: {
      background: '#fadbd8',
      color: '#78281f'
    },
    
    gridAuto: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    },
    
    sectionHeader: {
      color: '#2c3e50',
      marginBottom: '16px',
      fontSize: '1.3rem',
      fontWeight: '600',
      borderBottom: '2px solid #ecf0f1',
      paddingBottom: '8px'
    },
    
    scoreCard: {
      textAlign: 'center',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontWeight: '600',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },

    // Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },

    modalContent: {
      background: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },

    formGroup: {
      marginBottom: '16px'
    },

    formLabel: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '500',
      color: '#2c3e50',
      fontSize: '14px'
    },

    modalActions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },

    // New professional styles
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },

    companyStatus: {
      textAlign: 'right'
    },

    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px'
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    },

    applicationStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    },

    qualificationBreakdown: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '8px'
    }
  };

  // Helper functions
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
    fetchCompanyProfile();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, appsData, usersData, coursesData, institutionsData] = await Promise.all([
        getJobPostings(),
        getApplications(),
        getUsers(),
        getCourses(),
        getInstitutions()
      ]);
      
      const companyJobs = jobsData.filter(job => job.companyId === user?.uid || job.postedBy === user?.uid);
      setJobPostings(companyJobs);
      
      const companyApplications = appsData.filter(app => 
        companyJobs.some(job => job.id === app.jobId)
      );
      
      const safeApplications = companyApplications.map(app => ({
        ...app,
        review: app.review ? safeRender(app.review) : null,
        decision: app.decision ? safeRender(app.decision) : null
      }));
      
      setApplications(safeApplications);

      const students = usersData.filter(u => u.role === 'student');
      setAllStudents(students);
      setCourses(coursesData);
      setInstitutions(institutionsData);

      if (companyJobs.length > 0) {
        setSelectedJobForFiltering(companyJobs[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      if (user?.uid) {
        const companies = await getCompanies();
        const companyProfile = companies.find(company => company.id === user.uid || company.userId === user.uid);
        if (companyProfile) {
          setProfile(companyProfile);
        } else {
          setProfile(prev => ({
            ...prev,
            companyName: user.name || '',
            email: user.email || '',
            status: 'pending',
            verified: false,
            uploadedDocs: []
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  // Enhanced Algorithm to find qualified applicants
  const findQualifiedApplicants = (jobId) => {
    if (!jobId) return [];

    const job = jobPostings.find(j => j.id === jobId);
    if (!job) return [];

    const jobApplications = applications.filter(app => app.jobId === jobId);
    
    const scoredApplicants = jobApplications.map(app => {
      const student = allStudents.find(s => s.email === app.studentEmail || s.uid === app.studentId);
      let score = 0;

      const academicScore = calculateAcademicScore(student, job);
      score += academicScore;

      const certificateScore = calculateCertificateScore(student, job);
      score += certificateScore;

      const experienceScore = calculateExperienceScore(student, job);
      score += experienceScore;

      const relevanceScore = calculateRelevanceScore(student, job);
      score += relevanceScore;

      return {
        ...app,
        studentData: student,
        qualificationScore: Math.min(100, score),
        breakdown: {
          academicScore,
          certificateScore,
          experienceScore,
          relevanceScore
        },
        isQualified: score >= 70
      };
    });

    return scoredApplicants
      .filter(app => app.isQualified)
      .sort((a, b) => b.qualificationScore - a.qualificationScore);
  };

  const calculateAcademicScore = (student, job) => {
    if (!student) return 0;
    
    let score = 0;
    
    if (student.gpa) {
      const gpa = parseFloat(student.gpa);
      if (gpa >= 3.8) score += 25;
      else if (gpa >= 3.5) score += 20;
      else if (gpa >= 3.0) score += 15;
      else if (gpa >= 2.5) score += 10;
      else if (gpa >= 2.0) score += 5;
      
      if (job.minGPA && parseFloat(job.minGPA) > gpa) {
        score -= 10;
      }
    }
    
    if (student.academicAchievements) {
      const achievements = Array.isArray(student.academicAchievements) 
        ? student.academicAchievements 
        : [student.academicAchievements];
      score += Math.min(5, achievements.length * 1);
    }
    
    if (student.institution) {
      const institution = institutions.find(inst => 
        inst.name === student.institution || inst.id === student.institution
      );
      if (institution?.type === 'University') score += 3;
      else if (institution?.type === 'College') score += 2;
    }
    
    return Math.min(30, score);
  };

  const calculateCertificateScore = (student, job) => {
    if (!student) return 0;
    
    let score = 0;
    
    if (job.requiredCertificates && student.certificates) {
      const requiredCerts = job.requiredCertificates.toLowerCase().split(',').map(s => s.trim());
      const studentCerts = Array.isArray(student.certificates) 
        ? student.certificates 
        : [student.certificates];
      
      const matchingCerts = studentCerts.filter(cert => 
        requiredCerts.some(reqCert => cert.toLowerCase().includes(reqCert))
      );
      score += Math.min(15, matchingCerts.length * 5);
    }
    
    if (student.professionalCertifications) {
      const certs = Array.isArray(student.professionalCertifications)
        ? student.professionalCertifications
        : [student.professionalCertifications];
      score += Math.min(10, certs.length * 2);
    }
    
    return Math.min(25, score);
  };

  const calculateExperienceScore = (student, job) => {
    if (!student) return 0;
    
    let score = 0;
    
    if (student.workExperience) {
      const experiences = Array.isArray(student.workExperience)
        ? student.workExperience
        : [student.workExperience];
      
      let totalRelevantMonths = 0;
      
      experiences.forEach(exp => {
        const months = exp.durationMonths || (exp.duration ? parseInt(exp.duration) : 6);
        
        if (job.requiredSkills && exp.description) {
          const jobSkills = job.requiredSkills.toLowerCase().split(',').map(s => s.trim());
          const isRelevant = jobSkills.some(skill => 
            exp.description.toLowerCase().includes(skill)
          );
          if (isRelevant) {
            totalRelevantMonths += months;
          }
        }
      });
      
      if (totalRelevantMonths >= 24) score += 20;
      else if (totalRelevantMonths >= 12) score += 15;
      else if (totalRelevantMonths >= 6) score += 10;
      else if (totalRelevantMonths >= 3) score += 5;
    }
    
    if (student.internships) {
      const internships = Array.isArray(student.internships)
        ? student.internships
        : [student.internships];
      score += Math.min(5, internships.length * 1);
    }
    
    return Math.min(25, score);
  };

  const calculateRelevanceScore = (student, job) => {
    if (!student) return 0;
    
    let score = 0;
    
    if (student.skills && job.requiredSkills) {
      const jobSkills = job.requiredSkills.toLowerCase().split(',').map(s => s.trim());
      const studentSkills = Array.isArray(student.skills) 
        ? student.skills 
        : student.skills.split(',').map(s => s.trim());
      
      const matchingSkills = studentSkills.filter(skill => 
        jobSkills.some(jobSkill => skill.toLowerCase().includes(jobSkill))
      );
      score += Math.min(12, matchingSkills.length * 2);
    }
    
    if (student.courseOfStudy && job.qualifications) {
      const jobQualifications = job.qualifications.toLowerCase();
      const studentCourse = student.courseOfStudy.toLowerCase();
      
      if (jobQualifications.includes(studentCourse) || 
          studentCourse.includes(jobQualifications.split(' ')[0])) {
        score += 8;
      }
    }
    
    return Math.min(20, score);
  };

  const handlePostJob = async () => {
    if (!newJob.title || !newJob.qualifications || !newJob.experience) {
      alert('Please fill in all required job details.');
      return;
    }

    try {
      setJobLoading(true);
      const jobData = {
        ...newJob,
        company: profile.companyName,
        companyId: user.uid,
        status: 'active',
        postedBy: user.uid,
        createdAt: new Date().toISOString(),
        applications: 0,
        views: 0
      };
      
      const newJobPosting = await addJobPosting(jobData);
      setJobPostings(prev => [...prev, newJobPosting]);
      alert('Job posted successfully!');
      setNewJob({ 
        title: '', 
        qualifications: '', 
        experience: '',
        description: '',
        requiredSkills: '',
        minGPA: '',
        requiredCertificates: '',
        location: '',
        salary: '',
        jobType: 'full-time',
        category: '',
        deadline: ''
      });
      setActiveTab('jobPostings');
    } catch (error) {
      console.error('Error posting job:', error);
      alert(`Failed to post job: ${error.message}`);
    } finally {
      setJobLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      setJobLoading(true);
      await updateJobPosting(editingJob.id, {
        ...editingJob,
        updatedAt: new Date().toISOString()
      });
      
      setJobPostings(prev => 
        prev.map(job => job.id === editingJob.id ? editingJob : job)
      );
      
      alert('Job updated successfully!');
      setEditingJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
      alert(`Failed to update job: ${error.message}`);
    } finally {
      setJobLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteJobPosting(jobId);
        setJobPostings(prev => prev.filter(job => job.id !== jobId));
        alert('Job posting deleted successfully!');
      } catch (error) {
        console.error('Error deleting job:', error);
        alert(`Failed to delete job: ${error.message}`);
      }
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, {
        status,
        updatedAt: new Date().toISOString(),
        reviewedBy: user.uid,
        reviewedByName: profile.companyName
      });
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );

      if (selectedJobForFiltering) {
        const updatedQualified = findQualifiedApplicants(selectedJobForFiltering);
        setQualifiedApplicants(updatedQualified);
      }

      alert(`Application ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert(`Failed to update application: ${error.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };

  const handleUploadDocs = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    
    try {
      setUploadStatus(`Uploading ${uploadedFiles.length} file(s)...`);
      
      const uploadResults = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        try {
          setUploadStatus(`Uploading ${i + 1}/${uploadedFiles.length}: ${file.name}`);
          
          const fileRef = ref(storage, `company-documents/${user.uid}/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          const documentData = {
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            uploadedAt: new Date().toISOString(),
            companyId: user.uid,
            companyName: profile.companyName || user.name,
            status: 'active',
            storagePath: snapshot.ref.fullPath
          };
          
          const uploadedDoc = await uploadCompanyDocument(user.uid, documentData);
          uploadResults.push(uploadedDoc);
          
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          setUploadStatus(`Failed to upload ${file.name}. Continuing with other files...`);
        }
      }
      
      if (uploadResults.length > 0) {
        const updatedProfile = {
          ...profile,
          uploadedDocs: [...(profile.uploadedDocs || []), ...uploadResults]
        };
        
        await updateCompany(user.uid, updatedProfile);
        setProfile(updatedProfile);
        
        setUploadStatus(`Successfully uploaded ${uploadResults.length} out of ${uploadedFiles.length} files!`);
      } else {
        setUploadStatus('No files were successfully uploaded.');
      }
      
      setUploadedFiles([]);
      setTimeout(() => setUploadStatus(''), 5000);
      
    } catch (error) {
      console.error('Error in upload process:', error);
      setUploadStatus('Upload process failed: ' + error.message);
    }
  };

  const handleDeleteDocument = async (docId, docName, storagePath = null) => {
    if (window.confirm(`Are you sure you want to delete "${docName}"?`)) {
      try {
        setUploadStatus('Deleting document...');
        
        const updatedDocs = profile.uploadedDocs.filter(doc => doc.id !== docId);
        const updatedProfile = {
          ...profile,
          uploadedDocs: updatedDocs
        };
        
        await updateCompany(user.uid, updatedProfile);
        setProfile(updatedProfile);
        
        await deleteCompanyDocument(docId);
        
        if (storagePath) {
          try {
            const fileRef = ref(storage, storagePath);
            await deleteObject(fileRef);
          } catch (storageError) {
            console.warn('Could not delete file from storage:', storageError);
          }
        }
        
        setUploadStatus('Document deleted successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Error deleting document:', error);
        setUploadStatus('Failed to delete document: ' + error.message);
      }
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setProfileLoading(true);
      await updateCompany(user.uid, profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFindQualifiedApplicants = () => {
    if (!selectedJobForFiltering) {
      alert('Please select a job first.');
      return;
    }
    
    const qualified = findQualifiedApplicants(selectedJobForFiltering);
    setQualifiedApplicants(qualified);
    setActiveTab('qualifiedApplicants');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#27ae60';
      case 'rejected': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    return '#e74c3c';
  };

  const openEditJobModal = (job) => {
    setEditingJob({ ...job });
  };

  if (loading) {
    return <div style={styles.loading}>Loading Company Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600' }}>Company Dashboard</h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '1rem', opacity: 0.9 }}>
              Welcome back, <strong>{profile.companyName || user?.name}</strong>
            </p>
          </div>
          <div style={styles.companyStatus}>
            <div style={{ 
              ...styles.badge, 
              background: profile.status === 'approved' ? '#d5f4e6' : '#fdebd0',
              color: profile.status === 'approved' ? '#186a3b' : '#7d6608',
              fontSize: '12px',
              padding: '6px 12px'
            }}>
              Status: {profile.status} {profile.verified && '✓'}
            </div>
            {profile.status === 'pending' && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
                Your account is under review
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', count: null },
          { key: 'profile', label: 'Company Profile', count: null },
          { key: 'postJob', label: 'Post New Job', count: null },
          { key: 'jobPostings', label: 'Job Postings', count: jobPostings.length },
          { key: 'applications', label: 'Applications', count: applications.length },
          { key: 'qualifiedApplicants', label: 'Qualified Applicants', count: qualifiedApplicants.length }
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
                marginLeft: '6px', 
                background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#ecf0f1',
                color: activeTab === tab.key ? 'white' : '#7f8c8d',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px'
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
          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={{ 
              ...styles.statCard,
              background: '#3498db'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Active Jobs</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {jobPostings.filter(job => job.status === 'active').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: '#2ecc71'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Applications</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{applications.length}</p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: '#f39c12'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Pending Review</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: '#9b59b6'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>Qualified Candidates</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{qualifiedApplicants.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.quickActions}>
            {/* Find Qualified Applicants */}
            <div style={styles.card}>
              <h3 style={styles.sectionHeader}>Quick Actions</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.formLabel}>
                  Find Qualified Applicants for:
                </label>
                <select
                  value={selectedJobForFiltering}
                  onChange={(e) => setSelectedJobForFiltering(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select a job</option>
                  {jobPostings.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleFindQualifiedApplicants}
                disabled={!selectedJobForFiltering}
                style={{ 
                  ...styles.button,
                  ...styles.buttonPrimary,
                  opacity: selectedJobForFiltering ? 1 : 0.6,
                  marginBottom: '12px'
                }}
              >
                Find Qualified Applicants
              </button>
              
              <button 
                onClick={() => setActiveTab('postJob')}
                style={{ 
                  ...styles.button,
                  ...styles.buttonSuccess,
                  width: '100%'
                }}
              >
                Post New Job
              </button>
            </div>

            {/* Recent Applications */}
            <div style={styles.card}>
              <h3 style={styles.sectionHeader}>Recent Applications</h3>
              {applications.slice(0, 5).map(app => (
                <div key={app.id} style={styles.dataItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <strong style={{ color: '#2c3e50' }}>{safeRender(app.studentName) || 'Unknown Student'}</strong>
                    <span style={{ 
                      ...styles.badge,
                      background: getStatusColor(app.status),
                      color: 'white'
                    }}>
                      {safeRender(app.status)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', color: '#7f8c8d' }}>{safeRender(app.jobTitle)}</p>
                  <small style={{ color: '#95a5a6' }}>
                    Applied: {formatTimestamp(app.appliedAt)}
                  </small>
                </div>
              ))}
              {applications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                  No applications yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={styles.card}>
          <h2 style={styles.sectionHeader}>Company Profile</h2>
          
          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Company Name *</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                style={styles.input}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Email *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={styles.input}
                placeholder="company@email.com"
              />
            </div>
          </div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Industry *</label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                style={styles.input}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                style={styles.input}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Company Size</label>
              <select
                value={profile.size}
                onChange={(e) => setProfile({ ...profile, size: e.target.value })}
                style={styles.select}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                style={styles.input}
                placeholder="https://company.com"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                style={styles.input}
                placeholder="City, Country"
              />
            </div>
            <div>
              <label style={styles.formLabel}>Founded Year</label>
              <input
                type="number"
                value={profile.founded}
                onChange={(e) => setProfile({ ...profile, founded: e.target.value })}
                style={styles.input}
                placeholder="1990"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.formLabel}>Company Description *</label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              style={styles.textarea}
              placeholder="Describe your company, mission, values, and culture..."
              rows="4"
            />
          </div>

          <button 
            onClick={handleProfileUpdate}
            disabled={profileLoading}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              opacity: profileLoading ? 0.6 : 1
            }}
          >
            {profileLoading ? 'Updating...' : 'Update Profile'}
          </button>

          {/* Document Upload */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #ecf0f1' }}>
            <h3 style={{ ...styles.sectionHeader, fontSize: '1.1rem' }}>Company Documents</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '16px' }}>
              Upload company registration documents, certificates, or any other relevant files for verification.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                position: 'relative',
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload}
                  style={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <div style={{ 
                  padding: '12px 20px',
                  border: '1px dashed #bdc3c7',
                  borderRadius: '4px',
                  background: '#f8f9fa',
                  color: '#7f8c8d',
                  textAlign: 'center',
                  minWidth: '200px',
                  transition: 'all 0.2s ease'
                }}>
                  Choose Files or Drag & Drop
                  <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#95a5a6' }}>
                    PDF, DOC, Images, Text files
                  </div>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Selected files:</strong>
                  <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                    {uploadedFiles.map((file, index) => (
                      <li key={index} style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={handleUploadDocs} 
                disabled={uploadedFiles.length === 0}
                style={{ 
                  ...styles.button,
                  ...styles.buttonPrimary,
                  opacity: uploadedFiles.length === 0 ? 0.6 : 1
                }}
              >
                Upload Documents
              </button>
            </div>

            {uploadStatus && (
              <div style={{ 
                padding: '10px 12px', 
                background: uploadStatus.includes('successful') || uploadStatus.includes('Successfully') ? '#d5f4e6' : 
                           uploadStatus.includes('failed') || uploadStatus.includes('Failed') ? '#fadbd8' : '#fdebd0',
                border: `1px solid ${uploadStatus.includes('successful') || uploadStatus.includes('Successfully') ? '#27ae60' : 
                         uploadStatus.includes('failed') || uploadStatus.includes('Failed') ? '#e74c3c' : '#f39c12'}`,
                borderRadius: '4px',
                marginBottom: '16px',
                color: uploadStatus.includes('successful') || uploadStatus.includes('Successfully') ? '#186a3b' : 
                       uploadStatus.includes('failed') || uploadStatus.includes('Failed') ? '#78281f' : '#7d6608'
              }}>
                {uploadStatus}
              </div>
            )}
            
            <h4 style={{ marginBottom: '12px', color: '#2c3e50' }}>Uploaded Documents:</h4>
            {(!profile.uploadedDocs || profile.uploadedDocs.length === 0) ? (
              <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No documents uploaded yet.</p>
            ) : (
              <div style={styles.gridAuto}>
                {profile.uploadedDocs.map((doc, index) => (
                  <div key={doc.id || index} style={styles.dataItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <strong style={{ color: '#2c3e50' }}>{safeRender(doc.name)}</strong>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ ...styles.badge, ...styles.badgePrimary }}>
                          {safeRender(doc.type) || 'Document'}
                        </span>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id, doc.name, doc.storagePath)}
                          style={{ 
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px'
                          }}
                          title="Delete document"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                      Size: {(doc.size / 1024).toFixed(1)} KB
                    </div>
                    <div style={{ color: '#95a5a6', fontSize: '0.75rem' }}>
                      Uploaded: {formatTimestamp(doc.uploadedAt)}
                    </div>
                    {doc.url && (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-block',
                          marginTop: '6px',
                          color: '#3498db',
                          textDecoration: 'none',
                          fontWeight: '500',
                          fontSize: '0.85rem'
                        }}
                      >
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post New Job Tab */}
      {activeTab === 'postJob' && (
        <div style={styles.card}>
          <h2 style={styles.sectionHeader}>Post a New Job</h2>
          
          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Job Title *</label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.formLabel}>Job Type *</label>
              <select
                value={newJob.jobType}
                onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                style={styles.select}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Experience Required *</label>
              <input
                type="text"
                placeholder="e.g., 3-5 years"
                value={newJob.experience}
                onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.formLabel}>Location</label>
              <input
                type="text"
                placeholder="e.g., New York, NY or Remote"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.formLabel}>Salary Range</label>
              <input
                type="text"
                placeholder="e.g., $80,000 - $120,000"
                value={newJob.salary}
                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.formLabel}>Qualifications *</label>
            <input
              type="text"
              placeholder="e.g., Bachelor's in Computer Science or related field"
              value={newJob.qualifications}
              onChange={(e) => setNewJob({ ...newJob, qualifications: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.formLabel}>Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g., JavaScript, React, Node.js, AWS"
              value={newJob.requiredSkills}
              onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGrid}>
            <div>
              <label style={styles.formLabel}>Minimum GPA (optional)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                placeholder="3.0"
                value={newJob.minGPA}
                onChange={(e) => setNewJob({ ...newJob, minGPA: e.target.value })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.formLabel}>Required Certificates</label>
              <input
                type="text"
                placeholder="e.g., AWS Certified, PMP, Scrum Master"
                value={newJob.requiredCertificates}
                onChange={(e) => setNewJob({ ...newJob, requiredCertificates: e.target.value })}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.formLabel}>Application Deadline</label>
              <input
                type="date"
                value={newJob.deadline}
                onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.formLabel}>Job Description *</label>
            <textarea
              placeholder="Describe the job responsibilities, requirements, company culture, benefits..."
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              style={{ ...styles.textarea, minHeight: '120px' }}
              required
            />
          </div>

          <button 
            onClick={handlePostJob}
            disabled={jobLoading}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              opacity: jobLoading ? 0.6 : 1
            }}
          >
            {jobLoading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      )}

      {/* Job Postings Tab */}
      {activeTab === 'jobPostings' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.sectionHeader}>Current Job Postings</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {jobPostings.length} Jobs
            </span>
          </div>

          {jobPostings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <h3 style={{ color: '#95a5a6' }}>No jobs posted yet</h3>
              <p>Start by posting your first job opening!</p>
              <button 
                onClick={() => setActiveTab('postJob')}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  marginTop: '12px'
                }}
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div style={styles.gridAuto}>
              {jobPostings.map(job => (
                <div key={job.id} style={{ 
                  ...styles.dataItem,
                  borderLeft: `3px solid ${job.status === 'active' ? '#27ae60' : '#e74c3c'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>{safeRender(job.title)}</h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ ...styles.badge, ...styles.badgePrimary }}>
                          {safeRender(job.jobType)}
                        </span>
                        <span style={job.status === 'active' ? styles.statusActive : styles.statusInactive}>
                          {safeRender(job.status)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => openEditJobModal(job)}
                        style={{ 
                          ...styles.button,
                          background: '#ecf0f1',
                          color: '#2c3e50',
                          padding: '6px 10px',
                          fontSize: '11px'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        style={{ 
                          ...styles.button,
                          background: '#fadbd8',
                          color: '#e74c3c',
                          padding: '6px 10px',
                          fontSize: '11px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '4px 0', color: '#2c3e50' }}>
                      <strong>Location:</strong> {safeRender(job.location) || 'Not specified'}
                    </p>
                    <p style={{ margin: '4px 0', color: '#2c3e50' }}>
                      <strong>Experience:</strong> {safeRender(job.experience)}
                    </p>
                    <p style={{ margin: '4px 0', color: '#2c3e50' }}>
                      <strong>Qualifications:</strong> {safeRender(job.qualifications)}
                    </p>
                    <p style={{ margin: '4px 0', color: '#2c3e50' }}>
                      <strong>Required Skills:</strong> {safeRender(job.requiredSkills) || 'Not specified'}
                    </p>
                    {job.salary && (
                      <p style={{ margin: '4px 0', color: '#2c3e50' }}>
                        <strong>Salary:</strong> {safeRender(job.salary)}
                      </p>
                    )}
                    {job.deadline && (
                      <p style={{ margin: '4px 0', color: '#2c3e50' }}>
                        <strong>Deadline:</strong> {formatTimestamp(job.deadline)}
                      </p>
                    )}
                    {job.description && (
                      <p style={{ margin: '8px 0 0 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                        {safeRender(job.description).length > 120 ? safeRender(job.description).substring(0, 120) + '...' : safeRender(job.description)}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <small style={{ color: '#95a5a6' }}>
                      Posted: {formatTimestamp(job.createdAt)}
                    </small>
                    <button 
                      onClick={() => {
                        setSelectedJobForFiltering(job.id);
                        handleFindQualifiedApplicants();
                      }}
                      style={{ 
                        ...styles.button,
                        ...styles.buttonPrimary,
                        padding: '6px 12px',
                        fontSize: '11px'
                      }}
                    >
                      Find Applicants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.sectionHeader}>Candidate Applications</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {applications.length} Applications
            </span>
          </div>

          {/* Application Statistics */}
          <div style={styles.applicationStats}>
            <div style={{ 
              ...styles.statCard,
              background: '#f39c12'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', opacity: 0.9 }}>Pending</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: '#2ecc71'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', opacity: 0.9 }}>Accepted</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'accepted').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: '#e74c3c'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', opacity: 0.9 }}>Rejected</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <h3 style={{ color: '#95a5a6' }}>No applications received yet</h3>
              <p>Applications will appear here when students apply to your job postings.</p>
            </div>
          ) : (
            <div style={styles.gridAuto}>
              {applications.map(app => (
                <div key={app.id} style={{ 
                  ...styles.dataItem,
                  borderLeft: `3px solid ${getStatusColor(app.status)}`,
                  background: app.status === 'accepted' ? '#f0f9f4' : 
                             app.status === 'rejected' ? '#fdf2f2' : '#fef9e7'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>
                        {safeRender(app.studentName) || 'Unknown Student'}
                      </h4>
                      <p style={{ margin: '0', color: '#7f8c8d' }}>{safeRender(app.studentEmail)}</p>
                    </div>
                    <span style={{ 
                      ...styles.badge,
                      background: getStatusColor(app.status),
                      color: 'white'
                    }}>
                      {safeRender(app.status)}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                    <strong>Applied for:</strong> {safeRender(app.jobTitle)}
                  </p>
                  <p style={{ margin: '0 0 12px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                    Applied on: {formatTimestamp(app.appliedAt)}
                  </p>

                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonSuccess
                        }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonDanger
                        }}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedJobForFiltering(app.jobId);
                          handleFindQualifiedApplicants();
                          setActiveTab('qualifiedApplicants');
                        }}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonPrimary
                        }}
                      >
                        Check Qualification
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Qualified Applicants Tab */}
      {activeTab === 'qualifiedApplicants' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.sectionHeader}>Qualified Applicants</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ ...styles.badge, ...styles.badgeSuccess }}>
                {qualifiedApplicants.length} Qualified
              </span>
              <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                Ready for Interview
              </span>
            </div>
          </div>

          {/* Job Selection for Filtering */}
          <div style={{ 
            ...styles.dataItem,
            background: '#f8f9fa',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>Filter by Job</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedJobForFiltering}
                onChange={(e) => setSelectedJobForFiltering(e.target.value)}
                style={{ ...styles.select, minWidth: '250px' }}
              >
                <option value="">Select a job</option>
                {jobPostings.map(job => (
                  <option key={job.id} value={job.id}>
                    {safeRender(job.title)}
                  </option>
                ))}
              </select>
              <button 
                onClick={handleFindQualifiedApplicants}
                disabled={!selectedJobForFiltering}
                style={{ 
                  ...styles.button,
                  ...styles.buttonPrimary,
                  opacity: selectedJobForFiltering ? 1 : 0.6
                }}
              >
                Find Qualified Applicants
              </button>
            </div>
          </div>

          {qualifiedApplicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <h3 style={{ color: '#95a5a6', marginBottom: '12px' }}>No qualified applicants found</h3>
              <p style={{ marginBottom: '20px' }}>
                Select a job and click "Find Qualified Applicants" to see candidates who meet your criteria.
              </p>
              <p style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                Our algorithm automatically scores applicants based on academic performance, certificates, work experience, and job relevance.
                Only applicants with scores ≥70% are shown here.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: '#d5f4e6',
                padding: '16px',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #27ae60'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#186a3b' }}>Interview-Ready Candidates</h4>
                <p style={{ margin: '0', color: '#186a3b', fontSize: '0.9rem' }}>
                  Showing <strong>{qualifiedApplicants.length}</strong> applicants who meet your qualification criteria.
                </p>
              </div>
              
              <div style={styles.gridAuto}>
                {qualifiedApplicants.map(app => (
                  <div key={app.id} style={{ 
                    ...styles.dataItem,
                    border: `1px solid ${getScoreColor(app.qualificationScore)}`,
                    background: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>
                          {safeRender(app.studentName) || 'Unknown Student'}
                        </h3>
                        <p style={{ margin: '0 0 4px 0', color: '#7f8c8d' }}>{safeRender(app.studentEmail)}</p>
                        <p style={{ margin: '4px 0 0 0', color: '#2c3e50' }}>
                          <strong>Applied for:</strong> {safeRender(app.jobTitle)}
                        </p>
                      </div>
                      <div style={{ 
                        ...styles.scoreCard,
                        background: getScoreColor(app.qualificationScore),
                        minWidth: '60px'
                      }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{safeRender(app.qualificationScore)}%</div>
                        <div style={{ fontSize: '9px', opacity: 0.9 }}>SCORE</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div style={{ marginBottom: '16px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '0.85rem' }}>
                        Qualification Breakdown:
                      </h5>
                      <div style={styles.qualificationBreakdown}>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#7f8c8d', marginBottom: '2px' }}>Academic</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{safeRender(app.breakdown.academicScore)}/30</div>
                        </div>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#7f8c8d', marginBottom: '2px' }}>Certificates</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{safeRender(app.breakdown.certificateScore)}/25</div>
                        </div>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#7f8c8d', marginBottom: '2px' }}>Experience</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{safeRender(app.breakdown.experienceScore)}/25</div>
                        </div>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#7f8c8d', marginBottom: '2px' }}>Relevance</div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{safeRender(app.breakdown.relevanceScore)}/20</div>
                        </div>
                      </div>
                    </div>

                    {/* Student Details */}
                    {app.studentData && (
                      <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '0.9rem' }}>Student Profile</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
                          <div><strong>GPA:</strong> {safeRender(app.studentData.gpa) || 'Not specified'}</div>
                          <div><strong>Course:</strong> {safeRender(app.studentData.courseOfStudy) || 'Not specified'}</div>
                          <div><strong>Institution:</strong> {safeRender(app.studentData.institution) || 'Not specified'}</div>
                          <div><strong>Skills:</strong> {safeRender(app.studentData.skills) || 'Not specified'}</div>
                        </div>
                        {app.studentData.workExperience && (
                          <div style={{ marginTop: '8px' }}>
                            <strong>Experience:</strong> {Array.isArray(app.studentData.workExperience) ? app.studentData.workExperience.length + ' positions' : 'Available'}
                          </div>
                        )}
                        {app.studentData.certificates && (
                          <div style={{ marginTop: '4px' }}>
                            <strong>Certificates:</strong> {Array.isArray(app.studentData.certificates) ? app.studentData.certificates.length + ' certificates' : 'Available'}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonSuccess,
                          fontSize: '12px'
                        }}
                      >
                        Accept for Interview
                      </button>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonDanger,
                          fontSize: '12px'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Edit Job Posting</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Job Title</label>
              <input
                type="text"
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Job Type</label>
                <select
                  value={editingJob.jobType}
                  onChange={(e) => setEditingJob({ ...editingJob, jobType: e.target.value })}
                  style={styles.select}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Status</label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                  style={styles.select}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Qualifications</label>
              <input
                type="text"
                value={editingJob.qualifications}
                onChange={(e) => setEditingJob({ ...editingJob, qualifications: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Required Skills</label>
              <input
                type="text"
                value={editingJob.requiredSkills}
                onChange={(e) => setEditingJob({ ...editingJob, requiredSkills: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                style={styles.textarea}
                rows="4"
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setEditingJob(null)}
                style={{ ...styles.button, background: '#95a5a6', color: 'white' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateJob}
                disabled={jobLoading}
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary,
                  opacity: jobLoading ? 0.6 : 1
                }}
              >
                {jobLoading ? 'Updating...' : 'Update Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;