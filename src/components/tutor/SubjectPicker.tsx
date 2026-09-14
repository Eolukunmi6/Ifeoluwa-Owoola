import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Subject } from '../../types';

interface SubjectPickerProps {
  selectedSubjectIds: string[];
  onChange: (subjectIds: string[], allSubjects?: Subject[]) => void;
}

export function SubjectPicker({ selectedSubjectIds, onChange }: SubjectPickerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('active', true)
        .order('name');
        
      if (error) {
        if (error.code === 'PGRST205') {
          console.warn("Subjects table is missing. Waiting for database setup.");
        } else {
          console.error("Error fetching subjects:", error);
        }
      } else if (data) {
        setSubjects(data);
        // Call onChange with current selections just to pass the full subjects array up
        onChange(selectedSubjectIds, data);
      }
      setLoading(false);
    };
    
    fetchSubjects();
  }, []);

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      onChange(selectedSubjectIds.filter(sId => sId !== id), subjects);
    } else {
      onChange([...selectedSubjectIds, id], subjects);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-slate-100 rounded-xl w-full"></div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map(subject => {
        const isSelected = selectedSubjectIds.includes(subject.id);
        return (
          <button
            key={subject.id}
            type="button"
            onClick={() => toggleSubject(subject.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isSelected 
                ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-md shadow-sky-500/20 border border-sky-500' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}
