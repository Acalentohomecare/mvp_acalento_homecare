import { Link } from "react-router-dom";
import { BadgeCheck, Heart, Star } from "lucide-react";
import { Avatar, Cracha } from "../ui";
import { CATEGORY_CLASS, CATEGORY_LABEL } from "../../constants/caregiver";
import { isVerified, type CaregiverRating } from "../../services/caregivers";
import { formatCurrency, formatRating } from "../../utils/format";
import type { Caregiver } from "../../types";

interface CaregiverCardProps {
  caregiver: Caregiver;
  rating: CaregiverRating;
  to: string;
  favorite?: boolean;
}

export function CaregiverCard({ caregiver, rating, to, favorite }: CaregiverCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-card border border-linha bg-surface-raised p-3.5 shadow-card transition-[border-color,box-shadow] duration-150 ease-out hover:border-accent/45 hover:shadow-raised"
    >
      <div className="flex items-start gap-3">
        <Avatar name={caregiver.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-title font-semibold">{caregiver.name}</span>
            {favorite && (
              <Heart size={13} className="fill-accent text-accent" aria-label="Favorito" />
            )}
            {isVerified(caregiver) && (
              <span className="inline-flex items-center gap-1 text-meta font-semibold text-cat-informal">
                <BadgeCheck size={13} /> Verificado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-note text-ink/50">
            {caregiver.experienceYears} {caregiver.experienceYears === 1 ? "ano" : "anos"} de
            experiência · {caregiver.neighborhoods.join(", ")}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Cracha
              label={CATEGORY_LABEL[caregiver.category]}
              className={CATEGORY_CLASS[caregiver.category]}
            />
            {rating.average === null ? (
              <span className="text-meta text-ink/40">Sem média pública</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-note font-semibold text-ink/70">
                <Star size={12} className="fill-rating text-rating" />
                {formatRating(rating.average)}
                <span className="font-normal text-ink/40">({rating.count})</span>
              </span>
            )}
            <span className="ml-auto font-mono text-note text-ink/70">
              {formatCurrency(caregiver.shiftRate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
