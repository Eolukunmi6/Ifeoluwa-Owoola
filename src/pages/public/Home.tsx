import React, { useEffect, useState } from 'react';
import { Search, MapPin, DollarSign, BookOpen, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';

const SUBJECTS = [
  'Numeracy',
  'Literacy',
  'Basic Science',
  'Music',
  'Phonics',
  'Art & Craft',
  'Computer & Coding',
  'High School Final Exam',
  'High School Mathematics',
  'High School English',
  'Biology',
  'Chemistry',
  'Physics',
  'Commerce',
  'Accounting',
  'Economics',
  'Geography'
];

const SUBJECT_COLORS = [
  'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 hover:border-pink-300',
  'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 hover:border-purple-300',
  'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300',
  'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-300',
  'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 hover:border-orange-300',
  'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 hover:border-rose-300',
  'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 hover:border-indigo-300',
  'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 hover:border-teal-300'
];

export function Home() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const { data, error } = await supabase.from('profiles')
          .select(`
            *,
            tutors (
              *,
              tutor_subjects (
                subjects (
                  name
                )
              )
            )
          `)
          .eq('role', 'tutor')
          .eq('status', 'active')
          .limit(4);
        
        if (error) throw error;
        setTutors(data || []);
      } catch (err) {
        console.error('Error fetching tutors:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTutors();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center text-center px-4 md:px-12 flex-grow bg-slate-900 bg-[url('/images.jfif')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

        <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-[12px] uppercase tracking-[2px] mb-6 shadow-sm"
          >
            Premium Tutoring
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold text-white leading-[1.1] mb-4 max-w-[700px] drop-shadow-md"
          >
            Find the Right Tutor for Your Child
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[18px] text-white/90 mb-10 max-w-[500px] drop-shadow-sm"
          >
            Qualified tutors. Flexible lessons. Learning made easier and more engaging for every student.
          </motion.p>

          {/* Registered Tutors Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {loading ? (
              <div className="col-span-full py-10 flex justify-center text-slate-400">Loading tutors...</div>
            ) : tutors.length === 0 ? (
              <div className="col-span-full py-10 flex justify-center text-slate-400">No registered tutors found.</div>
            ) : (
              tutors.map((tutorProfile, index) => {
                const tutorDetails = Array.isArray(tutorProfile.tutors) ? tutorProfile.tutors[0] : tutorProfile.tutors;
                const subjects = tutorDetails?.tutor_subjects?.map((ts: any) => ts.subjects?.name).filter(Boolean) || [];
                
                const cardColors = [
                  'from-pink-500 to-rose-400',
                  'from-violet-500 to-fuchsia-400',
                  'from-sky-400 to-indigo-500',
                  'from-emerald-400 to-teal-500'
                ];
                const color = cardColors[index % cardColors.length];

                return (
                  <motion.div 
                    key={tutorProfile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                    className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-5 flex flex-col gap-3 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all text-left group overflow-hidden border border-white/40"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${color}`} />
                    
                    <div className="flex justify-between items-center w-full mb-1">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Top Rated
                      </div>
                      <div className="text-[12px] font-extrabold text-slate-700 flex items-center gap-1">
                        5.0
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {tutorProfile.profile_photo ? (
                        <img 
                          src={tutorProfile.profile_photo} 
                          alt={tutorProfile.full_name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md ring-2 ring-slate-100`}>
                          {tutorProfile.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-[17px] capitalize leading-tight group-hover:text-fuchsia-600 transition-colors">{tutorProfile.full_name}</h3>
                        <div className="flex items-center text-slate-500 text-[13px] gap-1 mt-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="capitalize">{tutorProfile.city}, {tutorProfile.country}</span>
                        </div>
                      </div>
                    </div>
                    
                    {subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {subjects.slice(0, 3).map((sub: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                            {sub}
                          </span>
                        ))}
                        {subjects.length > 3 && (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold rounded-lg border border-slate-200 shadow-sm">
                            +{subjects.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {tutorDetails?.bio && (
                      <p className="text-[13px] text-slate-600 line-clamp-2 mt-1 leading-relaxed font-medium">
                        {tutorDetails.bio}
                      </p>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Preview */}
      <section className="px-4 md:px-12 py-16 md:py-20 bg-white relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-[28px] md:text-[32px] font-extrabold text-slate-900 mb-2">
            Explore Popular Subjects
          </div>
          <p className="text-slate-500 mb-8 md:mb-10 max-w-2xl mx-auto">
            Discover a wide range of topics taught by experienced professionals ready to help your child excel.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {SUBJECTS.map((subject, index) => (
              <motion.div 
                key={subject}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`px-6 py-4 rounded-2xl border flex items-center justify-center gap-3 text-[16px] font-bold transition-all cursor-pointer shadow-sm hover:shadow-md ${SUBJECT_COLORS[index % SUBJECT_COLORS.length]}`}
              >
                {subject}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="max-w-4xl mx-auto px-6 md:px-4 relative text-center z-10">
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-extrabold text-white mb-4 drop-shadow-sm leading-tight">Ready to accelerate learning?</h2>
          <p className="text-white/90 text-[18px] mb-10 max-w-2xl mx-auto">
            Join thousands of parents who have found the perfect tutor for their children on EduMatics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 font-extrabold hover:opacity-90 transition-all text-[16px] shadow-lg">
              Create Parent Account
            </Link>
            <Link to="/tutor/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 text-white font-extrabold hover:bg-white/20 backdrop-blur-md border border-white/30 transition-all text-[16px] shadow-lg">
              Register as Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
