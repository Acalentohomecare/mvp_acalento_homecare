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
      className="block rounded-[14px] border border-linha bg-surface-raised p-3.5 transition-colors duration-200 ease-out hover:border-accent focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-start gap-3">
        <Avatar name={caregiver.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] font-semibold">{caregiver.name}</span>
            {favorite && (
              <Heart size={13} className="fill-accent text-accent" aria-label="Favorito" />
            )}
            {isVerified(caregiver) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cat-informal">
                <BadgeCheck size={13} /> Verificado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink/50">
            {caregiver.experienceYears} {caregiver.experienceYears === 1 ? "ano" : "anos"} de
            experiência · {caregiver.neighborhoods.join(", ")}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Cracha
              label={CATEGORY_LABEL[caregiver.category]}
              className={CATEGORY_CLASS[caregiver.category]}
            />
            {rating.average === null ? (
              <span className="text-[11px] text-ink/40">Sem média pública</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink/70">
                <Star size={12} className="fill-accent text-accent" />
                {formatRating(rating.average)}
                <span className="font-normal text-ink/40">({rating.count})</span>
              </span>
            )}
            <span className="ml-auto font-mono text-[12px] text-ink/70">
              {formatCurrency(caregiver.shiftRate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
