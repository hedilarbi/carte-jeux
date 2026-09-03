import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  async redirects() {
    return [
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "psn"
                  }
            ],
            destination: "/categories/plateformes/psn/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "xbox"
                  }
            ],
            destination: "/categories/plateformes/xbox/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "steam"
                  }
            ],
            destination: "/categories/plateformes/steam/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "nintendo"
                  }
            ],
            destination: "/categories/plateformes/nintendo/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "jeu-mobile"
                  }
            ],
            destination: "/categories/plateformes/jeu-mobile/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "epic-games"
                  }
            ],
            destination: "/categories/plateformes/epic-games/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "ea-sports"
                  }
            ],
            destination: "/categories/plateformes/ea-sports/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "jeux-pc"
                  }
            ],
            destination: "/categories/plateformes/jeux-pc/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "mobile-ios-android"
                  }
            ],
            destination: "/categories/plateformes/android-ios/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "airlinegift"
                  }
            ],
            destination: "/categories/plateformes/airlinegift/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "amazon"
                  }
            ],
            destination: "/categories/plateformes/amazon/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "apple"
                  }
            ],
            destination: "/categories/plateformes/apple/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "autodesk"
                  }
            ],
            destination: "/categories/plateformes/autodesk/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "by-rewarble"
                  }
            ],
            destination: "/categories/plateformes/by-rewarble/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "cryptovoucher"
                  }
            ],
            destination: "/categories/plateformes/cryptovoucher/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "google-play"
                  }
            ],
            destination: "/categories/plateformes/google-play/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "in-game"
                  }
            ],
            destination: "/categories/plateformes/in-game/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "netflix"
                  }
            ],
            destination: "/categories/plateformes/netflix/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "nintendo-eshop"
                  }
            ],
            destination: "/categories/plateformes/nintendo-eshop/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "razer"
                  }
            ],
            destination: "/categories/plateformes/razer/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "roblox"
                  }
            ],
            destination: "/categories/plateformes/roblox/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "starbucks"
                  }
            ],
            destination: "/categories/plateformes/starbucks/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "the-elder-scrolls-online"
                  }
            ],
            destination: "/categories/plateformes/the-elder-scrolls-online/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "ubisoft-connect"
                  }
            ],
            destination: "/categories/plateformes/ubisoft-connect/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "xbox-live"
                  }
            ],
            destination: "/categories/plateformes/xbox-live/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "albertsons"
                  }
            ],
            destination: "/categories/plateformes/albertsons/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "cashtocode"
                  }
            ],
            destination: "/categories/plateformes/cashtocode/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "decathlon"
                  }
            ],
            destination: "/categories/plateformes/decathlon/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "ea-app"
                  }
            ],
            destination: "/categories/plateformes/ea-app/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "giftmecrypto"
                  }
            ],
            destination: "/categories/plateformes/giftmecrypto/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "mastercard"
                  }
            ],
            destination: "/categories/plateformes/mastercard/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "microsoft"
                  }
            ],
            destination: "/categories/plateformes/microsoft/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "riot"
                  }
            ],
            destination: "/categories/plateformes/riot/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "adidas"
                  }
            ],
            destination: "/categories/plateformes/adidas/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "binance"
                  }
            ],
            destination: "/categories/plateformes/binance/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "grab"
                  }
            ],
            destination: "/categories/plateformes/grab/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "ikea"
                  }
            ],
            destination: "/categories/plateformes/ikea/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "sephora"
                  }
            ],
            destination: "/categories/plateformes/sephora/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "e-cartes-de-jeu"
                  }
            ],
            destination: "/categories/types/e-cartes-de-jeu/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "points-de-jeu"
                  }
            ],
            destination: "/categories/types/points-de-jeu/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "cartes-prepayees"
                  }
            ],
            destination: "/categories/types/cartes-prepayees/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "free-fire"
                  }
            ],
            destination: "/categories/types/free-fire/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "steam-pc-games"
                  }
            ],
            destination: "/categories/types/steam-pc-games/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "playstation"
                  }
            ],
            destination: "/categories/types/playstation/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "console"
                  }
            ],
            destination: "/categories/types/consoles-de-jeux/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "action"
                  }
            ],
            destination: "/categories/types/action/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "action-shooting"
                  }
            ],
            destination: "/categories/types/action-shooting/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "adventure"
                  }
            ],
            destination: "/categories/types/adventure/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "amazon-category"
                  }
            ],
            destination: "/categories/types/amazon/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "apple-category"
                  }
            ],
            destination: "/categories/types/apple/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "apps"
                  }
            ],
            destination: "/categories/types/apps/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "arcade"
                  }
            ],
            destination: "/categories/types/arcade/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "cash-gift-cards"
                  }
            ],
            destination: "/categories/types/cash-gift-cards/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "casual"
                  }
            ],
            destination: "/categories/types/casual/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "crypto-voucher"
                  }
            ],
            destination: "/categories/types/crypto-voucher/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "dance-music"
                  }
            ],
            destination: "/categories/types/dance-music/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "dlcs"
                  }
            ],
            destination: "/categories/types/dlc/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "economy"
                  }
            ],
            destination: "/categories/types/economy/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "extra-content"
                  }
            ],
            destination: "/categories/types/extra-content/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "fantasy"
                  }
            ],
            destination: "/categories/types/fantasy/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "fc-points"
                  }
            ],
            destination: "/categories/types/fc-points/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "food"
                  }
            ],
            destination: "/categories/types/food/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "games"
                  }
            ],
            destination: "/categories/types/games/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "gaming-gift-cards"
                  }
            ],
            destination: "/categories/types/gaming-gift-cards/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "gaming-subscriptions"
                  }
            ],
            destination: "/categories/types/gaming-subscriptions/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "horror"
                  }
            ],
            destination: "/categories/types/horror/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "image-and-photo-editing"
                  }
            ],
            destination: "/categories/types/image-photo-editing/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "indie"
                  }
            ],
            destination: "/categories/types/indie/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "netflix-category"
                  }
            ],
            destination: "/categories/types/netflix/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "nintendo-switch-online"
                  }
            ],
            destination: "/categories/types/nintendo-switch-online/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "other"
                  }
            ],
            destination: "/categories/types/other/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "points-currencies"
                  }
            ],
            destination: "/categories/types/points-currencies/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "psn-category"
                  }
            ],
            destination: "/categories/types/psn/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "racing"
                  }
            ],
            destination: "/categories/types/racing/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "razer-gold"
                  }
            ],
            destination: "/categories/types/razer-gold/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "roblox-category"
                  }
            ],
            destination: "/categories/types/roblox/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "rpg"
                  }
            ],
            destination: "/categories/types/rpg/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "season-pass"
                  }
            ],
            destination: "/categories/types/season-pass/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "simulator"
                  }
            ],
            destination: "/categories/types/simulator/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "sports"
                  }
            ],
            destination: "/categories/types/sports/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "stealth"
                  }
            ],
            destination: "/categories/types/stealth/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "steam-category"
                  }
            ],
            destination: "/categories/types/steam/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "story-based-dlc-s"
                  }
            ],
            destination: "/categories/types/story-based-dlc/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "strategy"
                  }
            ],
            destination: "/categories/types/strategy/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "the-real-steam-bangers"
                  }
            ],
            destination: "/categories/types/the-real-steam-bangers/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "travel"
                  }
            ],
            destination: "/categories/types/travel/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "diablo-4"
                  }
            ],
            destination: "/categories/types/diablo-4/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "fighting"
                  }
            ],
            destination: "/categories/types/fighting/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "gift-me-crypto"
                  }
            ],
            destination: "/categories/types/gift-me-crypto/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "meetup-2019"
                  }
            ],
            destination: "/categories/types/meetup-2019/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "other-randoms"
                  }
            ],
            destination: "/categories/types/other-randoms/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "random-classics"
                  }
            ],
            destination: "/categories/types/random-classics/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "random-try-to-get"
                  }
            ],
            destination: "/categories/types/random-try-to-get/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "riot-points-lol"
                  }
            ],
            destination: "/categories/types/riot-points-lol/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "windows-11"
                  }
            ],
            destination: "/categories/types/windows-11/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "adidas-category"
                  }
            ],
            destination: "/categories/types/adidas/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "ai"
                  }
            ],
            destination: "/categories/types/ai/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "binance-category"
                  }
            ],
            destination: "/categories/types/binance/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "gift-cards"
                  }
            ],
            destination: "/categories/types/gift-cards/",
            permanent: true
      },
      {
            source: "/produits",
            has: [
                  {
                        type: "query",
                        key: "q",
                        value: "health-beauty"
                  }
            ],
            destination: "/categories/types/health-beauty/",
            permanent: true
      }
];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.g2a.com",
        pathname: "/**",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
