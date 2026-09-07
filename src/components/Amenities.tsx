import {
  Bath,
  BedDouble,
  Bike,
  CarFront,
  ChefHat,
  Flame,
  Leaf,
  MoonStar,
  PawPrint,
  UsersRound,
  Waves,
  Wifi,
} from "lucide-react";
import { amenities } from "@/data/site";

const icons = {
  users: UsersRound,
  bed: BedDouble,
  moon: MoonStar,
  bath: Bath,
  cooking: ChefHat,
  grill: Flame,
  wifi: Wifi,
  waves: Waves,
  car: CarFront,
  bike: Bike,
  leaf: Leaf,
  paw: PawPrint,
} as const;

export function Amenities() {
  return (
    <section className="amenities-section" aria-labelledby="amenities-title">
      <div className="container amenities-wrap">
        <div className="amenities-intro reveal">
          <p className="eyebrow">Lo esencial</p>
          <h2 id="amenities-title">Para una estadía simple y cómoda</h2>
        </div>
        <ul className="amenities-list reveal">
          {amenities.map((amenity) => {
            const Icon = icons[amenity.icon];
            return (
              <li key={amenity.label}>
                <Icon aria-hidden="true" strokeWidth={1.5} />
                <span>{amenity.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
