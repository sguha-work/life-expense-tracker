import React from 'react';
import SyncButton from './ui/SyncButton';
import { TrendingUp } from 'lucide-react';
interface HomePageHeaderComponentProps{
    fetchData: () => Promise<void>;
    formattedDate: string;
    todayTotal: number;
    creditTotal: number;
    otherTotal: number;
    yesterdayTotals: {
        total: number;
        creditTotal: number;
        otherTotal: number;
    };
    monthTotal: number;
}
export const HomePageHeaderComponent: React.FC<HomePageHeaderComponentProps> = (props) => (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <SyncButton fetchData={props.fetchData}></SyncButton>
          <p className="text-blue-100 font-medium tracking-wide text-sm mb-1 uppercase">Today's Expense</p>
          <p className="text-blue-100 font-medium tracking-wide text-sm mb-1 uppercase">{props.formattedDate}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold tracking-tight">₹{props.todayTotal.toFixed(2)}</span>
            <span className="text-blue-200 text-sm font-medium">INR</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider mb-1">Credit</p>
              <p className="text-xl font-bold">₹{props.creditTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider mb-1">Other</p>
              <p className="text-xl font-bold">₹{props.otherTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 space-y-4">
            <p className="text-xs sm:text-sm text-blue-50 flex flex-nowrap items-center gap-x-2 overflow-x-auto whitespace-nowrap">
              <span className="text-blue-200 font-medium">Yesterday</span>
              <span className="font-bold text-white">₹{props.yesterdayTotals.total.toFixed(2)}</span>
              <span className="text-blue-300/80" aria-hidden>·</span>
              <span className="text-blue-200">Credit</span>
              <span className="font-semibold">₹{props.yesterdayTotals.creditTotal.toFixed(2)}</span>
              <span className="text-blue-300/80" aria-hidden>·</span>
              <span className="text-blue-200">Other</span>
              <span className="font-semibold">₹{props.yesterdayTotals.otherTotal.toFixed(2)}</span>
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-blue-50">
                <TrendingUp size={16} />
                <span className="font-semibold">This Month</span>
              </div>
              <span className="font-bold text-white">₹{props.monthTotal.toFixed(2)}</span>
            </div>

          </div>
        </div>
)