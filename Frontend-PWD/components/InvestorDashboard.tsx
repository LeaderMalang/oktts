
import React, { useMemo } from 'react';
import { Page, User } from '../types';
import { ICONS, INVESTOR_TRANSACTIONS } from '../constants';

interface InvestorDashboardProps {
  setCurrentPage: (page: Page) => void;
  currentUser: User;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ setCurrentPage, currentUser }) => {

    const financials = useMemo(() => {
        const myTransactions = INVESTOR_TRANSACTIONS.filter(t => t.investorId === currentUser.id);

        const totalInvestment = myTransactions
            .filter(t => t.type === 'INVESTMENT')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalProfitShare = myTransactions
            .filter(t => t.type === 'PROFIT_SHARE')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalReturns = myTransactions
            .filter(t => t.type === 'PAYOUT')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalInvestment,
            totalReturns,
            totalProfitShare,
            netBalance: totalInvestment + totalProfitShare - totalReturns,
        };
    }, [currentUser.id]);

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome, {currentUser.username}!</h2>
                <p className="text-gray-500 dark:text-gray-400">Here's a summary of your investment portfolio.</p>
            </section>
            
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Investment" value={`Rs. ${financials.totalInvestment.toLocaleString()}`} icon={ICONS.purchase} color="bg-green-500" />
                    <StatCard title="Total Profit Share" value={`Rs. ${financials.totalProfitShare.toLocaleString()}`} icon={ICONS.reports} color="bg-cyan-500" />
                    <StatCard title="Total Returns Paid Out" value={`Rs. ${financials.totalReturns.toLocaleString()}`} icon={ICONS.invoice} color="bg-red-500" />
                    <StatCard title="Net Balance" value={`Rs. ${financials.netBalance.toLocaleString()}`} icon={ICONS.investor} color="bg-blue-500" />
                </div>
            </section>
            
            <section>
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">My Account</h3>
                     <div className="space-y-3">
                         <button onClick={() => setCurrentPage('investor-ledger')} className="w-full text-left p-4 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                            <p className="font-bold text-blue-800 dark:text-blue-300">View My Detailed Ledger</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">See a full history of your investments and payouts.</p>
                        </button>
                     </div>
                 </div>
            </section>
        </div>
    );
};

export default InvestorDashboard;
