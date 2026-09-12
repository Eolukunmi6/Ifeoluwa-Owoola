import React, { useMemo } from 'react';

const OFFICIAL_SUBJECTS = [
  'Numeracy', 'Literacy', 'Basic Science', 'Music', 
  'Phonics', 'Art & Craft', 'Computer & Coding', 
  'High School Final Exam', 'High School Mathematics', 
  'High School English', 'Biology', 'Chemistry', 
  'Physics', 'Commerce', 'Accounting', 'Economics', 'Geography'
];

interface TutorFiltersProps {
  tutors: any[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  selectedSubjects: string[];
  selectedExamination?: string;
  setSelectedExamination?: (v: string) => void;
  setSelectedSubjects: (v: string[]) => void;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  selectedState: string;
  setSelectedState: (v: string) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (v: string) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  priceSort: 'none' | 'asc' | 'desc';
  setPriceSort: (v: 'none' | 'asc' | 'desc') => void;
  onReset: () => void;
}

import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

export function TutorFilters(props: TutorFiltersProps) {
  const [availableExaminations, setAvailableExaminations] = useState<string[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  
  useEffect(() => {
    if (props.selectedSubjects.includes('High School Final Exam') && props.selectedCountry) {
      const fetchExams = async () => {
        setExamsLoading(true);
        try {
          const { data: cData } = await supabase.from('countries').select('id').eq('name', props.selectedCountry).maybeSingle();
          if (cData) {
            const { data: eData } = await supabase.from('examinations').select('name').eq('country_id', cData.id).eq('active', true).order('name');
            if (eData) {
              setAvailableExaminations(eData.map(e => e.name));
            } else {
               setAvailableExaminations([]);
            }
          } else {
             setAvailableExaminations([]);
          }
        } catch(e) {
           console.error(e);
        } finally {
          setExamsLoading(false);
        }
      };
      fetchExams();
    } else {
      setAvailableExaminations([]);
      if (props.setSelectedExamination) props.setSelectedExamination('');
    }
  }, [props.selectedSubjects, props.selectedCountry]);

  // Extract dynamic location and currency options from the fetched tutors
  const { countries, statesForCountry, citiesForState, currencies } = useMemo(() => {
    const cSet = new Set<string>();
    const currSet = new Set<string>();
    
    props.tutors.forEach(t => {
      if (t.country) cSet.add(t.country);
      if (t.currency) currSet.add(t.currency);
    });
    
    const statesSet = new Set<string>();
    props.tutors.forEach(t => {
      if (props.selectedCountry && t.country === props.selectedCountry && t.state) {
        statesSet.add(t.state);
      }
    });

    const citiesSet = new Set<string>();
    props.tutors.forEach(t => {
      if (props.selectedState && t.state === props.selectedState && t.city) {
        citiesSet.add(t.city);
      }
    });

    return {
      countries: Array.from(cSet).sort(),
      statesForCountry: Array.from(statesSet).sort(),
      citiesForState: Array.from(citiesSet).sort(),
      currencies: Array.from(currSet).sort()
    };
  }, [props.tutors, props.selectedCountry, props.selectedState]);

  const toggleSubject = (sub: string) => {
    if (props.selectedSubjects.includes(sub)) {
      props.setSelectedSubjects(props.selectedSubjects.filter(s => s !== sub));
    } else {
      props.setSelectedSubjects([...props.selectedSubjects, sub]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Filters</h2>
        <button 
          onClick={props.onReset}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-wider"
        >
          Reset
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Name Search */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Name</label>
          <input 
            type="text" 
            placeholder="e.g. John Doe"
            value={props.searchQuery}
            onChange={(e) => props.setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          />
        </div>

        {/* Verified Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={props.verifiedOnly}
              onChange={(e) => props.setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
            />
            <span className="text-sm font-semibold text-slate-700">Verified Tutors Only</span>
          </label>
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subjects</label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {OFFICIAL_SUBJECTS.map(sub => (
              <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={props.selectedSubjects.includes(sub)}
                  onChange={() => toggleSubject(sub)}
                  className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{sub}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location (Cascading) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
          <select 
            value={props.selectedCountry} 
            onChange={(e) => {
              props.setSelectedCountry(e.target.value);
              props.setSelectedState('');
              props.setSelectedCity('');
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          >
            <option value="">Any Country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {props.selectedCountry && statesForCountry.length > 0 && (
            <select 
              value={props.selectedState} 
              onChange={(e) => {
                props.setSelectedState(e.target.value);
                props.setSelectedCity('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="">Any State/Region</option>
              {statesForCountry.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {props.selectedState && citiesForState.length > 0 && (
            <select 
              value={props.selectedCity} 
              onChange={(e) => props.setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="">Any City</option>
              {citiesForState.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>


        {/* Examination Filter (Dynamic) */}
        {props.selectedSubjects.includes('High School Final Exam') && props.selectedCountry && props.setSelectedExamination && (
          <div className="pt-6 pb-2 border-t border-slate-100">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Examination System</h3>
             {examsLoading ? (
               <div className="text-xs text-slate-500 animate-pulse">Loading examinations...</div>
             ) : availableExaminations.length > 0 ? (
               <div className="relative">
                 <select
                   value={props.selectedExamination || ''}
                   onChange={(e) => props.setSelectedExamination!(e.target.value)}
                   className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-sky-500 transition-colors appearance-none"
                 >
                   <option value="">Any Examination</option>
                   {availableExaminations.map(exam => (
                     <option key={exam} value={exam}>{exam}</option>
                   ))}
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                   <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
             ) : (
                <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  No examination data available for this country yet.
                </div>
             )}
          </div>
        )}

        {/* Price & Currency */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pricing (Starting At)</label>
          
          <select 
            value={props.selectedCurrency} 
            onChange={(e) => {
              props.setSelectedCurrency(e.target.value);
              // Reset price values when currency changes so they don't apply cross-currency confusingly
              props.setPriceMin('');
              props.setPriceMax('');
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          >
            <option value="">Select Currency to Filter</option>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {props.selectedCurrency && (
            <>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={props.priceMin}
                  onChange={(e) => props.setPriceMin(e.target.value)}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={props.priceMax}
                  onChange={(e) => props.setPriceMax(e.target.value)}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
              
              <select 
                value={props.priceSort} 
                onChange={(e) => props.setPriceSort(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              >
                <option value="none">Sort by Price...</option>
                <option value="asc">Lowest to Highest</option>
                <option value="desc">Highest to Lowest</option>
              </select>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
