// =============================================================================
// HELLOJUNE FESTIVAL KNOWLEDGE GRAPH - COMPREHENSIVE DATA IMPORT
// Generated: 2025-12-29
// Source: 15 HelloJune research documents
// =============================================================================

// -----------------------------------------------------------------------------
// FESTIVALS - Global Festival Profiles
// -----------------------------------------------------------------------------

CREATE (f1:Festival {
  name: 'Les Déferlantes',
  location: 'Le Barcarès, France',
  region: 'Occitania',
  country: 'France',
  attendees: 100000,
  capacity: 140000,
  mainstage_capacity: 35000,
  vip_capacity: 4800,
  num_artists: 55,
  num_partners: 250,
  women_percentage: 62,
  gen_z_percentage: 70,
  age_18_34_percentage: 70,
  description: 'Beach festival in the Pyrenees Orientales with the iconic Lydia ship for VIP areas',
  unique_feature: 'Stages 50 meters from the sea, Lydia ship for VIP',
  identity: 'Made in Pyrenees Orientales - regional identity focus',
  media_value_eur: 537000,
  social_facebook_followers: 76000,
  social_instagram_followers: 82000,
  social_tiktok_followers: 10000,
  tiktok_growth_rate: 82.4,
  instagram_growth_rate: 35.5,
  facebook_growth_rate: 41
});

CREATE (f2:Festival {
  name: 'Coachella',
  location: 'Indio, California',
  country: 'USA',
  attendees: 250000,
  women_percentage: 58,
  ticket_price_usd: 599,
  description: 'Premier music and arts festival, the Super Bowl of brand experiences',
  notable_year: 2024,
  key_activations: 'Rhode x 818 beauty booth, Pinterest Manifest Station, Poppi House'
});

CREATE (f3:Festival {
  name: 'Primavera Sound',
  location: 'Barcelona',
  country: 'Spain',
  economic_impact_eur: 300000000,
  description: 'Leader in inclusion, featured the Holy Trinity of Pop in 2025',
  notable_year: 2025,
  lineup_feature: 'Charli XCX, Sabrina Carpenter, Chappell Roan',
  gender_parity: true
});

CREATE (f4:Festival {
  name: 'Lollapalooza',
  location: 'Chicago, Illinois',
  country: 'USA',
  attendees: 400000,
  anniversary_year: 2024,
  anniversary_edition: 20,
  description: 'Celebrated 20th anniversary with 400,000 fans',
  key_activation: 'Coca-Cola roller skating rink'
});

CREATE (f5:Festival {
  name: 'Glastonbury',
  location: 'Somerset, England',
  country: 'UK',
  description: 'Legendary UK festival known for cultural significance and sustainability focus'
});

CREATE (f6:Festival {
  name: 'Tomorrowland',
  location: 'Boom, Belgium',
  country: 'Belgium',
  description: 'Reference in sustainability with Love Tomorrow platform',
  sustainability_target: 'Recycle 70% of waste, 100% green energy',
  platform: 'Love Tomorrow'
});

CREATE (f7:Festival {
  name: 'All Things Go',
  location: 'Washington DC',
  country: 'USA',
  women_lineup_percentage: 81,
  description: 'Festival by women for women with 81% female representation in lineup',
  focus: 'Women-led festival experience'
});

CREATE (f8:Festival {
  name: 'Sónar',
  location: 'Barcelona',
  country: 'Spain',
  description: 'Electronic and experimental music festival with strong tech innovation focus'
});

CREATE (f9:Festival {
  name: 'AfroFuture',
  location: 'Detroit, Michigan',
  country: 'USA',
  description: 'Afrocentric festival celebrating Black culture and futures'
});

CREATE (f10:Festival {
  name: 'Governors Ball',
  location: 'New York City',
  country: 'USA',
  description: 'NYC premier music festival in urban setting'
});

CREATE (f11:Festival {
  name: 'Reading & Leeds',
  location: 'Reading/Leeds, England',
  country: 'UK',
  description: 'Twin UK rock festivals with strong youth appeal'
});

// -----------------------------------------------------------------------------
// STATISTICS - Market Data and Insights
// -----------------------------------------------------------------------------

