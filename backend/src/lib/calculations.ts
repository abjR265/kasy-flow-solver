import prisma from './prisma';

export interface Balance {
  userId: string;
  userName: string;
  balance: number; // positive = owed money, negative = owes money
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amountCents: number;
  venmoLink: string;
  paypalLink: string;
  isPaid?: boolean;
}

// Calculate balances from expenses (adapted from KASY_MVP lines 1393-1506)
export async function calculateBalances(groupId: string): Promise<Balance[]> {
  try {
    console.log(`💰 Calculating balances for group: ${groupId}`);

    // Get all expenses for the group
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payer: true
      }
    });

    console.log(`📊 Found ${expenses.length} expenses`);

    const balances: Record<string, Balance> = {};

    for (const expense of expenses) {
      const { amountCents: totalCents, payerId, participants, splitType, splitGroups } = expense;

      if (splitType === 'overlapping' && splitGroups) {
        // Handle overlapping splits
        const splitGroupsData = splitGroups as any[];
        
        for (const group of splitGroupsData) {
          const groupParticipants = group.participants || [];
          const perPersonCents = group.perPersonCents || Math.floor(totalCents / groupParticipants.length);

          for (const participantId of groupParticipants) {
            if (!balances[participantId]) {
              balances[participantId] = {
                userId: participantId,
                userName: participantId, // Will be updated with real names
                balance: 0
              };
            }

            // Each participant owes their share
            balances[participantId].balance -= perPersonCents;
          }
        }

        // Payer gets credited for the full amount
        if (!balances[payerId]) {
          balances[payerId] = {
            userId: payerId,
            userName: expense.payer.displayName,
            balance: 0
          };
        }
        balances[payerId].balance += totalCents;

      } else {
        // Handle simple splits
        const participantCount = participants.length;
        const perPersonCents = Math.floor(totalCents / participantCount);

        for (const participantId of participants) {
          if (!balances[participantId]) {
            balances[participantId] = {
              userId: participantId,
              userName: participantId, // Will be updated with real names
              balance: 0
            };
          }

          // Each participant owes their share
          balances[participantId].balance -= perPersonCents;
        }

        // Payer gets credited for the full amount
        if (!balances[payerId]) {
          balances[payerId] = {
            userId: payerId,
            userName: expense.payer.displayName,
            balance: 0
          };
        }
        balances[payerId].balance += totalCents;
      }
    }

    // Update user names from database
    const userIds = Object.keys(balances);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true }
    });

    const userMap = new Map(users.map((u: any) => [u.id, u.displayName]));
    Object.values(balances).forEach(balance => {
      balance.userName = userMap.get(balance.userId) || balance.userName || '';
    });

    const finalBalances = Object.values(balances).filter(b => Math.abs(b.balance) > 1);
    console.log(`💰 Final balances (filtered > 1 cent): ${finalBalances.length} people`);
    finalBalances.forEach(b => console.log(`  ${b.userName}: ${b.balance} cents`));

    return finalBalances;

  } catch (error) {
    console.error('❌ Failed to calculate balances:', error);
    throw error;
  }
}

// Get paid settlements from database
async function getPaidSettlements(groupId: string): Promise<Set<string>> {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        expense: { groupId },
        status: 'paid'
      }
    });

    const paidSet = new Set<string>();
    for (const payment of payments) {
      // Create unique key: from_to_amount
      const key = `${payment.fromUserId}_${payment.toUserId}_${payment.amountCents}`;
      paidSet.add(key);
    }

    return paidSet;
  } catch (error) {
    console.error('Failed to get paid settlements:', error);
    return new Set();
  }
}

// Enhanced settlement calculation with payment profiles and paid status (adapted from KASY_MVP lines 1573-1624)
export async function calculateSettlements(balances: Balance[], groupId: string): Promise<Settlement[]> {
  // Get already paid settlements
  const paidSettlements = await getPaidSettlements(groupId);

  // Clone balances to avoid modifying the original array
  const creditors = balances.filter(b => b.balance > 0).map(b => ({...b})).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).map(b => ({...b})).sort((a, b) => a.balance - b.balance);

  const settlements: Settlement[] = [];
  let i = 0, j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amountCents = Math.min(creditor.balance, Math.abs(debtor.balance));

    if (amountCents > 1) {
      const amount = amountCents / 100;

      // Check if this settlement is already paid
      const settlementKey = `${debtor.userId}_${creditor.userId}_${amountCents}`;
      const isPaid = paidSettlements.has(settlementKey);

      // Get payment profiles for better links
      const creditorProfile = await prisma.user.findUnique({
        where: { id: creditor.userId },
        select: { venmo: true, paypal: true }
      });

      const debtorProfile = await prisma.user.findUnique({
        where: { id: debtor.userId },
        select: { venmo: true, paypal: true }
      });

      const creditorHandle = creditorProfile?.venmo || creditor.userName.replace(/\s+/g, '');
      const debtorHandle = debtorProfile?.venmo || debtor.userName.replace(/\s+/g, '');

      settlements.push({
        from: debtor.userId,
        fromName: debtor.userName,
        to: creditor.userId,
        toName: creditor.userName,
        amountCents: amountCents,
        venmoLink: `https://venmo.com/${creditorHandle}?txn=pay&amount=${amount}&note=Group%20expense%20settlement`,
        paypalLink: `https://paypal.me/${creditorHandle}/${amount}`,
        isPaid: isPaid
      });
    }

    creditor.balance -= amountCents;
    debtor.balance += amountCents;

    if (creditor.balance <= 1) i++;
    if (Math.abs(debtor.balance) <= 1) j++;
  }

  return settlements;
}

// Format currency
export function formatCurrency(cents: number): string {
  return `$${Math.abs(cents / 100).toFixed(2)}`;
}
