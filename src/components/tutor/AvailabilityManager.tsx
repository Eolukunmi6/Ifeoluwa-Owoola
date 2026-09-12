import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TutorAvailability } from '../../types';

interface AvailabilityManagerProps {
  tutorId: string;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 0, name: 'Sunday' },
];

type TimeRange = { start: string; end: string };
type DaySchedule = { available: boolean; ranges: TimeRange[] };
type WeeklySchedule = Record<number, DaySchedule>;

// Utility to compare "HH:MM"
function parseTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function hasOverlap(ranges: TimeRange[]) {
  // Sort ranges by start time
  const sorted = [...ranges].sort((a, b) => parseTime(a.start) - parseTime(b.start));
  for (let i = 0; i < sorted.length - 1; i++) {
    if (parseTime(sorted[i].end) > parseTime(sorted[i + 1].start)) {
      return true;
    }
  }
  return false;
}

export function AvailabilityManager({ tutorId }: AvailabilityManagerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tutorId);

      if (fetchError) {
        if (fetchError.code === 'PGRST205') {
          console.warn("tutor_availability table not found yet");
        } else {
          throw fetchError;
        }
      }

      // Initialize default schedule
      const newSchedule: WeeklySchedule = {};
      DAYS_OF_WEEK.forEach(d => {
        newSchedule[d.id] = { available: false, ranges: [{ start: '09:00', end: '17:00' }] };
      });

      if (data) {
        const availList = data as TutorAvailability[];
        // Group by day
        const grouped = availList.reduce((acc, curr) => {
          if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
          // format times to HH:MM (remove seconds if present)
          const formatTime = (t: string) => t.substring(0, 5);
          acc[curr.day_of_week].push({ start: formatTime(curr.start_time), end: formatTime(curr.end_time) });
          return acc;
        }, {} as Record<number, TimeRange[]>);

        Object.keys(grouped).forEach(dayKey => {
          const day = parseInt(dayKey);
          newSchedule[day] = { available: true, ranges: grouped[day] };
        });
      }
      
      setSchedule(newSchedule);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [tutorId]);

  const handleDayToggle = (day: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], available: !prev[day].available }
    }));
  };

  const handleRangeChange = (day: number, index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => {
      const newRanges = [...prev[day].ranges];
      newRanges[index] = { ...newRanges[index], [field]: value };
      return { ...prev, [day]: { ...prev[day], ranges: newRanges } };
    });
  };

  const addRange = (day: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ranges: [...prev[day].ranges, { start: '09:00', end: '17:00' }] }
    }));
  };

  const removeRange = (day: number, index: number) => {
    setSchedule(prev => {
      const newRanges = prev[day].ranges.filter((_, i) => i !== index);
      // If no ranges left, mark as unavailable and set a default empty range to not break UI
      if (newRanges.length === 0) {
        return { ...prev, [day]: { available: false, ranges: [{ start: '09:00', end: '17:00' }] } };
      }
      return { ...prev, [day]: { ...prev[day], ranges: newRanges } };
    });
  };

  const validateSchedule = (): boolean => {
    setError(null);
    setSuccessMsg(null);
    for (const d of DAYS_OF_WEEK) {
      const dayData = schedule[d.id];
      if (dayData.available) {
        for (const range of dayData.ranges) {
          if (!range.start || !range.end) {
            setError(`Please provide valid times for ${d.name}.`);
            return false;
          }
          if (parseTime(range.end) <= parseTime(range.start)) {
            setError(`End time must be after start time for ${d.name}.`);
            return false;
          }
        }
        if (hasOverlap(dayData.ranges)) {
          setError(`Time ranges cannot overlap on ${d.name}.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateSchedule()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      // We need to replace all existing rows for this tutor. 
      // Safest way is delete all, then insert new.
      const { error: deleteError } = await supabase
        .from('tutor_availability')
        .delete()
        .eq('tutor_id', tutorId);
      
      if (deleteError) throw deleteError;

      const inserts: any[] = [];
      DAYS_OF_WEEK.forEach(d => {
        const dayData = schedule[d.id];
        if (dayData.available) {
          dayData.ranges.forEach(range => {
            inserts.push({
              tutor_id: tutorId,
              day_of_week: d.id,
              start_time: range.start,
              end_time: range.end
            });
          });
        }
      });

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('tutor_availability')
          .insert(inserts);
        
        if (insertError) throw insertError;
      }

      setSuccessMsg('Availability saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save availability.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full"></div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weekly Availability</h2>
          <p className="text-sm text-slate-500">Set the times you are available to teach.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-medium">
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => (
          <div key={day.id} className="flex flex-col md:flex-row md:items-start gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="w-48 flex items-center gap-3 shrink-0 pt-1">
              <input
                type="checkbox"
                id={`day-${day.id}`}
                checked={schedule[day.id]?.available || false}
                onChange={() => handleDayToggle(day.id)}
                className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor={`day-${day.id}`} className="font-bold text-slate-700 cursor-pointer">
                {day.name}
              </label>
            </div>
            
            <div className="flex-1 space-y-3">
              {schedule[day.id]?.available ? (
                schedule[day.id].ranges.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={range.start}
                      onChange={(e) => handleRangeChange(day.id, idx, 'start', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                    <span className="text-slate-400 font-medium">-</span>
                    <input
                      type="time"
                      value={range.end}
                      onChange={(e) => handleRangeChange(day.id, idx, 'end', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                    <button
                      onClick={() => removeRange(day.id, idx)}
                      className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove time block"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm font-medium text-slate-400 pt-1">Unavailable</div>
              )}
              
              {schedule[day.id]?.available && (
                <button
                  onClick={() => addRange(day.id)}
                  className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Hours
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
