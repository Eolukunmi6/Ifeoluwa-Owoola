import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { TutorCard } from '../../components/marketplace/TutorCard';
import { TutorFilters } from '../../components/marketplace/TutorFilters';
import { SlidersHorizontal, X } from 'lucide-react';

export function TutorsList() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedExamination, setSelectedExamination] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        // Fetch all tutors that have completed their profile: bio, profile photo, at least one subject, at least one active lesson package.
        
        let fetchQuery = supabase
          .from('tutors')
          .select(`
            id, bio, verified, teaching_age_min, teaching_age_max, currency,
            profiles!inner(id, full_name, profile_photo, country, state, city, active),
            tutor_videos(id, title, video_url, subject_id, subjects(name)),
            lesson_packages!inner(price, active, package_type, session_hours, session_minutes, days_per_week)
          `)
          .not('bio', 'is', null)
          .not('profiles.profile_photo', 'is', null)
          .eq('lesson_packages.active', true);
          
        let { data, error } = await fetchQuery;
        
        if (error && error.message.includes('active')) {
          // Fallback if migration not run yet
          const fallbackQuery = supabase
            .from('tutors')
            .select(`
              id, bio, verified, teaching_age_min, teaching_age_max, currency,
              profiles!inner(id, full_name, profile_photo, country, state, city),
              tutor_videos(id, title, video_url, subject_id, subjects(name)),
              lesson_packages!inner(price, active, package_type, session_hours, session_minutes, days_per_week)
            `)
            .not('bio', 'is', null)
            .not('profiles.profile_photo', 'is', null)
            .eq('lesson_packages.active', true);
          
          const fallbackRes = await fallbackQuery;
          data = fallbackRes.data as any;
          error = fallbackRes.error;
        }

          
        if (error) throw error;
        
        // Transform data
        const transformedTutors = (data || []).map((t: any) => {
          const profile: any = t.profiles || {};
          const subjects = (t.tutor_subjects || []).map((ts: any) => ts.subjects?.name).filter(Boolean);
          const examinations = []; // Safely default to empty since table doesn't exist yet
          const activePackages = (t.lesson_packages || []).filter((p: any) => p.active);
          const startingPrice = activePackages.length > 0 
            ? Math.min(...activePackages.map((p: any) => p.price))
            : 0;
            
          return {
            id: t.id,
            profile_id: profile.id,
            full_name: profile.full_name,
            profile_photo: profile.profile_photo,
            country: profile.country,
            state: profile.state,
            city: profile.city,
            active: profile.active,
            bio: t.bio,
            verified: t.verified,
            teaching_age_min: t.teaching_age_min,
            teaching_age_max: t.teaching_age_max,
            currency: t.currency || 'USD',
            subjects,
            examinations,
            startingPrice,
            lesson_packages: activePackages
          };
        });
        
        setTutors(transformedTutors);
      } catch (error) {
        console.error('Error fetching marketplace tutors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutors();
  }, []);

  // Filter Logic
  const filteredTutors = useMemo(() => {
    let result = [...tutors];

    // Name search
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => t.full_name?.toLowerCase().includes(lowerQ));
    }

    // Verified only
    // Filter out inactive tutors
    result = result.filter(t => t.active !== false);
    if (verifiedOnly) {
      result = result.filter(t => t.verified);
    }

    // Subjects (must have ALL selected subjects, or ANY? Let's do ANY for broader search, or ALL if requested. ANY is standard.)
    if (selectedSubjects.length > 0) {
      result = result.filter(t => t.subjects.some((sub: string) => selectedSubjects.includes(sub)));
    }

    // Examination
    if (selectedExamination && selectedSubjects.includes('High School Final Exam')) {
      result = result.filter(t => t.examinations && t.examinations.includes(selectedExamination));
    }

    // Location
    if (selectedCountry) result = result.filter(t => t.country === selectedCountry);
    if (selectedState) result = result.filter(t => t.state === selectedState);
    if (selectedCity) result = result.filter(t => t.city === selectedCity);

    // Currency & Price
    if (selectedCurrency) {
      result = result.filter(t => t.currency === selectedCurrency);
      
      const min = parseFloat(priceMin);
      if (!isNaN(min)) {
        result = result.filter(t => t.startingPrice >= min);
      }
      const max = parseFloat(priceMax);
      if (!isNaN(max)) {
        result = result.filter(t => t.startingPrice <= max);
      }
    }

    // Sorting
    if (priceSort === 'asc') {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (priceSort === 'desc') {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    return result;
  }, [tutors, searchQuery, verifiedOnly, selectedSubjects, selectedCountry, selectedState, selectedCity, selectedCurrency, priceMin, priceMax, priceSort]);

  const handleResetFilters = () => {
    setSelectedSubjects([]);
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setSelectedCurrency('');
    setPriceSort('none');
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
    setVerifiedOnly(false);
  };

  return (
    <div className="bg-transparent min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Find a Tutor</h1>
            <p className="mt-2 text-lg text-slate-500">Discover verified educators tailored to your child's needs.</p>
          </div>
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {showMobileFilters ? <><X className="w-5 h-5" /> Hide Filters</> : <><SlidersHorizontal className="w-5 h-5" /> Show Filters</>}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-1/4 flex-shrink-0 mb-6 lg:mb-0`}>
            <TutorFilters 
              tutors={tutors}
              
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              
              selectedSubjects={selectedSubjects}
              setSelectedSubjects={setSelectedSubjects}
              selectedExamination={selectedExamination}
              setSelectedExamination={setSelectedExamination}
              
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              priceSort={priceSort}
              setPriceSort={setPriceSort}
              
              onReset={handleResetFilters}
            />
          </div>

          {/* Grid */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 h-[300px] shadow-sm border border-slate-100 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-slate-200 rounded"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-8">
                      <div className="h-4 w-full bg-slate-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTutors.map(tutor => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No tutors found</h3>
                <p className="text-slate-500 max-w-sm mb-6">We couldn't find any tutors matching your current filters. Try adjusting your search criteria.</p>
                <button 
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-sky-50 text-sky-700 font-bold rounded-xl shadow-sm hover:bg-sky-100 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
