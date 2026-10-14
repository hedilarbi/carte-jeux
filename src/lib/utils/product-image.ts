interface ProductImageCorrection {
  brokenHash: string;
  replacementHash: string | null;
}
const FALLBACK_PRODUCT_IMAGE = "/jeu1.jpg";

// Confirmed with a live G2A check on 2026-10-14. These hashes returned 404.
const BROKEN_G2A_IMAGE_HASHES = new Set([
  "590398aeae653a8b96290523",
  "59077a7fae653a9ef94b6863",
  "590ddbbfae653a10157e22cb",
  "590df0ceae653a3a34528a3d",
  "590df6c35bafe35a491730f6",
  "590e5d7fae653a14820e1729",
  "590ed68fae653a042e163fac",
  "590ede055bafe3298b73202f",
  "590efc6cae653a51131e7c9e",
  "590f08b05bafe37fa13939dd",
  "590f0ebcae653a75b4009d00",
  "590f75bf5bafe3595a626e2d",
  "59105f0cae653a479a3aeb7c",
  "5910638f5bafe36df9004864",
  "5910950fae653abc4501c0b9",
  "5910bbd6ae653a0a557c8e28",
  "5910ea3aae653a695a6db812",
  "591128525bafe3ff0a0b3646",
  "5911472fae653a26a9534122",
  "591149235bafe342b6131ea7",
  "5911783c5bafe3a0d13aa46e",
  "5911bde6ae653a583537556a",
  "5911c5b65bafe37fd92809ff",
  "5911e234ae653aa32c184312",
  "5911e47a5bafe3c02f346c87",
  "5911ed0c5bafe3d2030d9c65",
  "5911eea15bafe3d5710a15f3",
  "5911ffe4ae653ae14f333e0f",
  "59120c195bafe311de7edf20",
  "59121e6bae653a1fa40e9293",
  "59122792ae653a32f81a3b5d",
  "59122b6eae653a3b0b56e12f",
  "59123123ae653a46dd46af6b",
  "5912359bae653a50207a55d4",
  "591246b6ae653a745049ed56",
  "591247ff5bafe38beb1e509b",
  "59124811ae653a771f64d0b6",
  "591248255bafe38c8824c3f4",
  "59124d415bafe3977637f039",
  "59124def5bafe396495f6ac9",
  "59124f8eae653a8621393814",
  "591250ee5bafe3977637f3ba",
  "591250f5ae653a89095e2268",
  "59125439ae653a8f991e0dcb",
  "59125ac35bafe3aad7694189",
  "59125b175bafe3b384419239",
  "59125b2d5bafe3b38441924d",
  "59125cefae653aa21546eb59",
  "59125f34ae653aa6a75bf00d",
  "59125f45ae653aa6db72d32b",
  "591260805bafe3be7e0cded1",
  "591260c55bafe3badb29a874",
  "5912644cae653ab0ce67bb91",
  "591265cdae653ab3d90799cd",
  "59126b5dae653abf72181d64",
  "59126e6cae653ac57742e21a",
  "5912724e5bafe3de117637b7",
  "591275565bafe3e5a82e24f9",
  "591279495bafe3ed3d32d7d7",
  "59127aaa5bafe3ed3d32d94d",
  "5912858dae653af5fb163625",
  "591285975bafe307e87c1f79",
  "591289dc5bafe30c0b651c58",
  "59128a155bafe30d89048593",
  "59128a245bafe30d890485a3",
  "59128d975bafe30d890488c7",
  "59129acfae653a21650a760a",
  "59129d55ae653a25667d8bb3",
  "59129e385bafe3387f63cfe0",
  "5912aeac5bafe3595502d1de",
  "5912b1daae653a4eea0b8333",
  "5912b532ae653a54a441cd62",
  "5912b884ae653a5add345843",
  "5912bc1dae653a632210940e",
  "5912c076ae653a6c0750cd92",
  "5912c660ae653a76ec1a3b27",
  "5912c692ae653a76ec1a3b44",
  "5912c85b5bafe38a777f5b9a",
  "5912cb055bafe3939a2c94ea",
  "5912cb5b5bafe393bb04c800",
  "5912cbde5bafe395253a22bf",
  "5912cbe85bafe395253a22c6",
  "5912cbf75bafe395253a22cf",
  "5912cc645bafe3956e170ccc",
  "5912d3305bafe3a33a2818ed",
  "5912d350ae653a91fa5da2a9",
  "5912d3e5ae653a93d74357aa",
  "5912eb9cae653ac4713f8419",
  "5912f2ddae653ad4107aa488",
  "5913330fae653a5a0723daf3",
  "59452f6a5bafe332757bb692",
  "59b78fdfae653ad02b41b9c3",
  "59d815555bafe382af5bb8f4",
  "5a16fa7d5bafe3551d628932",
  "5a26e29f5bafe3b2244656b2",
  "5a2911075bafe3ab2a08fb62",
  "5a31f486ae653a122d29fe82",
  "5a527c9a5bafe39bde1787b3",
  "5a567e16ae653ae3cf6c510a",
  "5a6ff5965bafe3a77748c833",
  "5a7bfa5c5bafe32fbf193882",
  "5a8547ed5bafe37c9321bd42",
  "5ab55695ae653a717d18b723",
  "5ab8ea6d5bafe30e69248ea4",
  "5ad94fe65bafe36ab11e5bd4",
  "5ae6e7305bafe307af343852",
  "5af715d75bafe314a6201f85",
  "5b19a7e3ae653a86cf4f1653",
  "5b429e695bafe381c80c0fd8",
  "5b4f9e47ae653aa2551a09c8",
  "5ba371ccae653a58673b8072",
  "5ba374545bafe32a8158947e",
  "5ba378ccae653a792f40cb22",
  "5ba37d64ae653a7b0b37df52",
  "5ba381abae653a7b46008d12",
  "5ba383985bafe34afe2e1143",
  "5bacadd05bafe31b1a5cb2e2",
  "5bb434775bafe320bb20a542",
  "5bb7d3855bafe3cce75f11e1",
  "5bbd1d9f5bafe314d60ffc12",
  "5bc0701d5bafe330363d3bb8",
  "5bc6e775ae653ac7d26d6d63",
  "5bd6be01ae653aeb8e452e12",
  "5bd92161ae653ab0a2309c31",
  "5be56198ae653a2e111aaf82",
  "5be74ca1ae653a2c1a1c91b3",
  "5c06287fae653ab6060eb872",
  "5c0e7388ae653abbc77d1b52",
  "5c1a2e6cae653a0b671cd3f2",
  "5c38821f5bafe3db0c2d9b92",
  "5c3c47ffae653a90332cd732",
  "5c3c48dcae653a8fd269dd23",
  "5c3c4d845bafe3342262bc23",
  "5c3c4eb35bafe33357577574",
  "5c3c4fb85bafe3391c0c1cd2",
  "5c3c64af5bafe358b23cd003",
  "5c49b6635bafe310924e9e62",
  "5c528e9d5bafe39d35439c52",
  "5c54236b5bafe309a67bc552",
  "5c542a93ae653ab7db54b7f3",
  "5c585188ae653a4cf6196bb2",
  "5ca454885bafe3d59d3584e2",
  "5ca4ab885bafe35b8f1584c2",
  "5cadefecae653adc1126f292",
  "5ce3f81f5bafe3ea206850d2",
  "5cf62f6b7e696c0fda1076f2",
  "5cfa6afb46177c25f008bac2",
  "5cfe4b687e696c0b57096d13",
  "5d287ac746177c0b25640482",
  "5d63a4e67e696c4bb6687b42",
  "5d763ef37e696c5b8139ebd4",
  "5d8af87d46177c76c81882e2",
  "5da5a5427e696c7eaf6486e2",
  "5dd3946d46177c530a401bc2",
  "5dd5236c7e696c53c94f4523",
  "5dd62cdf7e696c4ddd463715",
  "5dd64d4846177c07995fc7a3",
  "5de8ba5046177c5a72694372",
  "5df8ad7d46177c66ec6194f3",
  "5dfa3ed546177c66347333c2",
  "5e32bc637e696c3764032004",
  "5ecb706a7e696c61df0148c2",
  "5ef32bcf46177c35e6715eb2",
  "5ef3330546177c3c9f13ea92",
  "5ef339117e696c2164562e32",
  "5efdc72a7e696c5db4466552",
  "5f071fe946177c14c8622082",
  "5f0811037e696c1294011442",
  "5f0846e87e696c784e049dc2",
  "5f605de346177c06b6033193",
  "5f60761046177c776d32a443",
  "5f718e2946177c1c663465e4",
  "5f927abc7e696c15431c7752"
]);