CREATE (s1:Statistic {
  name: 'Gen Z Global Purchasing Power',
  value: 360000000000,
  unit: 'USD',
  category: 'Demographics',
  description: 'Generation Z holds $360 billion in global purchasing power'
});

CREATE (s2:Statistic {
  name: 'Gen Z Monthly Event Spending',
  value: 38,
  unit: 'USD/month',
  category: 'Consumer Behavior',
  description: 'Gen Z spends an average of $38 per month on events'
});

CREATE (s3:Statistic {
  name: 'Festival Market Size 2021',
  value: 6500000000,
  unit: 'USD',
  category: 'Market',
  year: 2021,
  description: 'Global festival market valued at $6.5 billion in 2021'
});

CREATE (s4:Statistic {
  name: 'European Festival Market Projection 2025',
  value: 25000000000,
  unit: 'EUR',
  category: 'Market',
  year: 2025,
  description: 'European festival market projected to exceed €25 billion by 2025'
});

CREATE (s5:Statistic {
  name: 'Gen Z Sobriety at Festivals',
  value: 60,
  unit: 'percent',
  category: 'Consumer Behavior',
  description: '60% of Gen Z do not consume alcohol or drugs at festivals'
});

CREATE (s6:Statistic {
  name: 'Gen Z Reduced Alcohol Consumption',
  value: 25,
  unit: 'percent less',
  category: 'Consumer Behavior',
  description: 'Gen Z consumes 25% less alcohol than Millennials'
});

CREATE (s7:Statistic {
  name: 'Budget Overspend at Live Events',
  value: 86,
  unit: 'percent',
  category: 'Consumer Behavior',
  description: '86% of Gen Z admits to exceeding budget at live events'
});

CREATE (s8:Statistic {
  name: 'Sustainability Boycott Intent',
  value: 73,
  unit: 'percent',
  category: 'Values',
  description: '73% of Gen Z would boycott events with poor environmental practices'
});

CREATE (s9:Statistic {
  name: 'Brand Trust After Activation',
  value: 68,
  unit: 'percent',
  category: 'Brand Engagement',
  description: '68% trust a brand more after a quality physical activation'
});

CREATE (s10:Statistic {
  name: 'Preference for Participatory Brands',
  value: 87,
  unit: 'percent',
  category: 'Brand Engagement',
  description: '87% of Gen Z prefers brands that are participatory rather than passive'
});

CREATE (s11:Statistic {
  name: 'Swiss Women Strike 2019',
  value: 500000,
  unit: 'women',
  category: 'Cultural Moment',
  year: 2019,
  country: 'Switzerland',
  description: '500,000 Swiss women went on strike in 2019, creating empowerment market demand'
});

CREATE (s12:Statistic {
  name: 'Swiss Event ARPU',
  value: 235,
  unit: 'USD',
  category: 'Market',
  country: 'Switzerland',
  description: 'Swiss events market has ARPU of $235, supporting premium ticket pricing'
});

CREATE (s13:Statistic {
  name: 'Food and Beverage Spending at Events',
  value: 41.3,
  unit: 'percent of budget',
  category: 'Consumer Behavior',
  description: 'Gen Z spends 41.3% of event budget on food and beverage'
});

CREATE (s14:Statistic {
  name: 'Clothing Spending at Events',
  value: 33.7,
  unit: 'percent of budget',
  category: 'Consumer Behavior',
  description: 'Gen Z spends 33.7% of event budget on clothing'
});

CREATE (s15:Statistic {
  name: 'Word of Mouth Discovery',
  value: 58.5,
  unit: 'percent',
  category: 'Marketing',
  context: 'Les Déferlantes',
  description: '58.5% of festivalgoers discover the festival through word of mouth'
});

CREATE (s16:Statistic {
  name: 'Social Media Discovery',
  value: 53.4,
  unit: 'percent',
  category: 'Marketing',
  context: 'Les Déferlantes',
  description: '53.4% of festivalgoers discover the festival through social media'
});

CREATE (s17:Statistic {
  name: 'AI Adoption in Events',
  value: 50,
  unit: 'percent',
  category: 'Technology',
  year: 2025,
  description: '50% of event planners now using AI tools (Bizzabo research)'
});

CREATE (s18:Statistic {
  name: 'AI ROI in Events',
  value: 3.7,
  unit: 'x ROI',
  category: 'Technology',
  description: '3.7x average ROI on AI investments in events industry'
});

