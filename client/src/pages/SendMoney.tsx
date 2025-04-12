import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserAvatar } from '@/components/UserAvatar';
import { ConfirmTransactionDialog } from '@/components/ConfirmTransactionDialog';
import { TransactionSuccessDialog } from '@/components/TransactionSuccessDialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeftIcon } from 'lucide-react';

export default function SendMoney() {
  const [, navigate] = useLocation();
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loc] = useLocation();
  
  // Parse recipientId from URL if present
  const params = new URLSearchParams(loc.split('?')[1]);
  const preselectedRecipientId = params.get('recipientId');

  // Form state
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>(preselectedRecipientId || undefined);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [note, setNote] = useState('');
  
  // Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedRecipientName, setSelectedRecipientName] = useState('');

  // Query users
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Set the recipient name when selected
  useEffect(() => {
    if (selectedRecipientId && users) {
      const recipient = users.find(u => u.id.toString() === selectedRecipientId);
      if (recipient) {
        setSelectedRecipientName(`${recipient.firstName} ${recipient.lastName}`);
      }
    } else if (newRecipientEmail) {
      setSelectedRecipientName(newRecipientEmail);
    } else {
      setSelectedRecipientName('');
    }
  }, [selectedRecipientId, newRecipientEmail, users]);

  // Transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: { receiverId: number; amount: number; note: string; type: string }) => {
      return apiRequest('POST', '/api/transactions', data);
    },
    onSuccess: () => {
      // Reset form and show success
      setAmount('');
      setSelectedRecipientId(undefined);
      setNewRecipientEmail('');
      setNote('');
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      refreshUserData();
    },
    onError: (error) => {
      setShowConfirmDialog(false);
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Failed to process transaction",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedRecipientId && !newRecipientEmail) {
      toast({
        title: "Recipient required",
        description: "Please select a recipient or enter a new one",
        variant: "destructive",
      });
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmTransaction = () => {
    if (!selectedRecipientId || !amount) {
      toast({
        title: "Invalid transaction",
        description: "Missing recipient or amount",
        variant: "destructive",
      });
      return;
    }

    // Process transaction
    createTransaction.mutate({
      receiverId: parseInt(selectedRecipientId),
      amount: typeof amount === 'string' ? parseFloat(amount) : amount,
      note: note,
      type: 'transfer'
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="link" 
            className="inline-flex items-center text-primary hover:text-primary-dark p-0 mb-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeftIcon className="mr-2" size={16} />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-neutral-800">Send Money</h1>
          <p className="text-neutral-600">Transfer funds to your contacts quickly and securely.</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Select 
                  value={selectedRecipientId} 
                  onValueChange={setSelectedRecipientId}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.filter(u => u.id !== user?.id).map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new-recipient">Or enter new recipient</Label>
                <Input
                  id="new-recipient"
                  type="email"
                  placeholder="Email or phone number"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  className="mt-1"
                  disabled={!!selectedRecipientId}
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 sm:text-sm">₹</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                    className="pl-7"
                  />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Available balance: ₹{formatCurrency(user?.balance || 0)}
                </p>
              </div>

              <div>
                <Label htmlFor="note">Add a note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="What's this payment for?"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <h3 className="text-lg font-medium text-neutral-800 mb-4">Recent Recipients</h3>
            <div className="divide-y divide-neutral-200">
              {users?.filter(u => u.id !== user?.id).slice(0, 3).map((contact) => (
                <div 
                  key={contact.id}
                  className="p-4 flex items-center hover:bg-neutral-50 cursor-pointer"
                  onClick={() => setSelectedRecipientId(contact.id.toString())}
                >
                  <UserAvatar 
                    firstName={contact.firstName}
                    lastName={contact.lastName}
                    className="mr-3 h-10 w-10"
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{contact.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <ConfirmTransactionDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmTransaction}
          amount={typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0}
          recipient={selectedRecipientName}
          note={note}
          isProcessing={createTransaction.isPending}
        />

        {/* Success Dialog */}
        <TransactionSuccessDialog
          isOpen={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            navigate('/dashboard');
          }}
          onNewTransaction={() => {
            setShowSuccessDialog(false);
          }}
          amount={typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0}
          recipient={selectedRecipientName}
        />
      </div>
    </AppLayout>
  );
}
