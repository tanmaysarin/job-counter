"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Plus, Minus, RefreshCw } from 'lucide-react';

const Counter = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState({});

  useEffect(() => {
    const savedCount = localStorage.getItem('totalCount');
    setTotalCount(savedCount ? Math.max(0, parseInt(savedCount)) : 0);

    const savedHistory = localStorage.getItem('applicationHistory');
    setHistory(savedHistory ? JSON.parse(savedHistory) : {});
  }, []);

  useEffect(() => {
    localStorage.setItem('totalCount', totalCount.toString());
    localStorage.setItem('applicationHistory', JSON.stringify(history));
  }, [totalCount, history]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const updateHistory = (changeAmount) => {
    const today = getTodayDate();
    const timestamp = new Date().toISOString();
    const todayRecord = history[today] || { count: totalCount, changes: [] };
    
    const updatedHistory = {
      ...history,
      [today]: {
        count: Math.max(0, totalCount + changeAmount),
        changes: [...todayRecord.changes, { amount: changeAmount, timestamp }]
      }
    };
    
    setHistory(updatedHistory);
  };

  const increment = () => {
    setTotalCount(prev => prev + 1);
    updateHistory(1);
  };

  const decrement = () => {
    if (totalCount > 0) {
      setTotalCount(prev => Math.max(0, prev - 1));
      updateHistory(-1);
    }
  };

  const reset = () => {
    setTotalCount(0);
    const today = getTodayDate();
    const updatedHistory = {
      ...history,
      [today]: {
        count: 0,
        changes: [...(history[today]?.changes || []), { amount: 'reset', timestamp: new Date().toISOString() }]
      }
    };
    setHistory(updatedHistory);
  };

  const getTodayApplications = () => {
    const today = getTodayDate();
    const todayRecord = history[today];
    if (!todayRecord) return 0;
    
    return Math.max(0, todayRecord.changes.reduce((total, change) => {
      return change.amount === 'reset' ? 0 : total + (change.amount || 0);
    }, 0));
  };

  const getHistoryWithTotals = () => {
    return Object.entries(history)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([date, data], index, array) => {
        const runningTotal = array
          .slice(index)
          .reduce((total, [, dayData]) => {
            const dayCount = dayData.changes.reduce((sum, change) => {
              return change.amount === 'reset' ? 0 : sum + (change.amount || 0);
            }, 0);
            return total + dayCount;
          }, 0);

        return {
          date,
          dailyCount: data.changes.reduce((sum, change) => {
            return change.amount === 'reset' ? 0 : sum + (change.amount || 0);
          }, 0),
          runningTotal
        };
      });
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col touch-manipulation">
      <div className="safe-top bg-neutral-900" /> {/* Safe area for notches */}
      
      <Card className="flex-1 mx-4 my-4 bg-neutral-800 border-neutral-700 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-white flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Jobs Applied
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main counter display */}
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold text-white mb-8">{totalCount}</div>
            
            {/* Large, touch-friendly buttons */}
            <div className="flex gap-4 w-full max-w-xs">
              <Button 
                onClick={decrement}
                variant="outline"
                className="flex-1 h-16 text-xl bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600 active:scale-95 transition-transform"
                disabled={totalCount === 0}
              >
                <Minus className="w-6 h-6" />
              </Button>
              
              <Button 
                onClick={increment}
                variant="outline"
                className="flex-1 h-16 text-xl bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600 active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Reset button */}
            <Button 
              onClick={reset}
              variant="destructive"
              className="w-full max-w-xs mt-4 h-12 active:scale-95 transition-transform"
              disabled={totalCount === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Today's counter */}
          <div className="bg-neutral-700 rounded-lg p-4 mx-4">
            <h3 className="text-white text-base font-medium mb-2">Today&apos;s Applications</h3>
            <div className="text-center">
              <span className="text-3xl font-bold text-white">
                {getTodayApplications()}
              </span>
              <span className="text-neutral-400 text-sm ml-2">today</span>
            </div>
          </div>

          {/* History table with touch-friendly sizing */}
          <div className="mx-4">
            <h3 className="text-white text-base font-medium mb-2">History</h3>
            <div className="bg-neutral-700 rounded-lg p-2 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-neutral-600">
                      <th className="text-left p-3 text-sm">Date</th>
                      <th className="text-right p-3 text-sm">Daily</th>
                      <th className="text-right p-3 text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getHistoryWithTotals().map((entry) => (
                      <tr 
                        key={entry.date} 
                        className="border-b border-neutral-600 last:border-0"
                      >
                        <td className="p-3 text-sm">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="text-right p-3 text-sm">{entry.dailyCount}</td>
                        <td className="text-right p-3 text-sm">{entry.runningTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="safe-bottom bg-neutral-900" /> {/* Safe area for home indicator */}
    </div>
  );
};

export default Counter;