// -----------------------------------------------------------------------------
// BRAND ACTIVATIONS - Case Studies from Festivals
// -----------------------------------------------------------------------------

CREATE (ba1:BrandActivation {
  name: 'Rhode x 818 Beauty Booth',
  brand: 'Rhode Skin by Hailey Bieber',
  festival: 'Coachella',
  year: 2024,
  earned_media_value_usd: 2630000000,
  description: 'Simple photo booth that generated $2.63 billion in earned media value',
  success_factor: 'Perfect audience fit with festival demographics'
});

CREATE (ba2:BrandActivation {
  name: 'Poppi House',
  brand: 'Poppi',
  festival: 'Coachella',
  year: 2024,
  description: 'Prebiotic soda brand immersive house experience'
});

CREATE (ba3:BrandActivation {
  name: 'Pinterest Manifest Station',
  brand: 'Pinterest',
  festival: 'Coachella',
  year: 2024,
  description: 'Interactive manifestation experience using Pinterest vision boards'
});

CREATE (ba4:BrandActivation {
  name: 'Ulta House of Joy',
  brand: 'Ulta Beauty',
  festival: 'Coachella',
  year: 2024,
  description: 'Beauty experience house with touchups and product sampling'
});

CREATE (ba5:BrandActivation {
  name: 'Club Magenta',
  brand: 'T-Mobile',
  festival: 'Various',
  description: 'Phone charging stations solving a key festival pain point',
  pain_point_solved: 'Phone battery'
});

CREATE (ba6:BrandActivation {
  name: 'Scent Marketing Bubbles',
  brand: 'Tree Hut',
  festival: 'Various',
  description: 'Perfumed bubbles creating lasting emotional memories through sensory marketing'
});

CREATE (ba7:BrandActivation {
  name: 'Coca-Cola Roller Skating Rink',
  brand: 'Coca-Cola',
  festival: 'Lollapalooza',
  year: 2024,
  description: 'Interactive roller skating experience at Lollapalooza 20th anniversary'
});

CREATE (ba8:BrandActivation {
  name: 'Etam Partnership Event',
  brand: 'Etam',
  context: 'HelloJune',
  description: 'Corporate event partnership proving B2B market for women events'
});

// -----------------------------------------------------------------------------
// TRENDS - Industry Trends and Shifts
// -----------------------------------------------------------------------------

CREATE (t1:Trend {
  name: 'Radical Sustainability',
  category: 'Values',
  status: 'Requirement not bonus',
  description: 'Sustainability is no longer a bonus but a base requirement for festivals',
  gen_z_impact: '73% would boycott events with poor environmental practices'
});

CREATE (t2:Trend {
  name: 'Anti-Toxic Wellness',
  category: 'Consumer Behavior',
  description: 'Rejection of toxic wellness culture in favor of authentic anti-perfection messaging',
  key_phrase: 'Wellness tea tired us out'
});

CREATE (t3:Trend {
  name: 'Sober Curious Movement',
  category: 'Consumer Behavior',
  description: '60% of Gen Z prefer mocktails, wellness zones, and serenity experiences at festivals',
  alternatives: 'Yoga, mindfulness, energetic serenity experiences'
});

CREATE (t4:Trend {
  name: 'Boutique Festival Growth',
  category: 'Market',
  description: 'Growth of smaller, highly curated niche festivals escaping commercial homogenization'
});

CREATE (t5:Trend {
  name: 'Physical-Digital Convergence',
  category: 'Technology',
  description: 'Couchella driving value of in-person while adding digital conveniences',
  technologies: 'Cashless payments, biometric entry, AR/VR experiences'
});

CREATE (t6:Trend {
  name: 'Women-Led Lineups',
  category: 'Diversity',
  description: 'Increasing demand for gender parity in festival lineups',
  example: 'All Things Go with 81% female representation'
});

CREATE (t7:Trend {
  name: 'Festivals as Social Currency',
  category: 'Culture',
  description: 'Festivals function as physical social currency for self-expression rituals',
  brand_role: 'Brands invited as utility partners not mere advertisers'
});

