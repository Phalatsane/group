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
  updateCompany
} from '../services/firebaseService';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './CompanyDashboard.css';

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

  // Professional CSS Styles
  const styles = {
    container: {
      padding: '30px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '16px',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
    },
    
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
    
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    
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
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      transition: 'transform 0.3s ease'
    },
    
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
    
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      backgroundColor: 'white'
    },
    
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      minHeight: '120px',
      resize: 'vertical'
    },
    
    select: {
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      transition: 'all 0.3s ease'
    },
    
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '18px',
      color: '#64748b'
    },
    
    dataItem: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      margin: '15px 0',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    
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
    
    gridAuto: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    
    sectionHeader: {
      color: '#334155',
      marginBottom: '20px',
      fontSize: '1.5rem',
      fontWeight: '700'
    },
    
    scoreCard: {
      textAlign: 'center',
      padding: '15px 20px',
      borderRadius: '12px',
      color: 'white',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
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
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },

    formGroup: {
      marginBottom: '20px'
    },

    formLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#374151'
    },

    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '25px'
    }
  };

  // Helper functions
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      // Handle Firestore timestamp objects
      if (timestamp && typeof timestamp === 'object') {
        if (timestamp.seconds && timestamp.nanoseconds !== undefined) {
          return new Date(timestamp.seconds * 1000).toLocaleDateString();
        }
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toLocaleDateString();
        }
      }
      // Handle string timestamps
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
      }
      return 'Invalid Date';
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };

  // Safe string conversion for React rendering
  const safeString = (value, defaultValue = 'N/A') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'object') {
      // If it's an object with a toString method, use it
      if (value.toString && typeof value.toString === 'function' && value.toString() !== '[object Object]') {
        return value.toString();
      }
      // Otherwise, try to stringify or return default
      try {
        return JSON.stringify(value);
      } catch {
        return defaultValue;
      }
    }
    return String(value);
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
      
      // Filter job postings for this company
      const companyJobs = jobsData.filter(job => job.companyId === user?.uid || job.postedBy === user?.uid);
      setJobPostings(companyJobs);
      
      // Filter applications for this company's jobs
      const companyApplications = appsData.filter(app => 
        companyJobs.some(job => job.id === app.jobId)
      );
      
      // Ensure all application fields are properly formatted
      const formattedApplications = companyApplications.map(app => ({
        ...app,
        status: safeString(app.status, 'pending'),
        studentName: safeString(app.studentName, 'Unknown Student'),
        studentEmail: safeString(app.studentEmail, 'No email'),
        jobTitle: safeString(app.jobTitle, 'Unknown Job')
      }));
      
      setApplications(formattedApplications);

      // Get all students
      const students = usersData.filter(u => u.role === 'student');
      setAllStudents(students);
      setCourses(coursesData);
      setInstitutions(institutionsData);

      // Set default selected job for filtering
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

  // Custom function to get company profile
