import { useEffect } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { UserAvatar } from '@/components/UserAvatar';
import { TransactionCard } from '@/components/TransactionCard';
import { 
  Layers, 
  QrCodeIcon, 
  ReceiptIcon, 
  SmartphoneIcon, 
  Landmark, 
  MoreHorizontalIcon 
} from 'lucide-react';

export default function Dashboard() {
  const { user, refreshUserData } = useAuth();

  // Query transactions
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Query users for contacts
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Refresh user data to get latest balance
  useEffect(() => {
    refreshUserData();
  }, [transactions]);

  const recentTransactions = transactions?.slice(0, 4) || [];
  const recentContacts = users?.filter(u => u.id !== user?.id).slice(0, 3) || [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-neutral-600">
            Manage your money and make transactions easily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-primary to-[#002E6E] text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-90">Available Balance</p>
                  <p className="text-3xl font-bold">₹{formatCurrency(user?.balance || 0)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Landmark className="text-white" size={20} />
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-200 px-6 py-3">
              <p className="text-xs text-neutral-500">Last updated: {formatDateTime(new Date())}</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                <Link href="/send-money">
                  <Button variant="ghost" className="flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg hover:bg-neutral-100 w-full space-y-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Layers size={18} />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Send</span>
                  </Button>
                </Link>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg hover:bg-neutral-100 w-full space-y-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <QrCodeIcon size={18} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Scan</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg hover:bg-neutral-100 w-full space-y-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ReceiptIcon size={18} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Bills</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg hover:bg-neutral-100 w-full space-y-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <SmartphoneIcon size={18} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Recharge</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg hover:bg-neutral-100 w-full space-y-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Landmark size={18} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Bank</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg hover:bg-neutral-100 w-full space-y-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MoreHorizontalIcon size={18} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">More</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Contacts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Contacts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {recentContacts.length > 0 ? (
                  recentContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center">
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
                      <Link href={`/send-money?recipientId=${contact.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-full"
                        >
                          <Layers size={14} />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-4">No contacts found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <Link href="/history">
              <Button variant="link" className="text-primary hover:text-primary-dark">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                  />
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-neutral-500">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