CREATE (t8:Trend {
  name: 'Sensory Marketing',
  category: 'Marketing',
  description: 'Olfactory and multi-sensory brand activations creating lasting emotional memories',
  example: 'Tree Hut perfumed bubbles'
});

CREATE (t9:Trend {
  name: 'Storyliving over Storytelling',
  category: 'Marketing',
  description: 'Festivals as Super Bowl of brand experiences - living the story not just telling it'
});

CREATE (t10:Trend {
  name: 'Safety-First for Women',
  category: 'Operations',
  description: 'Reinforced security protocols like No Callem, personal care infrastructure',
  example: 'No Callem protocol'
});

// -----------------------------------------------------------------------------
// HELLOJUNE BRAND - Swiss Women Empowerment Events
// -----------------------------------------------------------------------------

CREATE (hj:Organization {
  name: 'HelloJune',
  type: 'Event Company',
  country: 'Switzerland',
  region: 'Swiss Romandy',
  founded: 2024,
  founders: 'Myriam Stadler & Aurélie',
  instagram_followers: 2534,
  instagram_handle: '@hellojune.ch',
  website: 'hellojune.ch',
  google_presence: 'Zero',
  primary_color: '#A124C4',
  positioning: 'Anti-toxic positivity, women empowerment through masquerade ball experiences',
  target_audience: 'Professional mothers and women 25-45 in French-speaking Switzerland',
  event_format: 'Multi-sensory 6-hour masquerade ball experiences',
  unique_value: 'Only dedicated masquerade ball promoter in Swiss Romandy',
  services: 'Massage, tarot, dental gems, beauty touchups',
  price_value: 'CHF 300+ in services per event'
});

CREATE (hjInsight1:Insight {
  name: 'HelloJune Zero Google Presence',
  category: 'Digital Gap',
  description: 'HelloJune operates successfully with zero Google presence - massive growth opportunity',
  action: 'SEO-optimized website needed'
});

CREATE (hjInsight2:Insight {
  name: 'Anti-Perfection Positioning',
  category: 'Brand Strategy',
  description: 'Rejects toxic wellness culture, celebrates imperfection as belonging requirement',
  differentiator: true
});

CREATE (hjInsight3:Insight {
  name: 'Mental Load of Mothers',
  category: 'Target Audience',
  description: 'Directly addresses mental load pain point of professional mothers through escape experiences',
  emotional_core: 'Liberation from perfection'
});

CREATE (hjInsight4:Insight {
  name: 'Sisterhood Keyword Trending',
  category: 'Cultural Moment',
  description: 'Sororité keyword trending in Romandie post-2019 women strike',
  opportunity: 'Cultural alignment with movement'
});

CREATE (hjInsight5:Insight {
  name: 'Swiss Women Vote 1971',
  category: 'Historical Context',
  description: 'Swiss women gained voting rights only in 1971, explaining high demand for empowerment',
  market_driver: true
});

// -----------------------------------------------------------------------------
// SPONSORS - Potential and Recommended Partners
// -----------------------------------------------------------------------------

CREATE (sp1:Sponsor {
  name: 'AXA',
  tier: 1,
  category: 'Insurance',
  fit: 'Health and wellness messaging'
});

CREATE (sp2:Sponsor {
  name: 'Swiss Life',
  tier: 1,
  category: 'Insurance',
  fit: 'Financial empowerment for women'
});

CREATE (sp3:Sponsor {
  name: 'Rare Beauty',
  tier: 1,
  category: 'Beauty',
  fit: 'Mental health focus aligns with anti-toxic wellness'
});

CREATE (sp4:Sponsor {
  name: 'Sephora',
  tier: 1,
  category: 'Beauty Retail',
  fit: 'Premium beauty experience, makeup touchups',
  activation_concept: 'Sephora Sororité Lounge'
});

CREATE (sp5:Sponsor {
  name: 'LOréal Paris',
  tier: 1,
  category: 'Beauty',
  fit: 'Hair refresh, beauty masterclasses',
  activation_concept: 'Les Déferlantes Glow Kit co-creation'
});

CREATE (sp6:Sponsor {
  name: 'Female Invest',
  tier: 1,
  category: 'Fintech',
  fit: 'Financial empowerment for women'
});

