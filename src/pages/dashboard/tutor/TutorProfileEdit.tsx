import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../providers/AuthProvider';
import { SubjectPicker } from '../../../components/tutor/SubjectPicker';
import { ExaminationPicker } from '../../../components/tutor/ExaminationPicker';
import { Subject } from '../../../types';
import { ProfilePhotoUpload } from '../../../components/tutor/ProfilePhotoUpload';
import { TutorProfile, UserProfileData } from '../../../types';

export function TutorProfileEdit() {
  const { session, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tutorData, setTutorData] = useState<Partial<TutorProfile>>({});
  const [profileData, setProfileData] = useState<Partial<UserProfileData>>({});
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [examIds, setExamIds] = useState<string[]>([]);
  const [tutorRecordId, setTutorRecordId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user.id) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch Profile info (location, photo)
        const { data: pData, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (pError) throw pError;
        if (pData) setProfileData(pData);

        // 2. Fetch Tutor info
        const { data: tData, error: tError } = await supabase
          .from('tutors')
          .select('*')
          .eq('profile_id', session.user.id)
          .maybeSingle();
          
        if (tError) throw tError;
        if (tData) {
          setTutorData(tData);
          setTutorRecordId(tData.id);
          
          // 3. Fetch Selected Subjects
          const { data: tsData, error: tsError } = await supabase
            .from('tutor_subjects')
            .select('subject_id')
            .eq('tutor_id', tData.id);
            
          if (tsError) throw tsError;
          if (tsData) {
            setSubjectIds(tsData.map(ts => ts.subject_id));
          }

          // Fetch Selected Exams
          const { data: teData } = await supabase
            .from('tutor_examinations')
            .select('examination_id')
            .eq('tutor_id', tData.id);
          if (teData) {
            setExamIds(teData.map((te: any) => te.examination_id));
          }
        }
      } catch (err: any) {
        if (err.code === 'PGRST205') {
          setError('Database setup required: The required database tables have not been created yet. Please run the Phase 3 SQL script in your Supabase SQL Editor.');
        } else {
          // Since we use maybeSingle(), any other error caught here is a genuine failure
          console.error('Error fetching tutor profile data:', err);
          setError(err.message || 'Failed to load profile data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tutorData.bio) {
      setError('Please provide a bio.');
      return;
    }

    if (subjectIds.length === 0) {
      setError('Please select at least one subject.');
      return;
    }

    const minAge = tutorData.teaching_age_min || 0;
    const maxAge = tutorData.teaching_age_max || 0;
    
    if (minAge > maxAge) {
      setError('Minimum teaching age cannot be greater than maximum teaching age.');
      return;
    }

    setSaving(true);

    try {
      if (!session?.user.id) throw new Error('Session not found');

      // 1. Update Profile (Location & Photo)
      const { error: pError } = await supabase
        .from('profiles')
        .update({
          country: profileData.country,
          state: profileData.state,
          city: profileData.city,
          profile_photo: profileData.profile_photo,
        })
        .eq('id', session.user.id);
        
      if (pError) throw pError;

      let currentTutorId = tutorRecordId;

      // 2. Update or Insert Tutor Profile
      if (currentTutorId) {
        const { error: tError } = await supabase
          .from('tutors')
          .update({
            bio: tutorData.bio,
            certification: tutorData.certification,
            experience: tutorData.experience,
            teaching_age_min: tutorData.teaching_age_min,
            teaching_age_max: tutorData.teaching_age_max,
          })
          .eq('id', currentTutorId);
        if (tError) throw tError;
      } else {
        const { data: newTutor, error: tError } = await supabase
          .from('tutors')
          .insert([{
            profile_id: session.user.id,
            bio: tutorData.bio,
            certification: tutorData.certification,
            experience: tutorData.experience,
            teaching_age_min: tutorData.teaching_age_min,
            teaching_age_max: tutorData.teaching_age_max,
          }])
          .select('id')
          .single();
        if (tError) throw tError;
        currentTutorId = newTutor.id;
        setTutorRecordId(newTutor.id);
      }

      // 3. Update Subjects (Delete all current, then insert)
      const { error: delError } = await supabase
        .from('tutor_subjects')
        .delete()
        .eq('tutor_id', currentTutorId);
        
      if (delError) throw delError;

      if (subjectIds.length > 0) {
        const { error: insertError } = await supabase
          .from('tutor_subjects')
          .insert(subjectIds.map(id => ({
            tutor_id: currentTutorId,
            subject_id: id
          })));
          
        if (insertError) throw insertError;
      }

      // 4. Update Examinations
      await supabase.from('tutor_examinations').delete().eq('tutor_id', currentTutorId);
      if (examIds.length > 0) {
        await supabase.from('tutor_examinations').insert(examIds.map(id => ({
          tutor_id: currentTutorId,
          examination_id: id
        })));
      }

      await refreshProfile();
      navigate('/dashboard/tutor');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'An error occurred while saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSuccess = (url: string) => {
    setProfileData(prev => ({ ...prev, profile_photo: url }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Tutor Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Complete your profile to stand out to parents.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/tutor')}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Section */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Profile Photo</h3>
              <ProfilePhotoUpload 
                currentPhotoUrl={profileData.profile_photo || null} 
                onUploadSuccess={handlePhotoSuccess} 
              />
            </section>

            <hr className="border-slate-100" />

            {/* Basic Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Bio *</label>
                <textarea 
                  rows={4}
                  required
                  value={tutorData.bio || ''}
                  onChange={(e) => setTutorData({...tutorData, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px] resize-none"
                  placeholder="Tell parents about your teaching style and background..."
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Certification / Degree</label>
                <input 
                  type="text" 
                  value={tutorData.certification || ''}
                  onChange={(e) => setTutorData({...tutorData, certification: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                  placeholder="e.g. B.Ed in Mathematics"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Years of Experience</label>
                <input 
                  type="number" 
                  min="0"
                  value={tutorData.experience || ''}
                  onChange={(e) => setTutorData({...tutorData, experience: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Min Student Age</label>
                <input 
                  type="number" 
                  min="0"
                  value={tutorData.teaching_age_min || ''}
                  onChange={(e) => setTutorData({...tutorData, teaching_age_min: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                  placeholder="e.g. 6"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Max Student Age</label>
                <input 
                  type="number" 
                  min="0"
                  value={tutorData.teaching_age_max || ''}
                  onChange={(e) => setTutorData({...tutorData, teaching_age_max: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                  placeholder="e.g. 18"
                />
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Subjects */}
            <section>
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-3 tracking-wide">Subjects Taught *</label>
              
              <SubjectPicker selectedSubjectIds={subjectIds} onChange={(ids, subjects) => {
                setSubjectIds(ids);
                if (subjects) setAllSubjects(subjects);
              }} />
              
              {(() => {
                const isHighSchoolSelected = subjectIds.some(id => allSubjects.find(s => s.id === id)?.name === 'High School Final Exam');
                if (isHighSchoolSelected && profileData.country) {
                  return (
                    <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="block text-[12px] font-bold text-indigo-500 uppercase mb-3 tracking-wide">Which examination(s) do you teach for in {profileData.country}?</label>
                      <ExaminationPicker countryName={profileData.country} selectedExamIds={examIds} onChange={setExamIds} />
                    </div>
                  );
                } else if (isHighSchoolSelected && !profileData.country) {
                   return <div className="mt-4 text-xs text-amber-600">Please enter your Country below to select specific high school examinations.</div>;
                }
                return null;
              })()}

            </section>

            <hr className="border-slate-100" />

            {/* Location */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Country</label>
                <input 
                  type="text" 
                  value={profileData.country || ''}
                  onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">State/Province</label>
                <input 
                  type="text" 
                  value={profileData.state || ''}
                  onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">City</label>
                <input 
                  type="text" 
                  value={profileData.city || ''}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                />
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full md:w-auto px-8 bg-sky-500 text-white py-3.5 rounded-xl font-bold hover:bg-sky-600 transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
