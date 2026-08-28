import {
  ArrowRight as LuArrowRight,
  BedDouble as LuBedDouble,
  Bike as LuBike,
  CalendarDays as LuCalendarDays,
  Car as LuCar,
  ChevronDown as LuChevronDown,
  Compass as LuCompass,
  DoorClosed as LuDoorClosed,
  Gauge as LuGauge,
  MapPin as LuMapPin,
  Menu as LuMenu,
  Mountain as LuMountain,
  Route as LuRoute,
  BadgeCheck as LuBadgeCheck,
  CalendarCheck as LuCalendarCheck,
  RefreshCw as LuRefreshCw,
  ShieldCheck as LuShieldCheck,
  Star as LuStar,
  ThermometerSun as LuThermometerSun,
  User as LuUser,
  Users as LuUsers,
  Wallet as LuWallet,
  X as LuX,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaYoutube } from "react-icons/fa6";

/** Single place the app gets its icons from. */
type IconProps = { className?: string };

export const ChevronDown = ({ className = "" }: IconProps) => (
  <LuChevronDown size={14} strokeWidth={2} aria-hidden className={`shrink-0 ${className}`} />
);

export const ArrowRight = ({ className = "" }: IconProps) => (
  <LuArrowRight size={16} strokeWidth={1.75} aria-hidden className={`shrink-0 ${className}`} />
);

export const Menu = ({ className = "" }: IconProps) => (
  <LuMenu size={20} strokeWidth={1.75} aria-hidden className={`shrink-0 ${className}`} />
);

export const Close = ({ className = "" }: IconProps) => (
  <LuX size={20} strokeWidth={1.75} aria-hidden className={`shrink-0 ${className}`} />
);

export const UserRound = ({ className = "" }: IconProps) => (
  <LuUser size={16} strokeWidth={1.75} aria-hidden className={`shrink-0 ${className}`} />
);

export const Compass = ({ className = "" }: IconProps) => (
  <LuCompass size={16} strokeWidth={1.75} aria-hidden className={`shrink-0 ${className}`} />
);

export const Star = ({ className = "" }: IconProps) => (
  <LuStar size={13} strokeWidth={0} aria-hidden className={`shrink-0 fill-current ${className}`} />
);

/** Booking-confidence marks. Sized larger since they sit alone in a tile. */
const confidence = (Icon: typeof LuBadgeCheck) =>
  function ConfidenceIcon({ className = "" }: IconProps) {
    return <Icon size={22} strokeWidth={1.5} aria-hidden className={`shrink-0 ${className}`} />;
  };

export const RefreshDeposit = confidence(LuRefreshCw);
export const CalendarCheck = confidence(LuCalendarCheck);
export const Wallet = confidence(LuWallet);
export const BadgeCheck = confidence(LuBadgeCheck);

/** Price-card marks. Keyed by name so the tour config can name one in data. */
const priceMark = (Icon: typeof LuBike) =>
  function PriceIcon({ className = "" }: IconProps) {
    return <Icon size={17} strokeWidth={1.6} aria-hidden className={`shrink-0 ${className}`} />;
  };

export const priceIcons = {
  rider: priceMark(LuUser),
  pillion: priceMark(LuUsers),
  bike: priceMark(LuBike),
  car: priceMark(LuCar),
  shield: priceMark(LuShieldCheck),
  singleRoom: priceMark(LuDoorClosed),
  doubleRoom: priceMark(LuBedDouble),
};

export type PriceIconName = keyof typeof priceIcons;

/** Expedition-fact marks, keyed by the fact they belong to. */
const factMark = (Icon: typeof LuBike) =>
  function FactIcon({ className = "" }: IconProps) {
    return <Icon size={22} strokeWidth={1.5} aria-hidden className={`shrink-0 ${className}`} />;
  };

export const factIcons = {
  location: factMark(LuMapPin),
  weather: factMark(LuThermometerSun),
  vehicle: factMark(LuBike),
  terrain: factMark(LuMountain),
  distance: factMark(LuRoute),
  duration: factMark(LuCalendarDays),
  difficulty: factMark(LuGauge),
  groupSize: factMark(LuUsers),
};

export const WhatsApp = ({ className = "" }: IconProps) => (
  <FaWhatsapp size={18} aria-hidden className={`shrink-0 ${className}`} />
);

export const Facebook = ({ className = "" }: IconProps) => (
  <FaFacebookF size={16} aria-hidden className={`shrink-0 ${className}`} />
);

export const Instagram = ({ className = "" }: IconProps) => (
  <FaInstagram size={17} aria-hidden className={`shrink-0 ${className}`} />
);

export const LinkedIn = ({ className = "" }: IconProps) => (
  <FaLinkedinIn size={17} aria-hidden className={`shrink-0 ${className}`} />
);

export const YouTube = ({ className = "" }: IconProps) => (
  <FaYoutube size={17} aria-hidden className={`shrink-0 ${className}`} />
);