// Main-image replacements returned by the current G2A product catalogue and
// individually checked before being added here.
const PRODUCT_IMAGE_CORRECTIONS: Record<string, ProductImageCorrection> = {
  "life-is-strange-complete-season-episodes-1-5-steam-gift-united-states-i10000025993017": {
    "brokenHash": "5bd6be01ae653aeb8e452e12",
    "replacementHash": "5912c2c2ae653a714d5088c9"
  },
  "dead-space-2-pc-steam-gift-japan-i10000005226011": {
    "brokenHash": "5f0811037e696c1294011442",
    "replacementHash": "590db27bae653a7c5c292a1e"
  },
  "dark-void-zero-steam-key-global-i10000008381006": {
    "brokenHash": "591128525bafe3ff0a0b3646",
    "replacementHash": "591128505bafe3ff0a0b3645"
  },
  "dead-sky-steam-gift-global-i10000008344001": {
    "brokenHash": "5910bbd6ae653a0a557c8e28",
    "replacementHash": "5910bbd85bafe320c2108f17"
  },
  "dragon-age-origins-ultimate-edition-pc-steam-gift-japan-i10000044805006": {
    "brokenHash": "5f071fe946177c14c8622082",
    "replacementHash": "5910e8f95bafe37dfa4b0b74"
  },
  "battlefield-v-definitive-edition-pc-steam-gift-japan-i10000155679028": {
    "brokenHash": "5f927abc7e696c15431c7752",
    "replacementHash": "5b06acf9ae653a43660371d2"
  },
  "my-friend-pedro-soundtrack-bundle-pc-steam-gift-global-i10000188646005": {
    "brokenHash": "5cfe4b687e696c0b57096d13",
    "replacementHash": "5cfe4b3646177c19810e7692"
  },
  "onechanbara-z2-chaos-steam-gift-europe-i10000017618003": {
    "brokenHash": "5cadefecae653adc1126f292",
    "replacementHash": "591210f3ae653a04356877d9"
  },
  "the-journey-down-chapter-three-steam-gift-europe-i10000079123004": {
    "brokenHash": "5c49b6635bafe310924e9e62",
    "replacementHash": "5c49b6635bafe3114e5ad482"
  },
  "real-warfare-1242-steam-gift-global-i10000043887001": {
    "brokenHash": "590df0ceae653a3a34528a3d",
    "replacementHash": "590df0cdae653a39b163daf9"
  },
  "the-whispered-world-pc-steam-key-global-i10000043176002": {
    "brokenHash": "590df6c35bafe35a491730f6",
    "replacementHash": "59110b985bafe3c42f167c08"
  },
  "starpoint-gemini-3-supporter-bundle-steam-key-global-i10000190739001": {
    "brokenHash": "5d8af87d46177c76c81882e2",
    "replacementHash": null
  },
  "red-dead-redemption-2-xbox-one-xbox-live-key-brazil-i10000174280051": {
    "brokenHash": "5f0846e87e696c784e049dc2",
    "replacementHash": null
  },
  "tekken-7-ultimate-edition-pc-steam-key-united-states-i10000068149025": {
    "brokenHash": "5ecb706a7e696c61df0148c2",
    "replacementHash": "5b17f6245bafe35af150d4c3"
  },
  "darksiders-genesis-pc-steam-key-japan-i10000192252011": {
    "brokenHash": "5efdc72a7e696c5db4466552",
    "replacementHash": "5dbaa2437e696c205e2ac702"
  },
  "close-combat-gateway-to-caen-steam-key-europe-i10000046641006": {
    "brokenHash": "5911472fae653a26a9534122",
    "replacementHash": "591147315bafe33dcc305277"
  },
  "mass-effect-andromeda-points-500-points-xbox-one-xbox-live-key-global-i10000036850004": {
    "brokenHash": "5a2911075bafe3ab2a08fb62",
    "replacementHash": null
  }
};

function getImageHash(image: string | undefined) {
  return image?.split("/").at(-1)?.trim();
}

function isBrokenProductImage(image: string | undefined) {
  const hash = getImageHash(image);
  return Boolean(hash && BROKEN_G2A_IMAGE_HASHES.has(hash));
}

export function resolveProductImage(image: string | undefined, slug: string) {
  const correction = PRODUCT_IMAGE_CORRECTIONS[slug];

  if (!correction || getImageHash(image) !== correction.brokenHash) {
    return image;
  }

  return correction.replacementHash
    ? `https://images.g2a.com/0x0/1x1x1/${slug}/${correction.replacementHash}`
    : FALLBACK_PRODUCT_IMAGE;
}

export function resolveProductGallery(
  gallery: string[],
  slug: string,
  image: string | undefined,
) {
  const resolvedImage = resolveProductImage(image, slug);

  return [resolvedImage, ...gallery]
    .filter(
      (candidate): candidate is string =>
        Boolean(candidate) && !isBrokenProductImage(candidate),
    )
    .filter((candidate, index, candidates) => candidates.indexOf(candidate) === index);
}