CREATE (sp7:Sponsor {
  name: 'Lyra Health',
  tier: 2,
  category: 'Mental Health',
  fit: 'Workplace mental health, wellness focus'
});

CREATE (sp8:Sponsor {
  name: 'Weleda',
  tier: 2,
  category: 'Natural Beauty',
  fit: 'Natural wellness, sustainability focus'
});

CREATE (sp9:Sponsor {
  name: 'LOccitane',
  tier: 2,
  category: 'Beauty',
  fit: 'Natural skincare, sustainable practices'
});

CREATE (sp10:Sponsor {
  name: 'Perrier',
  tier: 2,
  category: 'Beverage',
  fit: 'Premium hydration, mocktail culture'
});

CREATE (sp11:Sponsor {
  name: 'Evian',
  tier: 2,
  category: 'Beverage',
  fit: 'Hydration station activation'
});

CREATE (sp12:Sponsor {
  name: 'Club Med',
  tier: 2,
  category: 'Travel',
  fit: 'Escape experiences, travel interest 25%'
});

CREATE (sp13:Sponsor {
  name: 'Patagonia',
  tier: 2,
  category: 'Sustainable Fashion',
  fit: 'Sustainability leader, textile interest 35%'
});

CREATE (sp14:Sponsor {
  name: 'Rituals',
  tier: 1,
  category: 'Wellness',
  fit: 'Ritual Space activation, massage zone',
  activation_concept: 'Rituals Ritual Space'
});

CREATE (sp15:Sponsor {
  name: 'Nuxe',
  tier: 2,
  category: 'Beauty',
  fit: 'Massage zone, natural beauty'
});

CREATE (sp16:Sponsor {
  name: 'The Body Shop',
  tier: 2,
  category: 'Beauty',
  fit: 'Ethical beauty, community focus'
});

CREATE (sp17:Sponsor {
  name: 'Caudalie',
  tier: 2,
  category: 'Beauty',
  fit: 'French vineyard beauty, sustainability'
});

CREATE (sp18:Sponsor {
  name: 'Kiko Milano',
  tier: 3,
  category: 'Beauty',
  fit: 'Accessible makeup, touchup stations'
});

CREATE (sp19:Sponsor {
  name: 'Douglas',
  tier: 2,
  category: 'Beauty Retail',
  fit: 'Multi-brand beauty experience'
});

CREATE (sp20:Sponsor {
  name: 'Always',
  tier: 3,
  category: 'Personal Care',
  fit: 'Wellness essentials, women comfort'
});

CREATE (sp21:Sponsor {
  name: 'Tampax',
  tier: 3,
  category: 'Personal Care',
  fit: 'Wellness essentials'
});

CREATE (sp22:Sponsor {
  name: 'Garnier',
  tier: 3,
  category: 'Beauty',
  fit: 'Hair refresh stations'
});

CREATE (sp23:Sponsor {
  name: 'Yves Rocher',
  tier: 3,
  category: 'Beauty',
  fit: 'Natural beauty, French heritage'
});

CREATE (sp24:Sponsor {
  name: 'Clarins',
  tier: 2,
  category: 'Beauty',
  fit: 'Premium skincare experience'
});

CREATE (sp25:Sponsor {
  name: 'Pampers',
  tier: 2,
  category: 'Baby Care',
  fit: 'Motherhood brand - scholarship program sponsor',
  activation_concept: '100 free tickets for mothers'
});

CREATE (sp26:Sponsor {
  name: 'Nestlé',
  tier: 2,
  category: 'Food',
  fit: 'Family nutrition, motherhood focus'
});

CREATE (sp27:Sponsor {
  name: 'SNCF',
  tier: 3,
  category: 'Transport',
  fit: 'Inclusive transport access'
});

CREATE (sp28:Sponsor {
  name: 'Birchbox',
  tier: 3,
  category: 'Beauty Subscription',
  fit: 'Subscriber experience activation'
});

CREATE (sp29:Sponsor {
  name: 'Vestiaire Collective',
  tier: 3,
  category: 'Fashion',
  fit: 'Sustainable fashion, sellers meetup'
});

CREATE (sp30:Sponsor {
  name: 'Showroomprivé',
  tier: 3,
  category: 'E-commerce',
  fit: 'VIP customer experience'
});

