import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ChevronDown, ChevronUp, User, UserX } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { PosterCard } from '../../components/ui/PosterCard';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { features } from '../../config/features';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center text-center py-14 md:py-24 px-4">
      <UserX className="w-10 h-10 md:w-12 md:h-12 text-[var(--color-text-faint)] mb-3" strokeWidth={1.5} />
      <h2 className="text-[15px] md:text-[16px] font-semibold text-[var(--color-text)]">{title}</h2>
      {text && <p className="text-[13px] md:text-[14px] text-[var(--color-text-muted)] mt-1">{text}</p>}
      <Link
        to="/"
        className="mt-5 inline-flex items-center justify-center h-9 md:h-10 px-5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[13px] md:text-[14px] font-semibold active:scale-[0.98] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      >
        Go home
      </Link>
    </div>
  );
}

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
    return <EmptyState title="Person pages are disabled" text="This section is currently turned off." />;
  }

  if (isLoading) return <PageSkeleton />;
  if (!person) return <EmptyState title="Person not found" />;

  const filmography = credits?.cast || [];
  const isLongBio = !!person.biography && person.biography.length > 260;

  const words = person.name.trim().split(/\s+/);
  const last = words.pop() ?? '';
  const lead = words.join(' ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="pb-8 md:pb-14"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-5 sm:gap-7 md:gap-10">
          {/* Photo */}
          <div className="flex-shrink-0 w-36 sm:w-44 md:w-64 lg:w-72 mx-auto md:mx-0 md:sticky md:top-24 md:self-start">
            {person.profile_path ? (
              <img
                src={person.profile_path}
                alt={person.name}
                className="w-full aspect-[3/4] object-cover rounded-xl md:rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.45)] bg-[var(--color-surface)]"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-xl md:rounded-2xl bg-[var(--color-surface)] flex items-center justify-center">
                <User className="w-10 h-10 md:w-12 md:h-12 text-[var(--color-text-faint)]" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-center md:text-left">
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1">
                Person
              </p>
              <h1 className="text-[26px] sm:text-[34px] md:text-[44px] lg:text-[52px] leading-[1.08] tracking-tight text-[var(--color-text)]">
                {lead && <span className="font-light">{lead} </span>}
                <span className="font-bold uppercase">{last}</span>
              </h1>

              {(person.birthday || person.place_of_birth) && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 mt-3 md:mt-4 text-[12px] md:text-[13px] text-[var(--color-text-muted)]">
                  {person.birthday && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      <span>
                        Born {fmt(person.birthday)}
                        {person.deathday && ` · Died ${fmt(person.deathday)}`}
                      </span>
                    </span>
                  )}
                  {person.place_of_birth && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      <span>{person.place_of_birth}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {person.biography && (
              <div className="mt-6 md:mt-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-2.5 md:mb-3.5">
                  <h2 className="text-[16px] md:text-[19px] font-semibold text-[var(--color-text)]">Biography</h2>
                  <span className="w-5 h-2 md:w-6 md:h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
                  <span className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                </div>
                <p
                  className={`text-[13px] sm:text-[14px] md:text-[15px] text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line ${
                    !bioExpanded && isLongBio ? 'line-clamp-3 md:line-clamp-4' : ''
                  }`}
                >
                  {person.biography}
                </p>
                {isLongBio && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(!bioExpanded)}
                    aria-expanded={bioExpanded}
                    className="inline-flex items-center gap-1 mt-2.5 h-8 px-3.5 rounded-full bg-[var(--color-surface)] text-[12px] md:text-[13px] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    {bioExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filmography */}
        {filmography.length > 0 && (
          <section className="mt-10 md:mt-14">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-[16px] md:text-[19px] font-semibold text-[var(--color-text)]">Known For</h2>
              <span className="w-5 h-2 md:w-6 md:h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
              <span className="flex-1 h-px bg-[var(--color-border-subtle)]" />
              <span className="text-[11px] md:text-[12px] text-[var(--color-text-muted)] tabular-nums shrink-0">
                {filmography.length} titles
              </span>
            </div>
            <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:gap-x-5 md:gap-y-7">
              {filmography.map((item: any) => (
                <PosterCard
                  key={`${item.media_type || 'x'}-${item.id}-${item.credit_id ?? ''}`}
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                  mediaType={item.media_type || (item.title ? 'movie' : 'tv')}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}