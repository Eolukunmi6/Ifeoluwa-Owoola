import React from 'react';
import { Link } from 'react-router-dom';
import { SaveTutorButton } from './SaveTutorButton';

interface TutorCardProps {
  tutor: any;
  key?: string | number;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const currencySymbols: Record<string, string> = {
    USD: '$', NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', GBP: '£', EUR: '€'
  };
  const symbol = currencySymbols[tutor.currency] || '$';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img 
            src={tutor.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.full_name)}&background=0D8ABC&color=fff`} 
            alt={tutor.full_name} 
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
          />
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              {tutor.full_name}
              {tutor.verified && (
                <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h3>
            <p className="text-xs font-medium text-slate-500 line-clamp-1">
              {[tutor.city, tutor.state, tutor.country].filter(Boolean).join(', ') || 'Location unlisted'}
            </p>
          </div>
        </div>
        <SaveTutorButton tutorId={tutor.id} iconOnly={true} className="p-2 -mr-2 -mt-2 rounded-full hover:bg-slate-50" />
      </div>
      
      <div className="mb-4 flex-grow">
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {tutor.bio || 'No bio provided.'}
        </p>
      </div>
      
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tutor.subjects.slice(0, 3).map((sub: string) => (
          <span key={sub} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
            {sub}
          </span>
        ))}
        {tutor.subjects.length > 3 && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
            +{tutor.subjects.length - 3} more
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Starting at</p>
          <p className="text-lg font-bold text-slate-900">{symbol}{tutor.startingPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
        </div>
        <Link 
          to={`/tutors/${tutor.id}`}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