// Indie/Emerging brands for aggregator model
CREATE (sp31:Sponsor {
  name: 'Gisou',
  tier: 4,
  category: 'Hair Care',
  fit: 'Instagram-worthy hair oil brand'
});

CREATE (sp32:Sponsor {
  name: 'Tower 28',
  tier: 4,
  category: 'Clean Beauty',
  fit: 'Clean makeup for sensitive skin'
});

CREATE (sp33:Sponsor {
  name: 'Youth to the People',
  tier: 4,
  category: 'Skincare',
  fit: 'Vegan superfood skincare'
});

CREATE (sp34:Sponsor {
  name: 'Frank Body',
  tier: 4,
  category: 'Body Care',
  fit: 'Instagram-famous body scrubs'
});

CREATE (sp35:Sponsor {
  name: 'Bondi Sands',
  tier: 4,
  category: 'Self Tanner',
  fit: 'Festival glow preparation'
});

// -----------------------------------------------------------------------------
// ACTIVATION CONCEPTS - Strategic Ideas
// -----------------------------------------------------------------------------

CREATE (ac1:ActivationConcept {
  name: 'Espace Sororité',
  model: 'Trojan Horse',
  description: 'Dedicated women-only space at festival operated as essential service',
  revenue_target: 75000,
  pitch: '62% of your audience is female. No French festival has a dedicated space for this majority.',
  cost_to_festival: 0
});

CREATE (ac2:ActivationConcept {
  name: 'White Label Lounge',
  model: 'White Label Play',
  description: 'Sponsor buys the concept - HelloJune designs, operates, delivers everything',
  example: 'Sephora Sororité Lounge',
  budget: 40000
});

CREATE (ac3:ActivationConcept {
  name: 'Sororité Collective',
  model: 'Aggregator',
  description: '10 micro-booths at €2K each for indie/emerging brands',
  revenue_target: 20000,
  num_sponsors: 10,
  sponsor_cost: 2000
});

CREATE (ac4:ActivationConcept {
  name: 'Festival Content Package',
  model: 'Content Studio',
  description: 'Professional content creation service for brands at festival',
  deliverables: '200 photos, 3 reels, 10 stories, 5 testimonials',
  price: 8000
});

CREATE (ac5:ActivationConcept {
  name: 'Sisterhood Scholarship',
  model: 'Scholarship Play',
  description: '100 free tickets for mothers who never attended a festival',
  sponsor_cost: 30000,
  pr_value: 'National press coverage, viral social moment'
});

CREATE (ac6:ActivationConcept {
  name: 'Sunset Sisterhood Sessions',
  model: 'Festival Within Festival',
  description: '2-hour intimate talks + live music + champagne at sunset',
  ticket_price: 45,
  capacity_per_session: 100,
  total_revenue: 23500
});

// -----------------------------------------------------------------------------
// AUDIENCE INTERESTS - Les Déferlantes Data
// -----------------------------------------------------------------------------

CREATE (ai1:AudienceInterest {
  name: 'Textile and Fashion',
  percentage: 35,
  context: 'Les Déferlantes audience interests'
});

CREATE (ai2:AudienceInterest {
  name: 'Travel',
  percentage: 25,
  context: 'Les Déferlantes audience interests'
});

CREATE (ai3:AudienceInterest {
  name: 'Cosmetics and Beauty',
  percentage: 25,
  context: 'Les Déferlantes audience interests'
});

CREATE (ai4:AudienceInterest {
  name: 'Gaming',
  percentage: 15,
  context: 'Les Déferlantes audience interests'
});

// -----------------------------------------------------------------------------
// IMPARLABS - Strategic Partner
// -----------------------------------------------------------------------------

CREATE (il:Organization {
  name: 'ImparLabs',
  type: 'AI Agency',
  country: 'Portugal',
  focus: 'AI tools for European SMEs',
  positioning: 'AI-first, human-centered',
  pricing_advantage: 'European SME pricing vs Silicon Valley budgets',
  specialty: 'Event-to-community conversion'
});

// -----------------------------------------------------------------------------
// RELATIONSHIPS
// -----------------------------------------------------------------------------

// HelloJune → Les Déferlantes partnership
MATCH (hj:Organization {name: 'HelloJune'}), (f:Festival {name: 'Les Déferlantes'})
CREATE (hj)-[:TARGETS]->(f);

