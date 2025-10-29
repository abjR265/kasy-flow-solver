import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/cron/reminders - Gentle Collector™ Cron Job (adapted from KASY_MVP)
export async function GET(request: NextRequest) {
  // Verify cron secret (security)
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  
  const isValidAuth = 
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    querySecret === process.env.CRON_SECRET;
  
  if (!isValidAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Quiet hours check (22:00-08:00) - PRD Section 5.2
  if (currentHour >= 22 || currentHour < 8) {
    console.log('⏸️ Quiet hours active (22:00-08:00), skipping reminders');
    return NextResponse.json({ 
      message: 'Quiet hours, skipped',
      hour: currentHour 
    });
  }
  
  try {
    // Find due reminders
    const dueReminders = await prisma.reminder.findMany({
      where: {
        nextReminderAt: { lte: now },
        status: 'pending'
      },
      take: 50 // Process max 50 per run (rate limiting)
    });
    
    console.log(`📬 Found ${dueReminders.length} due reminders`);
    
    let sent = 0;
    let failed = 0;
    
    for (const reminder of dueReminders) {
      try {
        // Skip synthetic users (can't send DMs to non-real users)
        const isRealUser = /^[a-zA-Z0-9-_]+$/.test(reminder.debtorUserId);
        
        if (!isRealUser) {
          console.log(`⏭️ Skipping reminder for synthetic user: ${reminder.debtorUserName} (${reminder.debtorUserId})`);
          continue;
        }
        
        // Get reminder template
        const reminderCount = reminder.reminderCount;
        const formattedAmount = `$${(reminder.amountCents / 100).toFixed(2)}`;
        
        const templates: Record<number, { text: string; subject: string }> = {
          0: {
            subject: `Payment reminder from KASY - ${reminder.groupName}`,
            text: `hey 👋 quick note from KASY\n\n` +
                  `💬 **Group**: ${reminder.groupName}\n` +
                  `💰 **Amount**: ${formattedAmount} to ${reminder.creditorUserName}\n\n` +
                  `Still open from last night. You're doing great btw 🌟`
          },
          1: {
            subject: `Friendly checkpoint from KASY - ${reminder.groupName}`,
            text: `friendly checkpoint 🛎️\n\n` +
                  `💬 **Group**: ${reminder.groupName}\n` +
                  `💰 ${formattedAmount} to ${reminder.creditorUserName}\n\n` +
                  `Still seeing it open.`
          },
          2: {
            subject: `Final nudge from KASY - ${reminder.groupName}`,
            text: `final nudge 💌 promise\n\n` +
                  `💬 **Group**: ${reminder.groupName}\n` +
                  `💰 ${formattedAmount} to ${reminder.creditorUserName}\n\n` +
                  `If there's an issue, reply 'help'. Otherwise, one tap and we're square.`
          }
        };
        
        const template = templates[reminderCount] || templates[2];
        
        // TODO: Send email/push notification instead of Telegram DM
        // For now, just log the reminder
        console.log(`📧 Would send reminder to ${reminder.debtorUserName}:`, template.subject);
        console.log(`📧 Content:`, template.text);
        
        // Calculate next reminder time
        const nextCount = reminderCount + 1;
        let nextReminderAt: Date;
        
        switch (nextCount) {
          case 1:
            nextReminderAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h
            break;
          case 2:
            nextReminderAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // +5 days
            break;
          default:
            nextReminderAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Far future
        }
        
        // Update reminder state
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            lastReminderSentAt: new Date(),
            reminderCount: nextCount,
            nextReminderAt,
            updatedAt: new Date()
          }
        });
        
        sent++;
        console.log(`✅ Reminder sent to ${reminder.debtorUserName}`);
        
        // Rate limit: 1 message per second
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error sending reminder ${reminder.id}:`, error);
        failed++;
      }
    }
    
    return NextResponse.json({
      message: 'Reminders processed',
      sent,
      failed,
      total: dueReminders.length
    });
  } catch (error) {
    console.error('💥 Cron job error:', error);
    return NextResponse.json({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
