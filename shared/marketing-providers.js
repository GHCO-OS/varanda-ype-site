/** Contracts for optional future providers. They add no SDK or network dependency. */
export class CompetitiveKeywordProvider { async getKeywords() { throw new Error('provider_not_configured'); } }
export class TrafficIntelligenceProvider { async getTrafficSources() { throw new Error('provider_not_configured'); } }
export class AdIntelligenceProvider { async getPublicAdThemes() { throw new Error('provider_not_configured'); } }
export class DeliveryGeoProvider { async estimateArea() { throw new Error('provider_not_configured'); } }
export class ContextSignalProvider { async getAggregateSignals() { throw new Error('provider_not_configured'); } }
export class ReviewProvider { async requestReview() { throw new Error('provider_not_configured'); } async getMetrics() { throw new Error('provider_not_configured'); } async syncReviews() { throw new Error('provider_not_configured'); } }
export class CustomerProfileRepository { async findAnonymous() { throw new Error('provider_not_configured'); } }
export class AudienceBuilder { async build() { throw new Error('provider_not_configured'); } }
export class MarketingDestination { async activate() { throw new Error('provider_not_configured'); } }
export class LifecycleEngine { async evaluate() { throw new Error('provider_not_configured'); } }
