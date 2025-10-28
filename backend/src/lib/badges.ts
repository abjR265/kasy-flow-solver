import prisma from './prisma';

// Badge System Functions (adapted from KASY_MVP lines 1076-1199)

// Award a badge to a user (Monthly Reset System)
export async function awardBadge(userId: string, groupId: string, badgeType: string, metadata?: any): Promise<boolean> {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Check if user already has this badge for this group THIS MONTH (avoid duplicates per month)
    const existingBadge = await prisma.badge.findFirst({
      where: {
        userId,
        groupId,
        badgeType,
        month: currentMonth,
        year: currentYear
      }
    });

    if (existingBadge) {
      console.log(`🏅 User ${userId} already has ${badgeType} badge this month in group ${groupId}`);
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
      where: { groupId }
    });

    // Filter expenses by this creditor within last 7 days
    const creditorExpenses = expenses.filter(exp => {
      const expTime = new Date(exp.createdAt).getTime();
      const daysAgo = (now - expTime) / (1000 * 60 * 60 * 24);
      return exp.payerId === creditorId && daysAgo <= 7;
    });

    if (creditorExpenses.length === 0) {
      return false;
    }

    // Calculate total owed to creditor from these expenses
    let totalOwed = 0;
    let totalCollected = 0;

    for (const expense of creditorExpenses) {
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
        expense: { groupId },
        toUserId: creditorId,
        status: 'paid'
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

// Get user's badges for current month
export async function getUserBadges(userId: string, groupId?: string): Promise<any[]> {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const whereClause: any = {
      userId,
      month: currentMonth,
      year: currentYear
    };

    if (groupId) {
      whereClause.groupId = groupId;
    }

    const badges = await prisma.badge.findMany({
      where: whereClause,
      include: {
        group: {
          select: { name: true }
        }
      },
      orderBy: { awardedAt: 'desc' }
    });

    return badges.map(badge => ({
      id: badge.id,
      badgeType: badge.badgeType,
      groupName: badge.group.name,
      awardedAt: badge.awardedAt,
      metadata: badge.metadata
    }));

  } catch (error) {
    console.error('❌ Failed to get user badges:', error);
    return [];
  }
}

// Check and award Pay It Forward badge (pays quickly)
export async function checkPayItForwardBadge(
  groupId: string,
  debtorId: string,
  paymentTimestamp: string,
  expenseTimestamp: string
): Promise<boolean> {
  try {
    const paymentTime = new Date(paymentTimestamp).getTime();
    const expenseTime = new Date(expenseTimestamp).getTime();
    const hoursToPay = (paymentTime - expenseTime) / (1000 * 60 * 60);

    // Award badge if paid within 24 hours
    if (hoursToPay <= 24) {
      const awarded = await awardBadge(debtorId, groupId, 'pay_it_forward', {
        hoursToPay: Math.round(hoursToPay * 10) / 10
      });

      return awarded;
    }

    return false;
  } catch (error) {
    console.error('❌ Failed to check Pay It Forward badge:', error);
    return false;
  }
}

// Check and award Even Steven badge (perfectly balanced payments)
export async function checkEvenStevenBadge(
  groupId: string,
  userId: string
): Promise<boolean> {
  try {
    // Get user's payment history in this group
    const payments = await prisma.payment.findMany({
      where: {
        expense: { groupId },
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        status: 'paid'
      },
      include: {
        expense: true
      }
    });

    // Calculate net balance (should be close to 0 for Even Steven)
    let netBalance = 0;
    for (const payment of payments) {
      if (payment.fromUserId === userId) {
        netBalance -= payment.amountCents;
      } else {
        netBalance += payment.amountCents;
      }
    }

    // Award badge if net balance is within $1
    if (Math.abs(netBalance) <= 100) {
      const awarded = await awardBadge(userId, groupId, 'even_steven', {
        netBalance: netBalance
      });

      return awarded;
    }

    return false;
  } catch (error) {
    console.error('❌ Failed to check Even Steven badge:', error);
    return false;
  }
}
