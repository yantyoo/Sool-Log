/**
 * Liquor Brand Real-Image Mapping Service
 * Provides high-res real liquor images based on search queries and categories.
 */

export function getLiquorImageUrl(name: string, type: string): string {
  const normName = name.toLowerCase().trim();
  const normType = type.toLowerCase().trim();

  // 1. Soju (소주)
  if (
    normName.includes('참이슬') ||
    normName.includes('chamisul') ||
    normName.includes('처음처럼') ||
    normName.includes('chumchurum') ||
    normName.includes('진로') ||
    normName.includes('jinro') ||
    normName.includes('새로') ||
    normName.includes('saero') ||
    normName.includes('소주') ||
    normName.includes('한라산') ||
    normType.includes('soju') ||
    normType.includes('소주')
  ) {
    return 'https://images.unsplash.com/photo-1628294895550-9d7a229ed5b0?w=600&auto=format&fit=crop&q=80';
  }

  // 2. Beer (맥주)
  if (
    normName.includes('카스') ||
    normName.includes('cass') ||
    normName.includes('테라') ||
    normName.includes('terra') ||
    normName.includes('켈리') ||
    normName.includes('kelly') ||
    normName.includes('아사히') ||
    normName.includes('asahi') ||
    normName.includes('맥주') ||
    normName.includes('beer') ||
    normName.includes('칭따오') ||
    normName.includes('하이네켄') ||
    normType.includes('beer') ||
    normType.includes('맥주')
  ) {
    return 'https://images.unsplash.com/photo-1538248466277-3e28405d414e?w=600&auto=format&fit=crop&q=80';
  }

  // 3. Wine (와인 / 샴페인)
  if (
    normName.includes('와인') ||
    normName.includes('wine') ||
    normName.includes('샴페인') ||
    normName.includes('champagne') ||
    normName.includes('보르도') ||
    normName.includes('샤또') ||
    normName.includes('레드와인') ||
    normName.includes('화이트와인') ||
    normType.includes('wine') ||
    normType.includes('와인')
  ) {
    return 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80';
  }

  // 4. Whiskey (위스키 / 브랜디)
  if (
    normName.includes('위스키') ||
    normName.includes('whiskey') ||
    normName.includes('맥캘란') ||
    normName.includes('macallan') ||
    normName.includes('발렌타인') ||
    normName.includes('ballantines') ||
    normName.includes('조니워커') ||
    normName.includes('johnnie walker') ||
    normName.includes('글렌피딕') ||
    normName.includes('glenfiddich') ||
    normName.includes('버번') ||
    normType.includes('whiskey') ||
    normType.includes('위스키')
  ) {
    return 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&auto=format&fit=crop&q=80';
  }

  // 5. Makgeolli (막걸리 / 탁주)
  if (
    normName.includes('막걸리') ||
    normName.includes('makgeolli') ||
    normName.includes('동동주') ||
    normName.includes('탁주') ||
    normName.includes('장수막걸리') ||
    normType.includes('makgeolli') ||
    normType.includes('막걸리')
  ) {
    return 'https://images.unsplash.com/photo-1634818462211-ee45ff03acc0?w=600&auto=format&fit=crop&q=80';
  }

  // Fallback: Elegant bar display
  return 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&auto=format&fit=crop&q=80';
}
