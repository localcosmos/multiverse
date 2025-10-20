export const TaxonImageNuidMap: Record<string, Record<string, string>> = {
  'taxonomy.sources.col': {
    '00100300800h': 'Odonata',
    '001008002001': 'Anura',
    '00100300800b': 'Lepidoptera',
    '00100800a': 'Mammalia',
    '001003001': 'Arachnida',
    '001008002': 'Amphibia',
    '00100800c': 'Reptilia',
    '001008005': 'Aves',
    '001008001': 'Fish',
    '001008007': 'Fish',
    '001008008': 'Fish',
    '00100800d': 'Fish',
    '001003': 'Arthropoda',
    '00100j': 'Mollusca',
    '006': 'Plantae',
  }
};


export function getTaxonomicImageFileName (taxonSource: string, taxonNuid: string): null | string {
  let imageFileName = null;

  if (taxonSource in TaxonImageNuidMap) {
    for (const higherTaxonNuid in TaxonImageNuidMap[taxonSource]) {
      if (taxonNuid.startsWith(higherTaxonNuid)) {
        imageFileName = TaxonImageNuidMap[taxonSource][higherTaxonNuid];
        break;
      }
    }
  }

  return imageFileName;
}
