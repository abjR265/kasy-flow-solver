import { useState, useEffect } from "react";
import { Send, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/stores/useStore";
import { parseNaturalLanguage } from "@/lib/api/nlp";
import { extractReceiptData } from "@/lib/api/ocr";
import { createExpense } from "@/lib/api/backend";
import { ChatMessage } from "@/types";
import { ExpenseCard } from "@/components/ExpenseCard";
import { toast } from "sonner";

export default function Dashboard() {
  // VERSION: 2024-10-29-fix-v5 - Force cache bust
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [realExpenses, setRealExpenses] = useState<any[]>([]);
  const [showRealData, setShowRealData] = useState(true);
  const [pendingOCR, setPendingOCR] = useState<{
    merchant: string;
    totalCents: number;
    confidence: number;
    timestamp: number;
  } | null>(null);
  
  const chatMessages = useStore((state) => state.chatMessages);
  const addChatMessage = useStore((state) => state.addChatMessage);
  const addExpense = useStore((state) => state.addExpense);
  const expenses = useStore((state) => state.expenses);
  const currentUser = useStore((state) => state.currentUser);

  // Fetch real expenses on mount
  useEffect(() => {
    if (showRealData) {
      fetchRealExpenses();
    }
  }, [showRealData]);

  const fetchRealExpenses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/expenses?groupId=group-1`);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Raw backend response:', data);
        
        if (data.success && Array.isArray(data.expenses)) {
          console.log('📋 Number of expenses:', data.expenses.length);
          
          // Transform backend expenses to match frontend Expense type
          // Filter out any null/undefined expenses first
          const transformedExpenses = data.expenses
            .filter((exp: any) => {
              if (!exp || typeof exp !== 'object') {
                console.warn('⚠️ Skipping invalid expense:', exp);
                return false;
              }
              return true;
            })
            .map((exp: any) => {
              try {
                console.log('🔄 Transforming expense:', exp.id);
                
                // Get participant info - ExpenseCard expects objects with id, displayName, avatarUrl
                const participantObjects = Array.isArray(exp.participants) 
                  ? exp.participants
                      .filter((userId: any) => userId && typeof userId === 'string')
                      .map((userId: string) => {
                        const name = exp.participantNames?.[userId] || userId;
                        const displayName = (typeof name === 'string' && name.startsWith('@')) ? name.slice(1) : String(name);
                        return {
                          id: userId,
                          handle: `@${displayName}`,
                          displayName: displayName || 'User',
                          avatarUrl: ''
                        };
                      }) 
                  : [];
                
                // Safe payer info extraction - ExpenseCard expects object with displayName
                const payerUsername = exp.payer?.username || exp.payer?.displayName || 'User';
                const payerDisplayName = (typeof payerUsername === 'string' && payerUsername.startsWith('@')) 
                  ? payerUsername.slice(1) 
                  : String(payerUsername);
                const payerHandle = `@${payerDisplayName}`;
                
                return {
                  id: exp.id || `exp-${Date.now()}`,
                  groupId: exp.groupId || 'default',
                  merchant: exp.merchant || 'Unknown',
                  description: exp.description || 'Expense',
                  amountCents: exp.amountCents || 0,
                  currency: exp.currency || 'USD',
                  payer: { 
                    id: exp.payerId || 'unknown', 
                    handle: payerHandle, 
                    displayName: payerDisplayName || 'User', // Always a string!
                    avatarUrl: exp.payer?.avatarUrl || '' 
                  },
                  participants: participantObjects, // Changed from participantHandles
                  dateISO: exp.createdAt || new Date().toISOString(),
                  status: 'pending' as const,
                  receiptImageUrl: exp.receiptImageUrl || undefined
                };
              } catch (transformError) {
                console.error('❌ Failed to transform expense:', exp.id, transformError);
                return null;
              }
            })
            .filter((exp: any) => exp !== null);
            
          console.log('✅ Transformed expenses:', transformedExpenses.length);
          setRealExpenses(transformedExpenses);
        } else {
          console.warn('⚠️ Invalid response format:', data);
        }
      } else {
        console.error('❌ HTTP error:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to fetch expenses:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput("");
    setIsProcessing(true);

    try {
      // Check if there's a pending OCR result (within 5 minutes)
      const hasPendingOCR = pendingOCR && (Date.now() - pendingOCR.timestamp < 5 * 60 * 1000);
      
      // Check for split keywords (like KASY_MVP)
      const hasSplitKeywords = /(?:split|share|divide)\s+(?:with|between|among)|for\s+me\s+and/i.test(input);
      
      if (hasPendingOCR && hasSplitKeywords) {
        // OCR Follow-up: Use pending OCR amount + extract participants from text
        console.log('🎯 OCR Follow-up detected!', pendingOCR);
        
        // Extract participant names from "split with alice bob" or "@alice @bob"
        const splitMatch = input.match(/(?:split|share|divide)\s+with\s+(.+?)(?:\s*$|\.)/i) || 
                          input.match(/for\s+me\s+and\s+(.+?)(?:\s*$|\.)/i);
        
        let participants: string[] = ["@alice"]; // Default payer
        
        if (splitMatch) {
          const namesText = splitMatch[1];
          const names = namesText.split(/[\s,]+|and\b/i)
            .map(n => n.trim())
            .filter(n => typeof n === 'string' && n.length > 1 && !n.toLowerCase().includes('kasy'))
            .map(n => (typeof n === 'string' && n.startsWith('@')) ? n : `@${n}`);
          
          if (names.length > 0) {
            participants = ["@alice", ...names]; // Include payer + mentioned people
          }
        }
        
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-1`,
          role: "assistant",
          content: `Parsed as ${pendingOCR.merchant}, $${(pendingOCR.totalCents / 100).toFixed(2)}, payer @alice, participants ${participants.join(", ")}.`,
          timestamp: new Date().toISOString(),
          actions: [
            { 
              type: "confirm_split", 
              label: "Confirm & Split", 
              data: {
                description: pendingOCR.merchant,
                amountCents: pendingOCR.totalCents,
                currency: "USD",
                payer: "@alice",
                participants: participants,
                merchant: pendingOCR.merchant,
                confidence: pendingOCR.confidence
              }
            },
          ],
        };
        addChatMessage(assistantMessage);
        
        // Clear pending OCR after use
        setPendingOCR(null);
      } else {
        // Normal NLP parsing (no pending OCR or no split keywords)
        const parsed = await parseNaturalLanguage(input);
        
        if (parsed) {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}-1`,
            role: "assistant",
            content: `Parsed as ${parsed.description}, $${(parsed.amountCents / 100).toFixed(2)}, payer ${parsed.payer}, participants ${parsed.participants.join(", ")}.`,
            timestamp: new Date().toISOString(),
            actions: [
              { type: "confirm_split", label: "Confirm & Split", data: parsed },
            ],
          };
          addChatMessage(assistantMessage);
        } else {
          const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-1`,
            role: "assistant",
            content: "I couldn't parse that expense. Try including an amount and participants like: 'Dinner $60 split with @bob @carol'",
            timestamp: new Date().toISOString(),
          };
          addChatMessage(errorMessage);
        }
      }
    } catch (error) {
      toast.error("Failed to parse expense");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = async (action: any) => {
    if (action.type === "confirm_split" && action.data) {
      try {
        const parsedExpense = action.data;
        
        // Create expense in backend
        const expenseData = {
          groupId: "group-1", // Use active group
          payerId: "user-1", // Current user ID
          description: parsedExpense.description,
          amountCents: parsedExpense.amountCents,
          currency: parsedExpense.currency,
          participants: parsedExpense.participants,
          merchant: parsedExpense.merchant
        };

        const createdExpense = await createExpense(expenseData);
        
        if (createdExpense) {
          // Add to local store
          addExpense(createdExpense);
          
          // Refresh real expenses list
          if (showRealData) {
            await fetchRealExpenses();
          }
          
          // Add success message
          const successMessage: ChatMessage = {
            id: `msg-${Date.now()}-success`,
            role: "assistant",
            content: `✅ Expense created successfully! $${(parsedExpense.amountCents / 100).toFixed(2)} split between ${parsedExpense.participants.length} people.`,
            timestamp: new Date().toISOString(),
          };
          addChatMessage(successMessage);
          
          toast.success("Expense created successfully!");
        } else {
          toast.error("Failed to create expense");
        }
      } catch (error) {
        console.error("Failed to create expense:", error);
        toast.error("Failed to create expense");
      }
    } else {
      toast.info("Action clicked: " + action.label);
    }
  };

  const handleUploadReceipt = async () => {
    try {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Convert to base64 for demo (in production, upload to cloud storage)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageUrl = e.target?.result as string;
          
          try {
            const ocrResult = await extractReceiptData(imageUrl, "user-1", "group-1");
            
            // Store pending OCR result for follow-up messages (5-minute TTL)
            setPendingOCR({
              merchant: ocrResult.merchant || "Unknown",
              totalCents: Math.round((ocrResult.total || 0) * 100),
              confidence: ocrResult.confidence,
              timestamp: Date.now()
            });
            
            const assistantMessage: ChatMessage = {
              id: `msg-${Date.now()}-ocr`,
              role: "assistant",
              content: `📄 Receipt processed! Found ${ocrResult.merchant} for $${ocrResult.total?.toFixed(2)}. Confidence: ${Math.round(ocrResult.confidence * 100)}%`,
              timestamp: new Date().toISOString(),
              actions: [
                { 
                  type: "confirm_split", 
                  label: "Create Expense", 
                  data: {
                    description: `${ocrResult.merchant} - Receipt`,
                    amountCents: Math.round((ocrResult.total || 0) * 100),
                    currency: "USD",
                    payer: "@alice",
                    participants: ["@alice", "@bob"],
                    merchant: ocrResult.merchant,
                    confidence: ocrResult.confidence
                  }
                },
              ],
            };
            addChatMessage(assistantMessage);
            
            toast.success("Receipt processed! You can now type 'split with @alice' to specify participants.");
          } catch (error) {
            console.error("Failed to process receipt:", error);
            toast.error("Failed to process receipt");
          }
        };
        
        reader.readAsDataURL(file);
      };
      
      input.click();
    } catch (error) {
      console.error("Failed to upload receipt:", error);
      toast.error("Failed to upload receipt");
    }
  };

  const recentExpenses = expenses.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">
          <span className="gradient-text">AI-Powered</span> Expense Splitting
        </h1>
        <p className="text-muted-foreground">
          Just type naturally or upload a receipt. KASY handles the rest.
        </p>
      </div>

      {/* Chat Feed */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Type something like "Dinner $60 split with @bob @carol" or upload a receipt to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role !== "user" && (
                    <Avatar className="w-8 h-8">
                      <div className="w-full h-full gradient-primary flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] space-y-2 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    <Card className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                      <CardContent className="p-3">
                        <p className="text-sm">{message.content}</p>
                      </CardContent>
                    </Card>
                    
                    {message.actions && (
                      <div className="flex gap-2">
                        {message.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            onClick={() => handleActionClick(action)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && currentUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.avatarUrl} />
                      <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Type naturally: 'Dinner $60 split with @bob @carol' or try /split, /help..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleUploadReceipt}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Receipt
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={isProcessing || !input.trim()}
                className="gap-2"
              >
                {isProcessing ? "Processing..." : "Send"}
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      {(showRealData ? realExpenses : recentExpenses).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Expenses</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRealData(!showRealData)}
            >
              {showRealData ? "📊 Show Mock Data" : "🔥 Show Real Data"}
            </Button>
          </div>
          <div className="grid gap-4">
            {(showRealData ? realExpenses : recentExpenses).map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
