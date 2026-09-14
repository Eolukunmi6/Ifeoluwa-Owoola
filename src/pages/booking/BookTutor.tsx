import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Child, LessonPackage, TutorAvailability, TutorProfile } from '../../types';
import { ChevronRight, ArrowLeft, Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react';

export function BookTutor() {
  const { id } = useParams<{ id: string }>(); // tutor id
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState(false);
  
  // Data
  const [tutor, setTutor] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]); // To check for double booking
  
  // Selections
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    if (!profile || profile.role !== 'parent') {
      navigate('/login');
      return;
    }

    const fetchBookingData = async () => {
      try {
        setLoading(true);
        // 1. Fetch children
        const { data: cData } = await supabase.from('children').select('*').eq('parent_id', profile.id);
        if (cData) setChildren(cData);
        
        // 2. Fetch tutor & profile
        const { data: tData, error: tErr } = await supabase
          .from('tutors')
          .select('id, currency, profiles!inner(full_name, profile_photo)')
          .eq('id', id)
          .single();
        if (tErr) throw tErr;
        setTutor(tData);

        // 3. Fetch active packages
        const { data: pData } = await supabase
          .from('lesson_packages')
          .select('*')
          .eq('tutor_id', id)
          .eq('active', true)
          .order('price');
        if (pData) setPackages(pData);

        // 4. Fetch tutor availability
        const { data: aData } = await supabase
          .from('tutor_availability')
          .select('*')
          .eq('tutor_id', id);
        if (aData) setAvailabilities(aData);
        
        // 5. Fetch existing future bookings for this tutor to prevent double booking
        const today = new Date().toISOString();
        const { data: bData, error: bErr } = await supabase
          .from('bookings')
          .select('scheduled_at')
          .eq('tutor_id', id)
          .in('status', ['confirmed', 'pending_payment'])
          .gte('scheduled_at', today);
        if (bErr) throw bErr;
        if (bData) setExistingBookings(bData);

      } catch (err: any) {
        console.error(err);
        if (err?.code === 'PGRST205' || err?.message?.includes('bookings')) {
          setSchemaError(true);
        } else {
          setError('Failed to load booking information.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [id, profile]);

  const generateAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Find tutor availabilities for this day
    const dayAvailabilities = availabilities.filter(a => a.day_of_week === dayOfWeek);
    
    if (dayAvailabilities.length === 0) return [];
    
    const slots: string[] = [];
    
    // For simplicity, generate hourly slots within available bounds
    dayAvailabilities.forEach(avail => {
      let current = new Date(`${selectedDate}T${avail.start_time}`);
      const end = new Date(`${selectedDate}T${avail.end_time}`);
      
      while (current < end) {
        const timeString = current.toTimeString().substring(0, 5); // HH:mm
        const fullIsoString = new Date(`${selectedDate}T${timeString}:00`).toISOString();
        
        // Check if this specific slot is already booked
        const isBooked = existingBookings.some(b => {
          const bookedTime = new Date(b.scheduled_at).getTime();
          const slotTime = new Date(fullIsoString).getTime();
          // Consider it booked if within the same hour (basic collision detection)
          return Math.abs(bookedTime - slotTime) < 60 * 60 * 1000;
        });

        if (!isBooked) {
          slots.push(timeString);
        }
        
        current.setHours(current.getHours() + 1);
      }
    });
    
    return slots;
  };

  const timeSlots = generateAvailableTimeSlots();

  const handleConfirm = async () => {
    if (!selectedChildId || !selectedPackageId || !selectedDate || !selectedTime) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const selPackage = packages.find(p => p.id === selectedPackageId);
      if (!selPackage) throw new Error("Package not found");

      // Construct scheduled_at timestamp
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert({
          parent_id: profile?.id,
          child_id: selectedChildId,
          tutor_id: id,
          lesson_package_id: selectedPackageId,
          scheduled_at: scheduledAt,
          amount: selPackage.price,
          currency: tutor.currency || 'USD',
          status: 'pending_payment'
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      
      navigate(`/payment-stub/${data.id}`);
    } catch (err: any) {
      console.error(err);
      setError('Failed to create booking.');
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center">Loading...</div>;
  }

  const selectedChild = children.find(c => c.id === selectedChildId);
  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Book a Lesson</h1>
          <p className="text-slate-500 mt-2">with {tutor?.profiles?.full_name}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sky-500 -z-10 rounded-full transition-all" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= num ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {num}
            </div>
          ))}
        </div>

        
        {schemaError && (
          <div className="mb-6 p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
            <h3 className="font-bold text-lg mb-2">Database Setup Required</h3>
            <p>The <strong>bookings</strong> table is missing from your database. Please execute the contents of <code>supabase-phase9.sql</code> in your Supabase SQL Editor to continue.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
          
          {/* Step 1: Select Child */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Who is this lesson for?</h2>
              
              {children.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-slate-600 mb-4">You need to add a child to your profile before booking a lesson.</p>
                  <Link to="/dashboard/parent" className="inline-block px-6 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors">
                    Go to Dashboard to Add Child
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {children.map(child => (
                    <label key={child.id} className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${
                      selectedChildId === child.id ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="child" 
                        value={child.id} 
                        checked={selectedChildId === child.id}
                        onChange={() => setSelectedChildId(child.id)}
                        className="w-5 h-5 text-sky-500 focus:ring-sky-500 border-slate-300"
                      />
                      <div className="ml-4">
                        <span className="block font-bold text-slate-900">{child.name}</span>
                        <span className="block text-sm text-slate-500">{child.age} years old</span>
                      </div>
                    </label>
                  ))}
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!selectedChildId}
                      className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Package */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select a Lesson Package</h2>
              
              <div className="space-y-4">
                {packages.map(pkg => (
                  <label key={pkg.id} className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all ${
                    selectedPackageId === pkg.id ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="package" 
                        value={pkg.id} 
                        checked={selectedPackageId === pkg.id}
                        onChange={() => setSelectedPackageId(pkg.id)}
                        className="w-5 h-5 text-sky-500 focus:ring-sky-500 border-slate-300"
                      />
                      <div className="ml-4">
                        <span className="block font-bold text-slate-900">{pkg.package_type}</span>
                        <span className="block text-sm text-slate-500">
                          {pkg.session_hours > 0 && `${pkg.session_hours} hr `}
                          {pkg.session_minutes > 0 && `${pkg.session_minutes} min `}
                          session {pkg.days_per_week && `• ${pkg.days_per_week} days/week`}
                        </span>
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-900 text-lg">
                      {tutor?.currency === 'NGN' ? '₦' : '$'}{pkg.price}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-colors">Back</button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedPackageId}
                  className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select Date and Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium text-slate-700"
                  />
                  {selectedDate && timeSlots.length === 0 && (
                    <p className="text-sm text-red-500 mt-2 font-medium">Tutor is not available on this day.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Time</label>
                  {!selectedDate ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm text-center">
                      Please select a date first
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                            selectedTime === time 
                              ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20' 
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm text-center">
                      No available slots
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-colors">Back</button>
                <button 
                  onClick={() => setStep(4)}
                  disabled={!selectedDate || !selectedTime}
                  className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Review Booking Details</h2>
              
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-8 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Tutor</p>
                    <p className="text-lg font-bold text-slate-900">{tutor?.profiles?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Child</p>
                    <p className="text-lg font-bold text-slate-900">{selectedChild?.name}</p>
                  </div>
                </div>

                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Package</p>
                    <p className="text-lg font-bold text-slate-900">{selectedPackage?.package_type}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedPackage?.session_hours ? `${selectedPackage.session_hours} hr ` : ''}
                      {selectedPackage?.session_minutes ? `${selectedPackage.session_minutes} min ` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {tutor?.currency === 'NGN' ? '₦' : '$'}{selectedPackage?.price}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center text-slate-700 font-medium">
                    <CalendarIcon className="w-5 h-5 mr-2 text-sky-500" />
                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center text-slate-700 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <Clock className="w-5 h-5 mr-2 text-sky-500" />
                    {selectedTime}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(3)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-colors">Back</button>
                <button 
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-8 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 disabled:opacity-70 transition-colors flex items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Confirm & Proceed to Payment'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
