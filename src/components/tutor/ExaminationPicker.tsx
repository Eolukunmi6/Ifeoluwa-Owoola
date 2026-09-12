import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Examination } from '../../types';

interface ExaminationPickerProps {
  countryName: string;
  selectedExamIds: string[];
  onChange: (examIds: string[]) => void;
}

export function ExaminationPicker({ countryName, selectedExamIds, onChange }: ExaminationPickerProps) {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExaminations = async () => {
      if (!countryName) {
        setExaminations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Find country ID by name
        const { data: countryData, error: countryError } = await supabase
          .from('countries')
          .select('id')
          .ilike('name', countryName)
          .maybeSingle();

        if (countryError) throw countryError;
        
        if (!countryData) {
          setExaminations([]);
          setLoading(false);
          return;
        }

        // Fetch examinations for this country
        const { data: examData, error: examError } = await supabase
          .from('examinations')
          .select('*')
          .eq('country_id', countryData.id)
          .eq('active', true)
          .order('name');

        if (examError) throw examError;
        setExaminations(examData || []);
      } catch (err: any) {
        console.error("Error fetching examinations:", err);
        setError("Could not load examinations.");
      } finally {
        setLoading(false);
      }
    };

    fetchExaminations();
  }, [countryName]);

  const toggleExam = (id: string) => {
    if (selectedExamIds.includes(id)) {
      onChange(selectedExamIds.filter(eId => eId !== id));
    } else {
      onChange([...selectedExamIds, id]);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-slate-100 rounded-xl w-full"></div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (examinations.length === 0) {
    return <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-200">No examination data available for this country yet.</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {examinations.map(exam => {
        const isSelected = selectedExamIds.includes(exam.id);
        return (
          <button
            key={exam.id}
            type="button"
            onClick={() => toggleExam(exam.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              isSelected 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-600' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isSelected && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {exam.name}
          </button>
        );
      })}
    </div>
  );
}
