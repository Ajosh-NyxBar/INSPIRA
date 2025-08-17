/**
 * Firebase Quote Service
 * Handles user quotes and social interactions with Firebase
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { UserQuote, QuoteComment, User } from '@/types/phase3';
import { firebaseUserService } from './firebaseUserService';

// Demo mode for development
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

class FirebaseQuoteService {
  private demoQuotes: UserQuote[] = [];

  constructor() {
    if (DEMO_MODE) {
      this.initializeDemoData();
    }
  }

  async createQuote(quoteData: {
    content: string;
    author: string;
    tags: string[];
    isPublic: boolean;
  }): Promise<{ success: boolean; quote?: UserQuote; error?: string }> {
    const currentUser = firebaseUserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Anda harus login untuk membuat quote' };
    }

    if (DEMO_MODE) {
      return this.demoCreateQuote(quoteData, currentUser);
    }

    try {
      const quoteRef = doc(collection(db, 'quotes'));
      const newQuote: UserQuote = {
        id: quoteRef.id,
        content: quoteData.content.trim(),
        author: quoteData.author.trim() || currentUser.displayName,
        userId: currentUser.id,
        username: currentUser.username,
        tags: quoteData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: quoteData.isPublic,
        likes: [],
        comments: [],
        shares: 0,
        reports: 0,
        status: 'active'
      };

      await setDoc(quoteRef, {
        ...newQuote,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserStats(currentUser.id, { quotesShared: increment(1) });

      return { success: true, quote: newQuote };
    } catch (error) {
      console.error('Failed to create quote:', error);
      return { success: false, error: 'Gagal membuat quote' };
    }
  }

  async getPublicQuotes(): Promise<UserQuote[]> {
    if (DEMO_MODE) {
      return this.demoQuotes.filter(q => q.isPublic);
    }

    try {
      const q = query(
        collection(db, 'quotes'),
        where('isPublic', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as UserQuote[];
    } catch (error) {
      console.error('Failed to get public quotes:', error);
      return [];
    }
  }

  async getTrendingQuotes(): Promise<UserQuote[]> {
    if (DEMO_MODE) {
      return this.demoQuotes
        .filter(q => q.isPublic)
        .sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length))
        .slice(0, 20);
    }

    try {
      const q = query(
        collection(db, 'quotes'),
        where('isPublic', '==', true),
        where('status', '==', 'active'),
        orderBy('likes', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as UserQuote[];
    } catch (error) {
      console.error('Failed to get trending quotes:', error);
      return [];
    }
  }

  async getUserQuotes(userId: string, includePrivate: boolean = false): Promise<UserQuote[]> {
    if (DEMO_MODE) {
      return this.demoQuotes.filter(q => q.userId === userId && (includePrivate || q.isPublic));
    }

    try {
      let constraints = [
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      ];

      // If not including private, filter by public only
      if (!includePrivate) {
        constraints.splice(2, 0, where('isPublic', '==', true));
      }

      const q = query(collection(db, 'quotes'), ...constraints);

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as UserQuote[];
    } catch (error) {
      console.error('Failed to get user quotes:', error);
      return [];
    }
  }

  async getQuoteById(quoteId: string): Promise<UserQuote | null> {
    if (DEMO_MODE) {
      return this.demoQuotes.find(q => q.id === quoteId) || null;
    }

    try {
      const quoteDoc = await getDoc(doc(db, 'quotes', quoteId));
      return quoteDoc.exists() ? { ...quoteDoc.data(), id: quoteDoc.id } as UserQuote : null;
    } catch (error) {
      console.error('Failed to get quote:', error);
      return null;
    }
  }

  async toggleLike(quoteId: string): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
    const currentUser = firebaseUserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, isLiked: false, error: 'Anda harus login' };
    }

    if (DEMO_MODE) {
      return this.demoToggleLike(quoteId, currentUser.id);
    }

    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        return { success: false, isLiked: false, error: 'Quote tidak ditemukan' };
      }

      const quote = quoteDoc.data() as UserQuote;
      const isLiked = quote.likes.includes(currentUser.id);

      if (isLiked) {
        await updateDoc(quoteRef, {
          likes: arrayRemove(currentUser.id)
        });
      } else {
        await updateDoc(quoteRef, {
          likes: arrayUnion(currentUser.id)
        });

        // Create notification for quote author
        if (quote.userId !== currentUser.id) {
          await firebaseUserService.createNotification({
            userId: quote.userId,
            type: 'like',
            title: 'Quote Disukai',
            message: `${currentUser.displayName} menyukai quote Anda`,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }

      return { success: true, isLiked: !isLiked };
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return { success: false, isLiked: false, error: 'Gagal memproses like' };
    }
  }

  async addComment(quoteId: string, content: string): Promise<{ success: boolean; comment?: QuoteComment; error?: string }> {
    const currentUser = firebaseUserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Anda harus login' };
    }

    if (DEMO_MODE) {
      return this.demoAddComment(quoteId, content, currentUser);
    }

    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        return { success: false, error: 'Quote tidak ditemukan' };
      }

      const newComment: QuoteComment = {
        id: Date.now().toString(),
        quoteId,
        userId: currentUser.id,
        username: currentUser.username,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
      };

      await updateDoc(quoteRef, {
        comments: arrayUnion(newComment)
      });

      // Create notification for quote author
      const quote = quoteDoc.data() as UserQuote;
      if (quote.userId !== currentUser.id) {
        await firebaseUserService.createNotification({
          userId: quote.userId,
          type: 'comment',
          title: 'Komentar Baru',
          message: `${currentUser.displayName} mengomentari quote Anda`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      return { success: true, comment: newComment };
    } catch (error) {
      console.error('Failed to add comment:', error);
      return { success: false, error: 'Gagal menambahkan komentar' };
    }
  }

  async deleteQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = firebaseUserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Anda harus login' };
    }

    if (DEMO_MODE) {
      this.demoQuotes = this.demoQuotes.filter(q => q.id !== quoteId || q.userId !== currentUser.id);
      return { success: true };
    }

    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (!quoteDoc.exists()) {
        return { success: false, error: 'Quote tidak ditemukan' };
      }

      const quote = quoteDoc.data() as UserQuote;
      if (quote.userId !== currentUser.id) {
        return { success: false, error: 'Anda tidak memiliki izin untuk menghapus quote ini' };
      }

      await updateDoc(quoteRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserStats(currentUser.id, { quotesShared: increment(-1) });

      return { success: true };
    } catch (error) {
      console.error('Failed to delete quote:', error);
      return { success: false, error: 'Gagal menghapus quote' };
    }
  }

  private async updateUserStats(userId: string, updates: any): Promise<void> {
    if (DEMO_MODE) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        [`stats.${Object.keys(updates)[0]}`]: Object.values(updates)[0]
      });
    } catch (error) {
      console.error('Failed to update user stats:', error);
    }
  }

  // Demo methods for development
  private initializeDemoData(): void {
    this.demoQuotes = [
      {
        id: 'demo_1',
        content: 'Hidup ini seperti kopi, pahit di awal tapi nikmat di akhir.',
        author: 'Demo User',
        userId: 'demo_user_1',
        username: 'demo',
        tags: ['motivasi', 'hidup'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        isPublic: true,
        likes: ['demo_user_2', 'demo_user_3'],
        comments: [
          {
            id: 'comment_1',
            quoteId: 'demo_1',
            userId: 'demo_user_2',
            username: 'user2',
            content: 'Quote yang sangat menginspirasi!',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likes: [],
            replies: []
          }
        ],
        shares: 3,
        reports: 0,
        status: 'active'
      },
      {
        id: 'demo_2',
        content: 'Jangan pernah menyerah pada mimpi, karena mimpi adalah jembatan menuju kesuksesan.',
        author: 'Inspirator',
        userId: 'demo_user_2',
        username: 'inspirator',
        tags: ['mimpi', 'sukses'],
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        isPublic: true,
        likes: ['demo_user_1'],
        comments: [],
        shares: 1,
        reports: 0,
        status: 'active'
      }
    ];
  }

  private demoCreateQuote(quoteData: any, user: User): { success: boolean; quote?: UserQuote; error?: string } {
    const newQuote: UserQuote = {
      id: 'demo_' + Date.now(),
      content: quoteData.content.trim(),
      author: quoteData.author.trim() || user.displayName,
      userId: user.id,
      username: user.username,
      tags: quoteData.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: quoteData.isPublic,
      likes: [],
      comments: [],
      shares: 0,
      reports: 0,
      status: 'active'
    };

    this.demoQuotes.unshift(newQuote);
    return { success: true, quote: newQuote };
  }

  private demoToggleLike(quoteId: string, userId: string): { success: boolean; isLiked: boolean; error?: string } {
    const quoteIndex = this.demoQuotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) {
      return { success: false, isLiked: false, error: 'Quote tidak ditemukan' };
    }

    const quote = this.demoQuotes[quoteIndex];
    const isLiked = quote.likes.includes(userId);

    if (isLiked) {
      quote.likes = quote.likes.filter(id => id !== userId);
    } else {
      quote.likes.push(userId);
    }

    return { success: true, isLiked: !isLiked };
  }

  private demoAddComment(quoteId: string, content: string, user: User): { success: boolean; comment?: QuoteComment; error?: string } {
    const quoteIndex = this.demoQuotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) {
      return { success: false, error: 'Quote tidak ditemukan' };
    }

    const newComment: QuoteComment = {
      id: 'comment_' + Date.now(),
      quoteId,
      userId: user.id,
      username: user.username,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };

    this.demoQuotes[quoteIndex].comments.push(newComment);
    return { success: true, comment: newComment };
  }
}

export const firebaseQuoteService = new FirebaseQuoteService();
export default firebaseQuoteService;
