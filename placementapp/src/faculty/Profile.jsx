import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBriefcase, FaEdit, FaSave, FaTimes, FaCamera, FaLinkedin, FaTwitter, FaGithub, FaGlobe, FaMapMarkerAlt, FaCalendarAlt, FaAward, FaBook, FaUsers, FaChartLine, FaClock, FaLanguage, FaCertificate, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function FacultyProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      avatar: '',
      location: '',
      joinDate: '',
      languages: []
    },
    professionalInfo: {
      department: '',
      designation: '',
      experience: '',
      specialization: [],
      education: [],
      certifications: [],
      publications: [],
      research: []
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    },
    stats: {
      coursesTaught: 0,
      studentsMentored: 0,
      publicationsCount: 0,
      experienceYears: 0
    }
  });

  const [tempProfile, setTempProfile] = useState(profile);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Dynamic profile loading with error handling
  const loadProfile = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      
      const token = localStorage.getItem('access');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/faculty/login');
        return;
      }

      const response = await fetch(`http://${window.location.hostname}:8000/api/faculty/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/faculty/login');
        return;
      }

      if (response.status === 403) {
        toast.error('Access denied. Faculty privileges required.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Dynamic data formatting with validation
      const formattedProfile = {
        personalInfo: {
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          location: data.location || '',
          joinDate: data.join_date || '',
          languages: Array.isArray(data.languages) ? data.languages : []
        },
        professionalInfo: {
          department: data.department || '',
          designation: data.designation || '',
          experience: data.experience || '',
          specialization: Array.isArray(data.specialization) ? data.specialization : [],
          education: Array.isArray(data.education) ? data.education : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          publications: Array.isArray(data.publications) ? data.publications : [],
          research: Array.isArray(data.research_interests) ? data.research_interests : []
        },
        socialLinks: {
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          github: data.github || '',
          website: data.website || ''
        },
        stats: {
          coursesTaught: parseInt(data.courses_taught) || 0,
          studentsMentored: parseInt(data.students_mentored) || 0,
          publicationsCount: parseInt(data.publications_count) || 0,
          experienceYears: parseInt(data.experience_years) || 0
        }
      };

      setProfile(formattedProfile);
      setTempProfile(formattedProfile);
      setLastUpdated(new Date());
      
      if (showRefreshIndicator) {
        toast.success('Profile refreshed successfully!');
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(`Failed to load profile: ${error.message}`);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setRefreshing(false);
    }
  }, [navigate]);

  // Dynamic statistics refresh
  const refreshStats = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`http://${window.location.hostname}:8000/api/faculty/profile/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const stats = await response.json();
        setProfile(prev => ({
          ...prev,
          stats: {
            coursesTaught: parseInt(stats.courses_taught) || 0,
            studentsMentored: parseInt(stats.students_mentored) || 0,
            publicationsCount: parseInt(stats.publications_count) || 0,
            experienceYears: parseInt(stats.experience_years) || 0
          }
        }));
        setTempProfile(prev => ({
          ...prev,
          stats: {
            coursesTaught: parseInt(stats.courses_taught) || 0,
            studentsMentored: parseInt(stats.students_mentored) || 0,
            publicationsCount: parseInt(stats.publications_count) || 0,
            experienceYears: parseInt(stats.experience_years) || 0
          }
        }));
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProfile();
    
    // Set up periodic stats refresh (every 30 seconds)
    const statsInterval = setInterval(refreshStats, 30000);
    
    return () => clearInterval(statsInterval);
  }, [loadProfile]);

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      
      // Dynamic payload with validation
      const payload = {
        first_name: tempProfile.personalInfo.firstName.trim(),
        last_name: tempProfile.personalInfo.lastName.trim(),
        phone: tempProfile.personalInfo.phone.trim(),
        bio: tempProfile.personalInfo.bio.trim(),
        location: tempProfile.personalInfo.location.trim(),
        join_date: tempProfile.personalInfo.joinDate,
        languages: tempProfile.personalInfo.languages.filter(lang => lang.trim()),
        department: tempProfile.professionalInfo.department.trim(),
        designation: tempProfile.professionalInfo.designation.trim(),
        experience: tempProfile.professionalInfo.experience.trim(),
        specialization: tempProfile.professionalInfo.specialization.filter(spec => spec.trim()),
        education: tempProfile.professionalInfo.education.filter(edu => edu && typeof edu === 'object'),
        certifications: tempProfile.professionalInfo.certifications.filter(cert => cert && typeof cert === 'object'),
        publications: tempProfile.professionalInfo.publications.filter(pub => pub && typeof pub === 'object'),
        research_interests: tempProfile.professionalInfo.research.filter(research => research.trim()),
        linkedin: tempProfile.socialLinks.linkedin.trim(),
        twitter: tempProfile.socialLinks.twitter.trim(),
        github: tempProfile.socialLinks.github.trim(),
        website: tempProfile.socialLinks.website.trim(),
      };

      const response = await fetch(`http://${window.location.hostname}:8000/api/faculty/profile/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(tempProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        
        // Refresh stats after update
        await refreshStats();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Failed to update profile';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (section, field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should not exceed 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('access');
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`http://${window.location.hostname}:8000/api/faculty/profile/avatar/upload/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const newAvatarUrl = data.avatar_url;
          
          setProfile(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              avatar: newAvatarUrl
            }
          }));
          setTempProfile(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              avatar: newAvatarUrl
            }
          }));
          toast.success('Avatar uploaded successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload avatar');
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error(`Error uploading avatar: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAvatarDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`http://${window.location.hostname}:8000/api/faculty/profile/avatar/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            avatar: ''
          }
        }));
        setTempProfile(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            avatar: ''
          }
        }));
        toast.success('Avatar deleted successfully!');
      } else {
        throw new Error('Failed to delete avatar');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error(`Error deleting avatar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (section, field, newItem) => {
    setTempProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], newItem]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setTempProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  // Dynamic initials calculation
  const getInitials = (firstName, lastName) => {
    return (firstName?.[0] || '') + (lastName?.[0] || '') || 'U';
  };

  // Dynamic full name calculation
  const getFullName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Faculty Member';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header with Refresh */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Profile Overview</h2>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => loadProfile(true)}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              title="Refresh profile"
            >
              {refreshing ? <FaSpinner className="animate-spin" /> : <FaChartLine />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profile.personalInfo.avatar ? (
              <img 
                src={profile.personalInfo.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold ${profile.personalInfo.avatar ? 'hidden' : 'flex'}`}>
              {getInitials(profile.personalInfo.firstName, profile.personalInfo.lastName)}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition cursor-pointer">
              <FaCamera className="text-sm" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {getFullName(profile.personalInfo.firstName, profile.personalInfo.lastName)}
            </h1>
            <p className="text-gray-600">{profile.professionalInfo.designation || 'Faculty Member'}</p>
            <p className="text-gray-500">{profile.professionalInfo.department || 'Department'}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FaEnvelope /> {profile.personalInfo.email}
              </span>
              <span className="flex items-center gap-1">
                <FaPhone /> {profile.personalInfo.phone || 'Not provided'}
              </span>
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {profile.personalInfo.location || 'Not provided'}
              </span>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Courses Taught</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.coursesTaught}</p>
            </div>
            <FaBook className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Students Mentored</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.studentsMentored}</p>
            </div>
            <FaUsers className="text-green-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Publications</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.publicationsCount}</p>
            </div>
            <FaAward className="text-purple-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Experience</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.experienceYears} years</p>
            </div>
            <FaBriefcase className="text-orange-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Dynamic Bio */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
        <p className="text-gray-600">
          {profile.personalInfo.bio || 'No bio provided. Click "Edit Profile" to add your bio.'}
        </p>
      </div>

      {/* Dynamic Social Links */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
        <div className="flex space-x-4">
          {profile.socialLinks.linkedin && (
            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition">
              <FaLinkedin className="text-2xl" />
            </a>
          )}
          {profile.socialLinks.twitter && (
            <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 transition">
              <FaTwitter className="text-2xl" />
            </a>
          )}
          {profile.socialLinks.github && (
            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-600 transition">
              <FaGithub className="text-2xl" />
            </a>
          )}
          {profile.socialLinks.website && (
            <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition">
              <FaGlobe className="text-2xl" />
            </a>
          )}
          {!profile.socialLinks.linkedin && !profile.socialLinks.twitter && !profile.socialLinks.github && !profile.socialLinks.website && (
            <p className="text-gray-500 text-sm">No social links provided. Edit your profile to add them.</p>
          )}
        </div>
      </div>

      {/* Dynamic Skills & Expertise */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specialization</h4>
            <div className="flex flex-wrap gap-2">
              {profile.professionalInfo.specialization.length > 0 ? (
                profile.professionalInfo.specialization.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No specialization listed</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {profile.personalInfo.languages.length > 0 ? (
                profile.personalInfo.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {lang}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No languages listed</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={tempProfile.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={tempProfile.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={tempProfile.personalInfo.email}
            disabled
            className="p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={tempProfile.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={tempProfile.personalInfo.location}
            onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={tempProfile.personalInfo.joinDate}
            onChange={(e) => handleInputChange('personalInfo', 'joinDate', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <textarea
          placeholder="Bio"
          value={tempProfile.personalInfo.bio}
          onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
          rows="4"
        />
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Department"
            value={tempProfile.professionalInfo.department}
            onChange={(e) => handleInputChange('professionalInfo', 'department', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Designation"
            value={tempProfile.professionalInfo.designation}
            onChange={(e) => handleInputChange('professionalInfo', 'designation', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Experience"
            value={tempProfile.professionalInfo.experience}
            onChange={(e) => handleInputChange('professionalInfo', 'experience', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={tempProfile.socialLinks.linkedin}
            onChange={(e) => handleInputChange('socialLinks', 'linkedin', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="Twitter URL"
            value={tempProfile.socialLinks.twitter}
            onChange={(e) => handleInputChange('socialLinks', 'twitter', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="GitHub URL"
            value={tempProfile.socialLinks.github}
            onChange={(e) => handleInputChange('socialLinks', 'github', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="Website URL"
            value={tempProfile.socialLinks.website}
            onChange={(e) => handleInputChange('socialLinks', 'website', e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          <FaTimes /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
        >
          <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  if (loading && !profile.personalInfo.firstName) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Profile</h1>
          <p className="text-gray-600">Manage your professional profile and information</p>
        </div>

        {isEditing ? renderEditForm() : renderOverview()}
      </div>
    </div>
  );
}

export default FacultyProfile;
