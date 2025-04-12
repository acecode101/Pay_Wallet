import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionCard } from '@/components/TransactionCard';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export default function TransactionHistory() {
  // Filter state
  const [transactionType, setTransactionType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountRange, setAmountRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Query transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Filter and sort transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    // Filter by type
    if (transactionType === 'sent' && transaction.isIncoming) return false;
    if (transactionType === 'received' && !transaction.isIncoming) return false;
    
    // Filter by date
    if (dateFrom && new Date(transaction.timestamp) < new Date(dateFrom)) return false;
    if (dateTo && new Date(transaction.timestamp) > new Date(dateTo)) return false;
    
    // Filter by amount
    const amount = transaction.amount;
    if (amountRange === '0-500' && (amount < 0 || amount > 500)) return false;
    if (amountRange === '500-2000' && (amount < 500 || amount > 2000)) return false;
    if (amountRange === '2000+' && amount < 2000) return false;
    
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a: any, b: any) => {
    if (sortOrder === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortOrder === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (sortOrder === 'amount-high') return b.amount - a.amount;
    if (sortOrder === 'amount-low') return a.amount - b.amount;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleReset = () => {
    setTransactionType('all');
    setDateFrom('');
    setDateTo('');
    setAmountRange('all');
    setCurrentPage(1);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">Transaction History</h1>
          <p className="text-neutral-600">View and manage all your past transactions.</p>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="transaction-type">Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger id="transaction-type" className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="bills">Bills & Recharges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount-range">Amount Range</Label>
                <Select value={amountRange} onValueChange={setAmountRange}>
                  <SelectTrigger id="amount-range" className="w-full">
                    <SelectValue placeholder="All Amounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                    <SelectItem value="500-2000">₹500 - ₹2,000</SelectItem>
                    <SelectItem value="2000+">₹2,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button type="button" variant="outline" onClick={handleReset} className="mr-3">
                  Reset
                </Button>
                <Button type="submit">
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3">
            <CardTitle className="text-lg mb-3 sm:mb-0">All Transactions</CardTitle>
            <div className="flex items-center">
              <span className="text-sm text-neutral-500 mr-2">Sort by:</span>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-neutral-200">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction: any) => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                    showDetails
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-neutral-500">No transactions found</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <p className="text-sm text-neutral-500 mb-3 sm:mb-0">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedTransactions.length)} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-9 h-9"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