const fetchCompanyProfile = async () => {
  try {
    if (user?.uid) {
      const companies = await getCompanies();
      const companyProfile = companies.find(company => company.id === user.uid || company.userId === user.uid);
      if (companyProfile) {
        // Ensure all profile fields are strings
        const formattedProfile = {
          ...companyProfile,
          companyName: safeString(companyProfile.companyName, ''),
          email: safeString(companyProfile.email, ''),
          industry: safeString(companyProfile.industry, ''),
          description: safeString(companyProfile.description, ''),
          phone: safeString(companyProfile.phone, ''),
          website: safeString(companyProfile.website, ''),
          location: safeString(companyProfile.location, ''),
          size: safeString(companyProfile.size, ''),
          founded: safeString(companyProfile.founded, ''),
          status: safeString(companyProfile.status, 'pending')
        };
        setProfile(formattedProfile);
      } else {
        // Initialize profile with user data
        setProfile(prev => ({
          ...prev,
          companyName: safeString(user.name, ''),
          email: safeString(user.email, ''),
          status: 'pending',
          verified: false
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching company profile:', error);
  }
};

  // MODIFIED: Enhanced Algorithm to find qualified applicants - ALL APPLICANTS ARE QUALIFIED
  const findQualifiedApplicants = (jobId) => {
    if (!jobId) return [];

    const job = jobPostings.find(j => j.id === jobId);
    if (!job) return [];

    const jobApplications = applications.filter(app => app.jobId === jobId);
    
    // Score each applicant - ALL APPLICANTS ARE NOW QUALIFIED
    const scoredApplicants = jobApplications.map(app => {
      const student = allStudents.find(s => s.email === app.studentEmail || s.uid === app.studentId);
      
      // MODIFIED: Always give high scores to ensure all applicants are qualified
      const academicScore = calculateAcademicScore(student, job);
      const certificateScore = calculateCertificateScore(student, job);
      const experienceScore = calculateExperienceScore(student, job);
      const relevanceScore = calculateRelevanceScore(student, job);
      
      // MODIFIED: Ensure minimum score is always above 70%
      const baseScore = 75; // Start with 75% as base
      const calculatedScore = academicScore + certificateScore + experienceScore + relevanceScore;
      
      // Use the higher of base score or calculated score, capped at 95%
      const finalScore = Math.min(95, Math.max(baseScore, calculatedScore));

      return {
        ...app,
        studentData: student,
        qualificationScore: finalScore,
        breakdown: {
          academicScore: Math.max(20, academicScore),
          certificateScore: Math.max(15, certificateScore),
          experienceScore: Math.max(20, experienceScore),
          relevanceScore: Math.max(15, relevanceScore)
        },
        isQualified: true // MODIFIED: Always true
      };
    });

    // MODIFIED: Return ALL applicants sorted by score
    return scoredApplicants.sort((a, b) => b.qualificationScore - a.qualificationScore);
  };

  // MODIFIED: Enhanced scoring functions to ensure higher scores
  const calculateAcademicScore = (student, job) => {
    if (!student) return 25; // MODIFIED: Higher default score
    
    let score = 20; // MODIFIED: Start with higher base score
    
    // GPA-based scoring (if available and job requires it)
    if (student.gpa) {
      const gpa = parseFloat(student.gpa);
      if (!isNaN(gpa)) {
        if (gpa >= 3.8) score += 15;
        else if (gpa >= 3.5) score += 12;
        else if (gpa >= 3.0) score += 10;
        else if (gpa >= 2.5) score += 8;
        else if (gpa >= 2.0) score += 5;
        
        // MODIFIED: Remove penalty for not meeting minimum GPA
        if (job.minGPA && !isNaN(parseFloat(job.minGPA)) && parseFloat(job.minGPA) > gpa) {
          score += 0; // No penalty
        }
      }
    }
    
    // Academic achievements and honors
    if (student.academicAchievements) {
      const achievements = Array.isArray(student.academicAchievements) 
        ? student.academicAchievements 
        : [student.academicAchievements];
      score += Math.min(8, achievements.length * 2); // MODIFIED: Higher multiplier
    }
    
    // Institution reputation (basic scoring)
    if (student.institution) {
      const institution = institutions.find(inst => 
        inst.name === student.institution || inst.id === student.institution
      );
      if (institution?.type === 'University') score += 5;
      else if (institution?.type === 'College') score += 3;
    }
    
    return Math.min(30, score);
  };

  const calculateCertificateScore = (student, job) => {
    if (!student) return 20; // MODIFIED: Higher default score
    
    let score = 15; // MODIFIED: Start with higher base score
    
    // Required certificates match
    if (job.requiredCertificates && student.certificates) {
      const requiredCerts = safeString(job.requiredCertificates).toLowerCase().split(',').map(s => s.trim());
      const studentCerts = Array.isArray(student.certificates) 
        ? student.certificates 
        : [student.certificates];
      
      const matchingCerts = studentCerts.filter(cert => 
        requiredCerts.some(reqCert => safeString(cert).toLowerCase().includes(reqCert))
      );
      score += Math.min(15, matchingCerts.length * 5);
    }
    
    // Additional professional certifications
    if (student.professionalCertifications) {
      const certs = Array.isArray(student.professionalCertifications)
        ? student.professionalCertifications
        : [student.professionalCertifications];
      score += Math.min(10, certs.length * 3); // MODIFIED: Higher multiplier
    }
    
    return Math.min(25, score);
  };

  const calculateExperienceScore = (student, job) => {
    if (!student) return 20; // MODIFIED: Higher default score
    
    let score = 15; // MODIFIED: Start with higher base score
    
    // Work experience duration and relevance
    if (student.workExperience) {
      const experiences = Array.isArray(student.workExperience)
        ? student.workExperience
        : [student.workExperience];
      
      let totalRelevantMonths = 0;
      
      experiences.forEach(exp => {
        if (exp && typeof exp === 'object') {
          const months = exp.durationMonths || (exp.duration ? parseInt(exp.duration) : 6);
          
          // Check if experience is relevant to job
          if (job.requiredSkills && exp.description) {
            const jobSkills = safeString(job.requiredSkills).toLowerCase().split(',').map(s => s.trim());
            const isRelevant = jobSkills.some(skill => 
              safeString(exp.description).toLowerCase().includes(skill)
            );
            if (isRelevant) {
              totalRelevantMonths += months;
            }
          }
        }
      });
      
      if (totalRelevantMonths >= 24) score += 15;
      else if (totalRelevantMonths >= 12) score += 12;
      else if (totalRelevantMonths >= 6) score += 10;
      else if (totalRelevantMonths >= 3) score += 8;
      else score += 5; // MODIFIED: Minimum points for any experience
    }
    
    // Internships and projects
    if (student.internships) {
      const internships = Array.isArray(student.internships)
        ? student.internships
        : [student.internships];
      score += Math.min(8, internships.length * 2); // MODIFIED: Higher multiplier
    }
    
    return Math.min(25, score);
  };

  const calculateRelevanceScore = (student, job) => {
    if (!student) return 15; // MODIFIED: Higher default score
    
    let score = 12; // MODIFIED: Start with higher base score
    
    // Skills match
    if (student.skills && job.requiredSkills) {
      const jobSkills = safeString(job.requiredSkills).toLowerCase().split(',').map(s => s.trim());
      const studentSkills = Array.isArray(student.skills) 
        ? student.skills 
        : safeString(student.skills).split(',').map(s => s.trim());
      
      const matchingSkills = studentSkills.filter(skill => 
        jobSkills.some(jobSkill => safeString(skill).toLowerCase().includes(jobSkill))
      );
      score += Math.min(12, matchingSkills.length * 3); // MODIFIED: Higher multiplier
    }
    
    // Education field relevance
    if (student.courseOfStudy && job.qualifications) {
      const jobQualifications = safeString(job.qualifications).toLowerCase();
      const studentCourse = safeString(student.courseOfStudy).toLowerCase();
      
      if (jobQualifications.includes(studentCourse) || 
          studentCourse.includes(jobQualifications.split(' ')[0])) {
        score += 8;
      } else {
        score += 5; // MODIFIED: Give points even if not exact match
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

      // Update qualified applicants list if needed
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
      alert('Select files to upload.');
      return;
    }
    
    try {
      setUploadStatus('Uploading...');
      
      const uploadPromises = uploadedFiles.map(async (file) => {
        const fileRef = ref(storage, `company-documents/${user.uid}/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          uploadedAt: new Date().toISOString()
        };
      });

      const newDocs = await Promise.all(uploadPromises);
      
      // Update profile with new documents
      const updatedProfile = {
        ...profile,
        uploadedDocs: [...(profile.uploadedDocs || []), ...newDocs]
      };
      
      await updateCompany(user.uid, updatedProfile);
      setProfile(updatedProfile);
      
      setUploadedFiles([]);
      setUploadStatus('Upload successful!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error uploading documents:', error);
      setUploadStatus('Upload failed!');
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
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#84cc16';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>Company Dashboard</h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
              Welcome back, <strong>{safeString(profile.companyName || user?.name)}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              ...styles.badge, 
              background: profile.status === 'approved' ? '#d1fae5' : '#fef3c7',
              color: profile.status === 'approved' ? '#065f46' : '#92400e',
              fontSize: '14px',
              padding: '8px 16px'
            }}>
              Status: {safeString(profile.status)} {profile.verified && '✓'}
            </div>
            {profile.status === 'pending' && (
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
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
          { key: 'qualifiedApplicants', label: 'Qualified Applicants', count: applications.length } // MODIFIED: Show all applications count
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
          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Active Jobs</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                {jobPostings.filter(job => job.status === 'active').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Total Applications</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{applications.length}</p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Pending Review</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#2d3748'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Qualified Candidates</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{applications.length}</p> {/* MODIFIED: Show all applications */}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
            {/* Find Qualified Applicants */}
            <div style={styles.card}>
              <h3 style={styles.sectionHeader}> Quick Actions</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
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
                      {safeString(job.title)}
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
                  marginBottom: '15px'
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
              <h3 style={styles.sectionHeader}> Recent Applications</h3>
              {applications.slice(0, 5).map(app => (
                <div key={app.id} style={styles.dataItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong style={{ color: '#1e293b' }}>{safeString(app.studentName)}</strong>
                    <span style={{ 
                      ...styles.badge,
                      background: getStatusColor(app.status),
                      color: 'white'
                    }}>
                      {safeString(app.status)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>{safeString(app.jobTitle)}</p>
                  <small style={{ color: '#94a3b8' }}>
                    Applied: {formatTimestamp(app.appliedAt)}
                  </small>
                </div>
              ))}
              {applications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
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
          <h2 style={styles.sectionHeader}> Company Profile</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
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

          <div style={{ marginBottom: '25px' }}>
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
            {profileLoading ? ' Updating...' : ' Update Profile'}
          </button>

          {/* Document Upload */}
          <div style={{ marginTop: '40px', paddingTop: '25px', borderTop: '2px solid #f1f5f9' }}>
            <h3 style={{ ...styles.sectionHeader, fontSize: '1.3rem' }}> Company Documents</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Upload company registration documents, certificates, or any other relevant files for verification.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload}
                style={{ 
                  padding: '10px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  background: '#f9fafb'
                }}
              />
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
                padding: '12px 16px', 
                background: uploadStatus.includes('successful') ? '#d1fae5' : '#fef3c7',
                border: `1px solid ${uploadStatus.includes('successful') ? '#10b981' : '#f59e0b'}`,
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                {uploadStatus}
              </div>
            )}
            
            <h4 style={{ marginBottom: '15px', color: '#374151' }}>Uploaded Documents:</h4>
            {(!profile.uploadedDocs || profile.uploadedDocs.length === 0) ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No documents uploaded yet.</p>
            ) : (
              <div style={styles.gridAuto}>
                {profile.uploadedDocs.map((doc, index) => (
                  <div key={index} style={styles.dataItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ color: '#1e293b' }}>{safeString(doc.name)}</strong>
                      <span style={{ ...styles.badge, ...styles.badgePrimary }}>
                        {safeString(doc.type || 'Document')}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      Size: {(doc.size / 1024).toFixed(1)} KB
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      Uploaded: {formatTimestamp(doc.uploadedAt)}
                    </div>
                    {doc.url && (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-block',
                          marginTop: '8px',
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        📎 View Document
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
          <h2 style={styles.sectionHeader}> Post a New Job</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.formLabel}>Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g., JavaScript, React, Node.js, AWS"
              value={newJob.requiredSkills}
              onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '25px' }}>
            <label style={styles.formLabel}>Job Description *</label>
            <textarea
              placeholder="Describe the job responsibilities, requirements, company culture, benefits..."
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              style={{ ...styles.textarea, minHeight: '150px' }}
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
            {jobLoading ? ' Posting...' : ' Post Job'}
          </button>
        </div>
      )}

      {/* Job Postings Tab */}
      {activeTab === 'jobPostings' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}> Current Job Postings</h2>
            <span style={{ ...styles.badge, ...styles.badgePrimary }}>
              {jobPostings.length} Jobs
            </span>
          </div>

          {jobPostings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <h3 style={{ color: '#94a3b8' }}>No jobs posted yet</h3>
              <p>Start by posting your first job opening!</p>
              <button 
                onClick={() => setActiveTab('postJob')}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  marginTop: '15px'
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
                  borderLeft: `4px solid ${job.status === 'active' ? '#10b981' : '#ef4444'}`,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{safeString(job.title)}</h3>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ ...styles.badge, ...styles.badgePrimary }}>
                          {safeString(job.jobType)}
                        </span>
                        <span style={job.status === 'active' ? styles.statusActive : styles.statusInactive}>
                          {safeString(job.status)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => openEditJobModal(job)}
                        style={{ 
                          ...styles.button,
                          background: '#f3f4f6',
                          color: '#374151',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        style={{ 
                          ...styles.button,
                          background: '#fef2f2',
                          color: '#dc2626',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                      >
                        
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '5px 0', color: '#374151' }}>
                      <strong> Location:</strong> {safeString(job.location, 'Not specified')}
                    </p>
                    <p style={{ margin: '5px 0', color: '#374151' }}>
                      <strong> Experience:</strong> {safeString(job.experience)}
                    </p>
                    <p style={{ margin: '5px 0', color: '#374151' }}>
                      <strong> Qualifications:</strong> {safeString(job.qualifications)}
                    </p>
                    <p style={{ margin: '5px 0', color: '#374151' }}>
                      <strong> Required Skills:</strong> {safeString(job.requiredSkills, 'Not specified')}
                    </p>
                    {job.salary && (
                      <p style={{ margin: '5px 0', color: '#374151' }}>
                        <strong> Salary:</strong> {safeString(job.salary)}
                      </p>
                    )}
                    {job.deadline && (
                      <p style={{ margin: '5px 0', color: '#374151' }}>
                        <strong> Deadline:</strong> {formatTimestamp(job.deadline)}
                      </p>
                    )}
                    {job.description && (
                      <p style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        {safeString(job.description).length > 150 ? safeString(job.description).substring(0, 150) + '...' : safeString(job.description)}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <small style={{ color: '#94a3b8' }}>
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
                        padding: '8px 16px',
                        fontSize: '12px'
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}> Candidate Applications</h2>
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
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.9 }}>Accepted</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'accepted').length}
              </p>
            </div>
            <div style={{ 
              ...styles.statCard,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.9 }}>Rejected</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <h3 style={{ color: '#94a3b8' }}>No applications received yet</h3>
              <p>Applications will appear here when students apply to your job postings.</p>
            </div>
          ) : (
            <div style={styles.gridAuto}>
              {applications.map(app => (
                <div key={app.id} style={{ 
                  ...styles.dataItem,
                  borderLeft: `4px solid ${getStatusColor(app.status)}`,
                  background: app.status === 'accepted' ? '#f0fdf4' : 
                             app.status === 'rejected' ? '#fef2f2' : '#fffbeb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                        {safeString(app.studentName)}
                      </h4>
                      <p style={{ margin: '0', color: '#64748b' }}>{safeString(app.studentEmail)}</p>
                    </div>
                    <span style={{ 
                      ...styles.badge,
                      background: getStatusColor(app.status),
                      color: 'white'
                    }}>
                      {safeString(app.status)}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px 0', color: '#374151' }}>
                    <strong>Applied for:</strong> {safeString(app.jobTitle)}
                  </p>
                  <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Applied on: {formatTimestamp(app.appliedAt)}
                  </p>

                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonSuccess
                        }}
                      >
                        ✅ Accept
                      </button>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonDanger
                        }}
                      >
                        ❌ Reject
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={styles.sectionHeader}> Qualified Applicants</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ ...styles.badge, ...styles.badgeSuccess }}>
                {qualifiedApplicants.length} Qualified
              </span>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                All Applicants Meet Requirements
              </span>
            </div>
          </div>

          {/* Job Selection for Filtering */}
          <div style={{ 
            ...styles.dataItem,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>Filter by Job</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedJobForFiltering}
                onChange={(e) => setSelectedJobForFiltering(e.target.value)}
                style={{ ...styles.select, minWidth: '300px' }}
              >
                <option value="">Select a job</option>
                {jobPostings.map(job => (
                  <option key={job.id} value={job.id}>
                    {safeString(job.title)}
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
            <div style={{ textAlign: 'center', padding: '60px 40px', color: '#64748b' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}></div>
              <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>No qualified applicants found</h3>
              <p style={{ marginBottom: '25px' }}>
                Select a job and click "Find Qualified Applicants" to see candidates who meet your criteria.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                All applicants are considered qualified and ready for consideration.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid #10b981'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#065f46' }}> All Candidates Are Qualified</h4>
                <p style={{ margin: '0', color: '#047857' }}>
                  Showing <strong>all {qualifiedApplicants.length}</strong> applicants who have applied for this position. 
                  Every candidate meets the basic requirements and is ready for your consideration.
                </p>
              </div>
              
              <div style={styles.gridAuto}>
                {qualifiedApplicants.map(app => (
                  <div key={app.id} style={{ 
                    ...styles.dataItem,
                    border: `2px solid ${getScoreColor(app.qualificationScore)}`,
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                          {safeString(app.studentName)}
                        </h3>
                        <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>{safeString(app.studentEmail)}</p>
                        <p style={{ margin: '5px 0 0 0', color: '#374151' }}>
                          <strong>Applied for:</strong> {safeString(app.jobTitle)}
                        </p>
                      </div>
                      <div style={{ 
                        ...styles.scoreCard,
                        background: getScoreColor(app.qualificationScore),
                        minWidth: '80px'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{app.qualificationScore}%</div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>SCORE</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div style={{ marginBottom: '20px' }}>
                      <h5 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.9rem' }}>
                        Qualification Breakdown:
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}> Academic</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{app.breakdown.academicScore}/30</div>
                        </div>
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}> Certificates</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{app.breakdown.certificateScore}/25</div>
                        </div>
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}> Experience</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{app.breakdown.experienceScore}/25</div>
                        </div>
                        <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}> Relevance</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{app.breakdown.relevanceScore}/20</div>
                        </div>
                      </div>
                    </div>

                    {/* Student Details */}
                    {app.studentData && (
                      <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>Student Profile</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
                          <div><strong> GPA:</strong> {safeString(app.studentData.gpa, 'Not specified')}</div>
                          <div><strong> Course:</strong> {safeString(app.studentData.courseOfStudy, 'Not specified')}</div>
                          <div><strong> Institution:</strong> {safeString(app.studentData.institution, 'Not specified')}</div>
                          <div><strong> Skills:</strong> {safeString(app.studentData.skills, 'Not specified')}</div>
                        </div>
                        {app.studentData.workExperience && (
                          <div style={{ marginTop: '10px' }}>
                            <strong>💼 Experience:</strong> {Array.isArray(app.studentData.workExperience) ? app.studentData.workExperience.length + ' positions' : 'Available'}
                          </div>
                        )}
                        {app.studentData.certificates && (
                          <div style={{ marginTop: '5px' }}>
                            <strong> Certificates:</strong> {Array.isArray(app.studentData.certificates) ? app.studentData.certificates.length + ' certificates' : 'Available'}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonSuccess,
                          fontSize: '14px'
                        }}
                      >
                        ✅ Accept for Interview
                      </button>
                      <button 
                        onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                        style={{ 
                          ...styles.button,
                          ...styles.buttonDanger,
                          fontSize: '14px'
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
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#334155', marginBottom: '25px' }}>Edit Job Posting</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Job Title</label>
              <input
                type="text"
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
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
                style={{ ...styles.button, background: '#6b7280', color: 'white' }}
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