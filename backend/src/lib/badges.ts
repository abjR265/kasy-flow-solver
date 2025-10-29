// EXACT copy of badge logic from KASY_MVP lines 1078-1347
import prisma from './prisma';

// Award a badge to a user (with duplicate prevention per month)
export async function awardBadge(
  userId: string,
  groupId: string,
  badgeType: string,
  metadata?: any
): Promise<boolean> {
  try {
    // Check if user already has this badge this month in this group
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    const existing = await prisma.badge.findFirst({
      where: {
        userId,
        groupId,
        badgeType,
        month: currentMonth,
        year: currentYear
      }
    });
    
    if (existing) {
      console.log(`⏭️ Badge ${badgeType} already awarded to ${userId} this month`);
      return false;
    }
    
    // Award the badge
    await prisma.badge.create({
      data: {
        userId,
        groupId,
        badgeType,
        month: currentMonth,
        year: currentYear,
        metadata: metadata || {},
        awardedAt: now
      }
    });
    
    console.log(`🎉 Badge awarded: ${badgeType} to user ${userId} in group ${groupId} for ${currentYear}-${currentMonth}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to award badge:', error);
    return false;
  }
}

// Check and award Table Hero badge (paid within 24h)
export async function checkTableHeroBadge(
  groupId: string, 
  creditorId: string, 
  debtorId: string, 
  expenseTimestamp: string
): Promise<boolean> {
  try {
    const expenseTime = new Date(expenseTimestamp).getTime();
    const now = Date.now();
    const daysSinceExpense = (now - expenseTime) / (1000 * 60 * 60 * 24);
    
    // PRD: "Table Hero 🏅: payer collects 90% within 7 days"
    // Only check if we're within 7 days of the expense
    if (daysSinceExpense > 7) {
      return false;
    }
    
    // Get all expenses where this creditor paid
    const expenses = await prisma.expense.findMany({
      where: {
        groupId,
        payerId: creditorId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });
    
    if (expenses.length === 0) {
      return false;
    }
    
    // Calculate total owed to creditor from these expenses
    let totalOwed = 0;
    let totalCollected = 0;
    
    for (const expense of expenses) {
      // Calculate how much creditor is owed from this expense
      const expenseTotal = expense.amountCents;
      const participantCount = expense.participants.length;
      const perPerson = Math.floor(expenseTotal / participantCount);
      
      // Amount owed to creditor = total - their share
      const owedToCreditor = expenseTotal - perPerson;
      totalOwed += owedToCreditor;
    }
    
    // Get all payments to this creditor
    const payments = await prisma.payment.findMany({
      where: {
        toUserId: creditorId,
        status: 'paid',
        expense: { groupId }
      }
    });
    
    // Calculate how much has been collected
    for (const payment of payments) {
      totalCollected += payment.amountCents;
    }
    
    // Check if 90% collected
    const collectionRate = totalOwed > 0 ? (totalCollected / totalOwed) : 0;
    
    console.log(`📊 Table Hero check for ${creditorId}: ${Math.round(collectionRate * 100)}% collected (${totalCollected}/${totalOwed} cents)`);
    
    if (collectionRate >= 0.9) {
      const awarded = await awardBadge(creditorId, groupId, 'table_hero', {
        collectionRate: Math.round(collectionRate * 100),
        daysToCollect: Math.round(daysSinceExpense * 10) / 10
      });
      
      return awarded;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to check Table Hero badge:', error);
    return false;
  }
}

// Check and award Pay It Forward badge (3 quick pays in a row)
export async function checkPayItForwardBadge(userId: string, groupId: string): Promise<boolean> {
  try {
    // Get user's recent payment actions from UserStats
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    
    if (userStats && userStats.consecutiveQuickPays >= 3) {
      const awarded = await awardBadge(userId, groupId, 'pay_it_forward', {
        consecutiveQuickPays: userStats.consecutiveQuickPays
      });
      
      return awarded;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to check Pay It Forward badge:', error);
    return false;
  }
}

// Check and award Even Steven badge (100% collection in <3 days)
export async function checkEvenStevenBadge(groupId: string, expenseTimestamp: string): Promise<string[]> {
  try {
    const expenseTime = new Date(expenseTimestamp).getTime();
    const now = Date.now();
    const daysSinceExpense = (now - expenseTime) / (1000 * 60 * 60 * 24);
    
    // PRD: "Even Steven 💫: group hits 100% collection in under 3 days"
    // Only check if we're within 3 days
    if (daysSinceExpense > 3) {
      return [];
    }
    
    // Get all expenses and calculate balances
    const expenses = await prisma.expense.findMany({
      where: { groupId }
    });
    
    // Simple balance calculation (can be enhanced with the full balance calculation logic)
    const balances = new Map<string, number>();
    
    for (const expense of expenses) {
      const { amountCents, payerId, participants } = expense;
      const perPerson = Math.floor(amountCents / participants.length);
      
      // Payer gets credited
      balances.set(payerId, (balances.get(payerId) || 0) + amountCents);
      
      // Participants get debited
      for (const participantId of participants) {
        balances.set(participantId, (balances.get(participantId) || 0) - perPerson);
      }
    }
    
    // Adjust for paid settlements
    const payments = await prisma.payment.findMany({
      where: {
        status: 'paid',
        expense: { groupId }
      }
    });
    
    for (const payment of payments) {
      balances.set(payment.fromUserId, (balances.get(payment.fromUserId) || 0) + payment.amountCents);
      balances.set(payment.toUserId, (balances.get(payment.toUserId) || 0) - payment.amountCents);
    }
    
    // Check if ALL balances are settled (within 1 cent tolerance for rounding)
    const allSettled = Array.from(balances.values()).every(b => Math.abs(b) <= 1);
    
    if (allSettled && daysSinceExpense <= 3) {
      console.log(`💫 Even Steven check: Group fully settled in ${daysSinceExpense.toFixed(1)} days!`);
      
      // Award badge to ALL participants in the group
      const participants = new Set<string>();
      expenses.forEach(exp => {
        exp.participants.forEach(p => participants.add(p));
        participants.add(exp.payerId);
      });
      
      const awardedUsers: string[] = [];
      const participantArray = Array.from(participants);
      
      for (const userId of participantArray) {
        const awarded = await awardBadge(userId, groupId, 'even_steven', {
          daysToSettle: Math.round(daysSinceExpense * 10) / 10,
          groupSize: participants.size
        });
        
        if (awarded) {
          awardedUsers.push(userId);
        }
      }
      
      return awardedUsers;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to check Even Steven badge:', error);
    return [];
  }
}

// Update user stats when they mark payment as paid
export async function updateUserStats(userId: string, wasQuickPay: boolean): Promise<void> {
  try {
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    
    if (!userStats) {
      // Create new stats
      await prisma.userStats.create({
        data: {
          userId,
          paymentsOnTime: wasQuickPay ? 1 : 0,
          consecutiveQuickPays: wasQuickPay ? 1 : 0,
          totalSettled: 0
        }
      });
    } else {
      // Update existing stats
      await prisma.userStats.update({
        where: { userId },
        data: {
          paymentsOnTime: userStats.paymentsOnTime + (wasQuickPay ? 1 : 0),
          consecutiveQuickPays: wasQuickPay ? userStats.consecutiveQuickPays + 1 : 0,
          lastPaymentAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('❌ Failed to update user stats:', error);
  }
}

// Get badges for a user (supports monthly filtering)
export async function getUserBadges(userId: string, groupId?: string, thisMonthOnly?: boolean): Promise<any[]> {
  try {
    const where: any = { userId };
    if (groupId) {
      where.groupId = groupId;
    }
    
    // Filter for this month only
    if (thisMonthOnly) {
      const now = new Date();
      where.month = now.getMonth() + 1;
      where.year = now.getFullYear();
    }
    
    const badges = await prisma.badge.findMany({
      where,
      orderBy: { awardedAt: 'desc' }
    });
    
    return badges;
  } catch (error) {
    console.error('❌ Failed to get user badges:', error);
    return [];
  }
}