MATCH (hj:Organization {name: 'HelloJune'}), (f:Festival {name: 'Les Déferlantes'})
CREATE (hj)-[:PROPOSED_FOR]->(f);

// ImparLabs → HelloJune partnership
MATCH (il:Organization {name: 'ImparLabs'}), (hj:Organization {name: 'HelloJune'})
CREATE (il)-[:PARTNERS_WITH]->(hj);

// Sponsors → Les Déferlantes (potential)
MATCH (s:Sponsor), (f:Festival {name: 'Les Déferlantes'})
WHERE s.tier IN [1, 2]
CREATE (s)-[:PROPOSED_FOR]->(f);

// Sponsors → HelloJune (through activation)
MATCH (s:Sponsor {tier: 1}), (hj:Organization {name: 'HelloJune'})
CREATE (s)-[:POTENTIAL_SPONSOR_OF]->(hj);

// Brand Activations → Festivals
MATCH (ba:BrandActivation {festival: 'Coachella'}), (f:Festival {name: 'Coachella'})
CREATE (ba)-[:ACTIVATED_AT]->(f);

MATCH (ba:BrandActivation {festival: 'Lollapalooza'}), (f:Festival {name: 'Lollapalooza'})
CREATE (ba)-[:ACTIVATED_AT]->(f);

// Trends → Gen Z audience
MATCH (t:Trend), (s:Statistic {category: 'Consumer Behavior'})
CREATE (t)-[:REFLECTS]->(s);

// Statistics → Context
MATCH (s:Statistic {context: 'Les Déferlantes'}), (f:Festival {name: 'Les Déferlantes'})
CREATE (s)-[:ABOUT]->(f);

// Activation Concepts → HelloJune
MATCH (ac:ActivationConcept), (hj:Organization {name: 'HelloJune'})
CREATE (ac)-[:PROPOSED_BY]->(hj);

// Activation Concepts → Les Déferlantes
MATCH (ac:ActivationConcept), (f:Festival {name: 'Les Déferlantes'})
CREATE (ac)-[:FOR_FESTIVAL]->(f);

// Audience Interests → Les Déferlantes
MATCH (ai:AudienceInterest), (f:Festival {name: 'Les Déferlantes'})
CREATE (ai)-[:INTEREST_OF_AUDIENCE_AT]->(f);

// HelloJune Insights → HelloJune
MATCH (i:Insight), (hj:Organization {name: 'HelloJune'})
WHERE i.name STARTS WITH 'HelloJune'
CREATE (i)-[:ABOUT]->(hj);

// Connect existing project
MATCH (p:Project {name: 'HelloJune'}), (hj:Organization {name: 'HelloJune'})
CREATE (p)-[:REPRESENTS]->(hj);

MATCH (p:Project {name: 'HelloJune'}), (f:Festival {name: 'Les Déferlantes'})
CREATE (p)-[:TARGETS_FESTIVAL]->(f);

// Connect existing sponsors to new sponsor nodes
MATCH (old:Sponsor), (new:Sponsor)
WHERE old.name = new.name AND id(old) <> id(new)
CREATE (old)-[:SAME_AS]->(new);

// Trends influence festivals
MATCH (t:Trend), (f:Festival)
CREATE (t)-[:INFLUENCES]->(f);

// Statistics inform strategy
MATCH (s:Statistic {category: 'Market'}), (hj:Organization {name: 'HelloJune'})
CREATE (s)-[:INFORMS_STRATEGY_OF]->(hj);

// =============================================================================
// VERIFICATION QUERIES (Run separately to verify import)
// =============================================================================

// Count new nodes by type:
// MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count ORDER BY count DESC;

// Show all festivals:
// MATCH (f:Festival) RETURN f.name, f.attendees, f.women_percentage ORDER BY f.attendees DESC;

// Show all statistics:
// MATCH (s:Statistic) RETURN s.name, s.value, s.unit ORDER BY s.category;

// Show sponsor distribution by tier:
// MATCH (s:Sponsor) RETURN s.tier, count(s) ORDER BY s.tier;

// Show HelloJune ecosystem:
// MATCH (hj:Organization {name: 'HelloJune'})-[r]-(connected) RETURN hj, r, connected;
