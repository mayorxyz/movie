import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { PosterCard } from '../../components/ui/PosterCard';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { features } from '../../config/features';

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);
  const [bioExpanded, setBioExpanded] = useState(false);

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => tmdbService.getPersonDetails(personId),
    enabled: features.personPages,
  });

  const { data: credits } = useQuery({
    queryKey: ['personCredits', personId],
    queryFn: () => tmdbService.getPersonCredits(personId),
    enabled: features.personPages && !!personId,
  });

  if (!features.personPages) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Person pages are currently disabled.</p>
      </div>
    );
  }

  if (isLoading) return <PageSkeleton />;
  if (!person) return <div className="p-8 text-center text-[var(--color-text-muted)]">Person not found</div>;

  const filmography = credits?.cast || [];
  const isLongBio = person.biography && person.biography.length > 300;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Photo */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <img
              src={person.profile_path || undefined}
              alt={person.name}
              className="w-full rounded-lg shadow-2xl border border-[var(--color-border)]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
              {person.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--color-text-muted)]">
              {person.birthday && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Born {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {person.deathday && ` — Died ${new Date(person.deathday).toLocaleDateString()}`}
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {person.place_of_birth}
                </span>
              )}
            </div>

            {person.biography && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Biography</h2>
                <p className={`text-sm text-[var(--color-text)] leading-relaxed ${!bioExpanded && isLongBio ? 'line-clamp-4' : ''}`}>
                  {person.biography}
                </p>
                {isLongBio && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="flex items-center gap-1 mt-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                  >
                    {bioExpanded ? <>Show less <ChevronUp className="w-4 h-4" /></> : <>Read more <ChevronDown className="w-4 h-4" /></>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filmography */}
        {filmography.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl md:text-2xl font-[var(--font-display)] font-semibold mb-6">Known For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filmography.map((item: any) => (
                <PosterCard
                  key={item.id}
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                  mediaType={item.media_type || (item.title ? 'movie' : 'tv')}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
