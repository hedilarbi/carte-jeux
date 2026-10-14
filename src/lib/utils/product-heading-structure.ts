export interface ProductHeadingStructure {
  activation: string;
  compatibility: string;
  faq: string;
  presentation: string;
  region: string;
}

const ACTIVATION_LABELS = [
  ["STEAM", "Steam"],
  ["XBOX LIVE", "Xbox Live"],
  ["NINTENDO", "Nintendo"],
  ["UBISOFT", "Ubisoft"],
  ["GOG", "GOG"],
  ["PLAYSTATION", "PlayStation"],
  ["PSN", "PlayStation Network"],
  ["EPIC GAMES", "Epic Games"],
  ["BATTLE.NET", "Battle.net"],
] as const;

function resolveActivationLabel(title: string) {
  const normalizedTitle = title.toUpperCase();

  return (
    ACTIVATION_LABELS.find(([needle]) =>
      normalizedTitle.includes(needle),
    )?.[1] ?? "plateforme indiquée sur la fiche"
  );
}

function resolveRegionLabel(title: string) {
  const normalizedTitle = title.toUpperCase();

  if (normalizedTitle.includes("EUROPE")) {
    return "Europe";
  }

  if (normalizedTitle.includes("GLOBAL")) {
    return "Global";
  }

  if (normalizedTitle.includes("UNITED STATES")) {
    return "États-Unis";
  }

  return "zone indiquée sur la fiche";
}

export function getProductHeadingStructure(
  title: string,
): ProductHeadingStructure {
  return {
    presentation: `${title} : présentation et contenu de l’offre`,
    compatibility: `Compatibilité, région et activation de ${title}`,
    faq: `Questions fréquentes sur ${title}`,
    activation: `Réception et fonctionnement sur ${resolveActivationLabel(title)}`,
    region: `Région ${resolveRegionLabel(title)} et conditions à contrôler`,
  };
}
