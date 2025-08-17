/**
 * AI Service - Phase 5
 * Advanced AI features including semantic search, sentiment analysis, and content generation
 * Date: August 17, 2025
 */

import {
  AISearchQuery,
  AISearchResult,
  SentimentAnalysis,
  AIContentGenerator,
  GeneratedContent,
  PredictiveRecommendation,
  AIService as IAIService
} from '../types/phase5';

class AIService implements IAIService {
  private static instance: AIService;
  private storageKey = 'inspira_ai_data';
  private apiEndpoint = 'https://api.openai.com/v1'; // Mock endpoint

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ==================== SEMANTIC SEARCH ====================

  async searchQuotes(query: AISearchQuery): Promise<AISearchResult[]> {
    try {
      // Mock semantic search implementation
      const quotes = this.getMockQuotes();
      const results: AISearchResult[] = [];

      for (const quote of quotes) {
        const relevanceScore = this.calculateRelevance(query.query, quote.text, quote.author);
        const sentiment = await this.analyzeSentiment(quote.text);
        
        if (relevanceScore > 0.3) { // Threshold for relevance
          const keywords = this.extractKeywords(quote.text);
          
          results.push({
            quote,
            relevanceScore,
            sentiment: {
              score: sentiment.sentiment.score,
              label: sentiment.sentiment.overall,
              confidence: sentiment.sentiment.confidence
            },
            keywords,
            explanation: this.generateExplanation(query.query, quote.text, relevanceScore)
          });
        }
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Apply filters
      const filteredResults = this.applyFilters(results, query.filters);
      
      // Store search query for analytics
      this.storeSearchQuery(query, filteredResults);
      
      return filteredResults.slice(0, 20); // Return top 20 results
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new AIError('AI search failed', { code: 'AI_SERVICE_UNAVAILABLE', details: { query } });
    }
  }

  private calculateRelevance(searchQuery: string, quoteText: string, author: string): number {
    const queryWords = searchQuery.toLowerCase().split(' ');
    const quoteWords = quoteText.toLowerCase().split(' ');
    const authorWords = author.toLowerCase().split(' ');
    
    let score = 0;
    let totalWords = queryWords.length;
    
    for (const queryWord of queryWords) {
      // Exact matches in quote text
      if (quoteWords.some(word => word.includes(queryWord))) {
        score += 0.8;
      }
      
      // Exact matches in author
      if (authorWords.some(word => word.includes(queryWord))) {
        score += 0.6;
      }
      
      // Semantic similarity (simplified)
      score += this.calculateSemanticSimilarity(queryWord, quoteWords);
    }
    
    return Math.min(score / totalWords, 1.0);
  }

  private calculateSemanticSimilarity(word: string, targetWords: string[]): number {
    // Simplified semantic similarity using word associations
    const semanticGroups = {
      motivation: ['success', 'achieve', 'goal', 'dream', 'ambition', 'determination'],
      happiness: ['joy', 'smile', 'positive', 'cheerful', 'delight', 'bliss'],
      wisdom: ['knowledge', 'learn', 'understand', 'insight', 'truth', 'enlighten'],
      love: ['heart', 'care', 'affection', 'compassion', 'kindness', 'romance'],
      courage: ['brave', 'strength', 'fearless', 'bold', 'confident', 'hero']
    };
    
    for (const [category, words] of Object.entries(semanticGroups)) {
      if (words.includes(word)) {
        for (const targetWord of targetWords) {
          if (words.includes(targetWord)) {
            return 0.4; // Semantic match bonus
          }
        }
      }
    }
    
    return 0;
  }

  private applyFilters(results: AISearchResult[], filters: AISearchQuery['filters']): AISearchResult[] {
    let filteredResults = results;
    
    if (filters.sentiment) {
      filteredResults = filteredResults.filter(result => 
        result.sentiment.label === filters.sentiment
      );
    }
    
    if (filters.category && filters.category.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.category!.includes(result.quote.category)
      );
    }
    
    if (filters.author && filters.author.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.author!.some(author => 
          result.quote.author.toLowerCase().includes(author.toLowerCase())
        )
      );
    }
    
