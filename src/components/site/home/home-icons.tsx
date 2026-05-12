import {
  Apple,
  BadgeCheck,
  BadgeDollarSign,
  Boxes,
  Car,
  Circle,
  CircleDollarSign,
  CreditCard,
  Crosshair,
  Crown,
  Flame,
  Gamepad2,
  Gem,
  Landmark,
  MessageCircle,
  Monitor,
  Shield,
  Smartphone,
  Sparkles,
  Skull,
  Sword,
  Trophy,
  Wallet,
  Waves,
  type LucideIcon,
} from "lucide-react";

const iconMap = {
  Apple,
  BadgeCheck,
  BadgeDollarSign,
  Boxes,
  Car,
  Circle,
  CircleDollarSign,
  CreditCard,
  Crosshair,
  Crown,
  Flame,
  Gamepad2,
  Gem,
  Landmark,
  MessageCircle,
  Monitor,
  Shield,
  Smartphone,
  Sparkles,
  Skull,
  Sword,
  Trophy,
  Wallet,
  Waves,
};

export type HomeIconName = keyof typeof iconMap;

export function HomeIcon({
  className,
  name,
}: {
  className?: string;
  name: string;
}) {
  const Icon = (iconMap[name as HomeIconName] ?? Gamepad2) as LucideIcon;
  return <Icon className={className} />;
}