    return filteredResults;
  }

  // ==================== SENTIMENT ANALYSIS ====================

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      // Mock sentiment analysis implementation
      const words = text.toLowerCase().split(' ');
      
      // Sentiment word dictionaries
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'beautiful', 'love', 'success', 'happy', 'joy', 'hope', 'dream', 'achieve', 'inspire'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'fear', 'anger', 'fail', 'difficult', 'problem', 'worry', 'stress'];
      
      let positiveScore = 0;
      let negativeScore = 0;
      let keywordSentiments: Array<{ word: string; sentiment: number; importance: number }> = [];
      
      for (const word of words) {
        let sentiment = 0;
        let importance = 0;
        
        if (positiveWords.includes(word)) {
          sentiment = 0.8;
          positiveScore++;
          importance = 0.7;
        } else if (negativeWords.includes(word)) {
          sentiment = -0.8;
          negativeScore++;
          importance = 0.7;
        }
        
        if (sentiment !== 0) {
          keywordSentiments.push({ word, sentiment, importance });
        }
      }
      
      const totalWords = words.length;
      const overallScore = (positiveScore - negativeScore) / Math.max(totalWords, 1);
      const normalizedScore = Math.max(-1, Math.min(1, overallScore * 3)); // Normalize to -1 to 1
      
      let overallSentiment: 'positive' | 'negative' | 'neutral';
      if (normalizedScore > 0.1) {
        overallSentiment = 'positive';
      } else if (normalizedScore < -0.1) {
        overallSentiment = 'negative';
      } else {
        overallSentiment = 'neutral';
      }
      
      const confidence = Math.abs(normalizedScore);
      
      // Generate emotion scores (simplified)
      const emotions = {
        joy: Math.max(0, normalizedScore) * 0.8,
        sadness: Math.max(0, -normalizedScore) * 0.6,
        anger: Math.max(0, -normalizedScore) * 0.4,
        fear: Math.max(0, -normalizedScore) * 0.3,
        surprise: Math.random() * 0.3,
        trust: Math.max(0, normalizedScore) * 0.7
      };
      
      const suggestions = this.generateSentimentSuggestions(overallSentiment, normalizedScore);
      
      return {
        text,
        sentiment: {
          overall: overallSentiment,
          score: normalizedScore,
          confidence
        },
        emotions,
        keywords: keywordSentiments,
        suggestions
      };
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      throw new AIError('Sentiment analysis failed', { code: 'AI_SERVICE_UNAVAILABLE', details: { text } });
    }
  }

  private generateSentimentSuggestions(sentiment: string, score: number): string[] {
    const suggestions: string[] = [];
    
    if (sentiment === 'positive') {
      suggestions.push('Quote ini memiliki energi positif yang kuat');
      suggestions.push('Cocok untuk motivasi dan inspirasi harian');
      suggestions.push('Bagikan untuk menyebarkan energi positif');
    } else if (sentiment === 'negative') {
      suggestions.push('Quote ini mengandung refleksi mendalam');
      suggestions.push('Bisa membantu dalam proses introspeksi');
      suggestions.push('Seimbangkan dengan quote yang lebih optimis');
    } else {
      suggestions.push('Quote ini memiliki tone netral dan seimbang');
      suggestions.push('Cocok untuk kontemplasi dan pemikiran');
      suggestions.push('Dapat diterima oleh berbagai audiens');
    }
    
    return suggestions;
  }

  // ==================== CONTENT GENERATION ====================

  async generateContent(config: AIContentGenerator): Promise<GeneratedContent> {
    try {
      // Mock content generation
      const generatedText = await this.mockContentGeneration(config);
      
      const content: GeneratedContent = {
        id: this.generateId(),
        content: generatedText,
        type: config.type,
        metadata: {
          prompt: config.prompt,
          style: config.style,
          tone: config.tone,
          generatedAt: new Date().toISOString(),
          userId: 'current_user', // Should be passed from context
          aiModel: 'InspiraAI-v1',
          confidence: 0.85
        }
      };
      
      // Store generated content
      this.storeGeneratedContent(content);
      
      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new AIError('Content generation failed', { code: 'AI_SERVICE_UNAVAILABLE', details: { config } });
    }
  }

  private async mockContentGeneration(config: AIContentGenerator): Promise<string> {
    // Mock delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const templates: Record<string, Record<string, string[]>> = {
      quote: {
        inspirational: [
          "Setiap langkah kecil hari ini adalah fondasi kesuksesan masa depan.",
          "Percayalah pada prosesnya, karena perjalanan terbaik dimulai dari satu langkah berani.",
          "Kekuatan sejati terletak pada kemampuan bangkit setelah jatuh."
        ],
        motivational: [
          "Jangan tunggu kesempatan sempurna, ciptakan kesempatan dari apa yang ada.",
          "Kegagalan hanyalah batu loncatan menuju kesuksesan yang lebih besar.",
          "Mimpi tanpa tindakan hanyalah angan-angan, tindakan tanpa mimpi hanyalah kesia-siaan."
        ],
        philosophical: [
          "Hidup bukan tentang menemukan diri sendiri, tetapi menciptakan diri sendiri.",
          "Kebijaksanaan sejati adalah mengetahui batas-batas ketidaktahuan kita.",
          "Kebahagiaan bukanlah tujuan, melainkan cara menjalani hidup."
        ]
      },
      affirmation: {
        inspirational: [
          "Saya memiliki kekuatan untuk mengubah hidup saya menjadi lebih baik setiap hari.",
          "Saya layak mendapatkan kebahagiaan dan kesuksesan dalam hidup.",
          "Saya percaya pada kemampuan diri dan terus berkembang setiap hari."
        ]
      },
      reflection: {
        inspirational: [
          "Merefleksikan hari ini membantu saya memahami perjalanan hidup yang lebih baik.",
          "Setiap pengalaman mengajarkan sesuatu yang berharga untuk masa depan.",
          "Refleksi adalah jembatan antara pengalaman dan kebijaksanaan."
        ]
      },
      goal: {
        inspirational: [
          "Tujuan yang jelas adalah kompas yang mengarahkan setiap langkah saya.",
          "Setiap hari saya semakin dekat dengan impian yang ingin saya capai.",
          "Tujuan bukan hanya mimpi, tetapi rencana yang akan saya wujudkan."
        ]
      }
    };
    
    const categoryTemplates = templates[config.type] || templates.quote;
    const styleTemplates = categoryTemplates[config.style] || categoryTemplates.inspirational;
    
    // Select random template and customize based on prompt
    const baseTemplate = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
    
    // Simple customization based on prompt keywords
    let customizedContent = baseTemplate;
    const promptKeywords = config.prompt.toLowerCase().split(' ');
    
    // Replace generic terms with prompt-specific terms
    for (const keyword of promptKeywords) {
      if (keyword.length > 3) {
        customizedContent = customizedContent.replace(/kesuksesan/gi, keyword);
        break;
      }
    }
    
    return customizedContent;
  }

  // ==================== PREDICTIVE RECOMMENDATIONS ====================

  async predictRecommendations(userId: string): Promise<PredictiveRecommendation[]> {
    try {
      // Mock predictive recommendations based on user behavior
      const userBehavior = await this.getUserBehaviorData(userId);
      const recommendations: PredictiveRecommendation[] = [];
      
      // Generate category recommendations
      if (userBehavior.favoriteCategories.length > 0) {
        recommendations.push({
          id: this.generateId(),
          type: 'category',
          content: {
            category: this.predictNextCategory(userBehavior.favoriteCategories),
            reason: 'Berdasarkan pola bacaan Anda'
          },
          confidence: 0.8,
          reasoning: 'Analisis pola bacaan menunjukkan minat pada kategori ini',
          triggers: ['category_pattern', 'reading_time'],
          predictedEngagement: 0.75,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          userId
        });
      }
      
      // Generate quote recommendations
      recommendations.push({
        id: this.generateId(),
        type: 'quote',
        content: {
          quoteId: 'predicted_quote_1',
          reason: 'Quote ini sesuai dengan mood dan aktivitas Anda saat ini'
        },
        confidence: 0.7,
        reasoning: 'Berdasarkan waktu akses dan preferensi konten',
        triggers: ['time_pattern', 'mood_analysis'],
        predictedEngagement: 0.8,
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        userId
      });
      
      // Generate activity recommendations
      const currentHour = new Date().getHours();
      if (currentHour >= 18) {
        recommendations.push({
          id: this.generateId(),
          type: 'activity',
          content: {
            activity: 'evening_reflection',
            suggestion: 'Waktu yang tepat untuk refleksi dan quote inspiratif'
          },
          confidence: 0.9,
          reasoning: 'Pola aktivitas menunjukkan ini adalah waktu optimal untuk refleksi',
          triggers: ['time_of_day', 'usage_pattern'],
          predictedEngagement: 0.85,
          validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          userId
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating predictive recommendations:', error);
      throw new AIError('Predictive recommendations failed', { code: 'AI_SERVICE_UNAVAILABLE', details: { userId } });
    }
  }

  // ==================== NATURAL LANGUAGE PROCESSING ====================

  async processNaturalLanguage(query: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
  }> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Intent classification
      let intent = 'search';
      let confidence = 0.5;
      
      if (lowerQuery.includes('buat') || lowerQuery.includes('generate') || lowerQuery.includes('buatkan')) {
        intent = 'generate';
        confidence = 0.8;
      } else if (lowerQuery.includes('cari') || lowerQuery.includes('find') || lowerQuery.includes('search')) {
        intent = 'search';
        confidence = 0.9;
      } else if (lowerQuery.includes('analisis') || lowerQuery.includes('analyze')) {
        intent = 'analyze';
        confidence = 0.8;
      } else if (lowerQuery.includes('rekomendasi') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
        intent = 'recommend';
        confidence = 0.85;
      }
      
      // Entity extraction
      const entities: Record<string, any> = {};
      
      // Extract categories
      const categories = ['motivasi', 'cinta', 'hidup', 'sukses', 'kebahagiaan', 'wisdom', 'friendship'];
      for (const category of categories) {
        if (lowerQuery.includes(category)) {
          entities.category = category;
        }
      }
      
      // Extract sentiment
      if (lowerQuery.includes('positif') || lowerQuery.includes('positive')) {
        entities.sentiment = 'positive';
      } else if (lowerQuery.includes('negatif') || lowerQuery.includes('negative')) {
        entities.sentiment = 'negative';
      }
      
      // Extract author mentions
      const authorPattern = /(dari|by|author)\s+([a-zA-Z\s]+)/i;
      const authorMatch = query.match(authorPattern);
      if (authorMatch) {
        entities.author = authorMatch[2].trim();
      }
      
      return { intent, entities, confidence };
    } catch (error) {
      console.error('Error processing natural language:', error);
      throw new AIError('NLP processing failed', { code: 'AI_SERVICE_UNAVAILABLE', details: { query } });
    }
  }

  // ==================== HELPER METHODS ====================

  private getMockQuotes() {
    return [
      {
        id: '1',
        text: 'Kebahagiaan bukanlah sesuatu yang sudah jadi. Kebahagiaan berasal dari tindakan Anda sendiri.',
        author: 'Dalai Lama',
        category: 'kebahagiaan'
      },
      {
        id: '2',
        text: 'Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.',
        author: 'Peter Drucker',
        category: 'motivasi'
      },
      {
        id: '3',
        text: 'Hidup adalah 10% apa yang terjadi pada Anda dan 90% bagaimana Anda meresponnya.',
        author: 'Charles R. Swindoll',
        category: 'hidup'
      },
      {
        id: '4',
        text: 'Jangan takut gagal. Takutlah tidak mencoba.',
        author: 'Unknown',
        category: 'motivasi'
      },
      {
        id: '5',
        text: 'Cinta sejati dimulai ketika Anda tidak mengharapkan balasan.',
        author: 'Antoine de Saint-Exupéry',
        category: 'cinta'
      }
    ];
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(' ');
    const stopWords = ['adalah', 'dengan', 'untuk', 'dari', 'yang', 'dan', 'atau', 'ini', 'itu', 'di', 'ke', 'pada'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 5);
  }

  private generateExplanation(query: string, quoteText: string, relevanceScore: number): string {
    if (relevanceScore > 0.8) {
      return `Quote ini sangat relevan dengan pencarian "${query}" karena mengandung konsep yang sama.`;
    } else if (relevanceScore > 0.5) {
      return `Quote ini cukup relevan dengan "${query}" dan memiliki makna yang terkait.`;
    } else {
      return `Quote ini memiliki keterkaitan dengan "${query}" dalam konteks yang lebih luas.`;
    }
  }

  private async getUserBehaviorData(userId: string): Promise<any> {
    // Mock user behavior data
    return {
      favoriteCategories: ['motivasi', 'hidup'],
      readingTimes: ['09:00', '18:00'],
      preferredAuthors: ['Dalai Lama', 'Unknown'],
      averageSessionDuration: 15 // minutes
    };
  }

  private predictNextCategory(favoriteCategories: string[]): string {
    const relatedCategories: Record<string, string[]> = {
      'motivasi': ['sukses', 'hidup', 'wisdom'],
      'hidup': ['kebahagiaan', 'wisdom', 'cinta'],
      'cinta': ['kebahagiaan', 'friendship', 'hidup'],
      'kebahagiaan': ['cinta', 'hidup', 'motivasi']
    };
    
    for (const category of favoriteCategories) {
      const related = relatedCategories[category];
      if (related) {
        return related[Math.floor(Math.random() * related.length)];
      }
    }
    
    return 'wisdom';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private storeSearchQuery(query: AISearchQuery, results: AISearchResult[]): void {
    if (typeof window === 'undefined') return;
    
    const data = this.getStoredData();
    if (!data.searchHistory) data.searchHistory = [];
    
    data.searchHistory.push({
      ...query,
      results: results.slice(0, 5), // Store only top 5 results
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 searches
    if (data.searchHistory.length > 50) {
      data.searchHistory = data.searchHistory.slice(-50);
    }
    
    this.saveStoredData(data);
  }

  private storeGeneratedContent(content: GeneratedContent): void {
    if (typeof window === 'undefined') return;
    
    const data = this.getStoredData();
    if (!data.generatedContent) data.generatedContent = [];
    
    data.generatedContent.push(content);
    
    // Keep only last 100 generated contents
    if (data.generatedContent.length > 100) {
      data.generatedContent = data.generatedContent.slice(-100);
    }
    
    this.saveStoredData(data);
  }

  private getStoredData(): any {
    if (typeof window === 'undefined') return {};
    
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading AI data:', error);
      return {};
    }
  }

  private saveStoredData(data: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving AI data:', error);
    }
  }

  // ==================== PUBLIC API METHODS ====================

  async getSearchHistory(userId: string): Promise<AISearchQuery[]> {
    const data = this.getStoredData();
    return data.searchHistory?.filter((query: any) => query.userId === userId) || [];
  }

  async getGeneratedContentHistory(userId: string): Promise<GeneratedContent[]> {
    const data = this.getStoredData();
    return data.generatedContent?.filter((content: any) => content.metadata.userId === userId) || [];
  }

  async clearAIData(userId: string): Promise<void> {
    const data = this.getStoredData();
    
    if (data.searchHistory) {
      data.searchHistory = data.searchHistory.filter((query: any) => query.userId !== userId);
    }
    
    if (data.generatedContent) {
      data.generatedContent = data.generatedContent.filter((content: any) => content.metadata.userId !== userId);
    }
    
    this.saveStoredData(data);
  }
}

// Custom error class
class AIError extends Error implements AIError {
  code: 'AI_SERVICE_UNAVAILABLE' | 'INVALID_QUERY' | 'RATE_LIMIT_EXCEEDED' | 'CONTENT_FILTERED';
  retryAfter?: number;
  details: Record<string, any>;

  constructor(message: string, options: { code: AIError['code']; retryAfter?: number; details: Record<string, any> }) {
    super(message);
    this.name = 'AIError';
    this.code = options.code;
    this.retryAfter = options.retryAfter;
    this.details = options.details;
  }
}

export default AIService;
