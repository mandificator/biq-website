import React, { useRef, useEffect, useMemo, useState } from "react";
import { Bar, Line } from 'react-chartjs-2';
import { mockUsers, UserData } from '../../data/mockUsers';
import { format, parseISO, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import { useTheme } from "../../hooks/useTheme";
import { getThemeColors } from "../../utils/themeColors";
import { ThemeToggle } from "../../components/ThemeToggle";
import { DarkModeToggle } from "../../components/DarkModeToggle";
import { useDarkMode } from "../../hooks/useDarkMode";
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Card, CardContent } from "../../components/ui/card";

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

export const Dashboard = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'total_arrivals' | 'early_arrivals' | 'left_early' | 'stayed_longest' | 'already_left' | 'currently_here' | 'didnt_show_up'>('total_arrivals');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { theme } = useTheme();
  const { palette, chartColors } = getThemeColors(theme);
  const { isDarkMode } = useDarkMode();

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date('2025-01-15T18:30:00Z'); // Current time 18:30
    const eventStart = new Date('2025-01-15T10:00:00Z');
    const eventEnd = new Date('2025-01-15T22:00:00Z');

    const totalAccepted = mockUsers.length; // All 300 (including no-shows)
    const totalArrivals = mockUsers.filter(user => 
      user.status !== 'accepted_not_arrived'
    ).length;
    
    const liveNow = mockUsers.filter(user => 
      user.status === 'present'
    ).length;

    // Calculate average visit duration from completed visits
    const completedVisits = mockUsers.filter(user => 
      user.status === 'departed'
    );
    
    const avgDuration = completedVisits.length > 0 
      ? completedVisits.reduce((sum, user) => 
          sum + differenceInMinutes(parseISO(user.departure), parseISO(user.arrival)), 0
        ) / completedVisits.length
      : 0;

    return {
      totalAccepted,
      totalArrivals,
      liveNow,
      avgDuration: Math.round(avgDuration) + ' min'
    };
  }, []);

  // Chart data with 10-minute granularity
  const chartData = useMemo(() => {
    const intervalData = [];
    
    // Only include users who actually arrived (not accepted_not_arrived)
    const arrivedUsers = mockUsers.filter(user => user.status !== 'accepted_not_arrived');
    
    // Create 10-minute intervals from 10:00 to 22:00 (72 intervals)
    for (let hour = 10; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        intervalData.push({
          time,
          checkins: 0,
          checkouts: 0,
          visitorsOnSite: 0
        });
      }
    }

    // Count check-ins for each 10-minute interval
    arrivedUsers.forEach(user => {
      const arrivalTime = parseISO(user.arrival);
      const arrivalMinutes = arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
      const arrivalIntervalIndex = Math.floor((arrivalMinutes - 600) / 10);
      
      if (arrivalIntervalIndex >= 0 && arrivalIntervalIndex < intervalData.length) {
        intervalData[arrivalIntervalIndex].checkins++;
      }
    });

    // Count check-outs for each 10-minute interval
    arrivedUsers.forEach(user => {
      const departureTime = parseISO(user.departure);
      const departureMinutes = departureTime.getHours() * 60 + departureTime.getMinutes();
      const departureIntervalIndex = Math.floor((departureMinutes - 600) / 10);
      
      if (departureIntervalIndex >= 0 && departureIntervalIndex < intervalData.length) {
        intervalData[departureIntervalIndex].checkouts++;
      }
    });

    // Calculate visitors on site for each 10-minute interval
    let cumulativeCheckins = 0;
    let cumulativeCheckouts = 0;
    
    intervalData.forEach((data, index) => {
      cumulativeCheckins += data.checkins;
      cumulativeCheckouts += data.checkouts;
      data.visitorsOnSite = cumulativeCheckins - cumulativeCheckouts;
    });

    return intervalData;
  }, []);

  // Categorize users
  const categorizedUsers = useMemo(() => {
    const now = new Date('2025-01-15T18:30:00Z'); // Current time 18:30
    const eventStart = new Date('2025-01-15T10:00:00Z'); // Event starts at 10:00
    
    // Only work with users who actually arrived
    const arrivedUsers = mockUsers.filter(user => user.status !== 'accepted_not_arrived');
    
    const totalVisitors = mockUsers;
    
    // Early arrivals - arrived in first 30 minutes (10:00-10:30)
    const earlyArrivals = arrivedUsers
      .filter(user => {
        const arrivalTime = parseISO(user.arrival);
        const minutesFromStart = differenceInMinutes(arrivalTime, eventStart);
        return minutesFromStart >= 0 && minutesFromStart <= 30;
      })
      .sort((a, b) => parseISO(a.arrival).getTime() - parseISO(b.arrival).getTime());
    
    // Left early - stayed less than 30 minutes
    const leftEarly = arrivedUsers
      .filter(user => 
        differenceInMinutes(parseISO(user.departure), parseISO(user.arrival)) < 30
      )
      .sort((a, b) => {
        const durationA = differenceInMinutes(parseISO(a.departure), parseISO(a.arrival));
        const durationB = differenceInMinutes(parseISO(b.departure), parseISO(b.arrival));
        return durationA - durationB;
      });
    
    // Stayed longest - top 10% by duration
    const allDurations = arrivedUsers
      .map(user => ({
        user,
        duration: differenceInMinutes(parseISO(user.departure), parseISO(user.arrival))
      }))
      .sort((a, b) => b.duration - a.duration);
    
    const top10PercentCount = Math.ceil(allDurations.length * 0.1);
    const stayedLongest = allDurations
      .slice(0, top10PercentCount)
      .map(item => item.user);

    // Currently here - status is 'present'
    const currentlyHere = mockUsers
      .filter(user => user.status === 'present')
      .sort((a, b) => parseISO(a.arrival).getTime() - parseISO(b.arrival).getTime());
    
    // Already left - status is 'departed'
    const alreadyLeft = mockUsers
      .filter(user => user.status === 'departed')
      .sort((a, b) => parseISO(b.departure).getTime() - parseISO(a.departure).getTime());

    // Didn't show up - status is 'accepted_not_arrived'
    const didntShowUp = mockUsers
      .filter(user => user.status === 'accepted_not_arrived')
      .sort((a, b) => parseISO(a.arrival).getTime() - parseISO(b.arrival).getTime());
    return { totalVisitors, earlyArrivals, leftEarly, stayedLongest, currentlyHere, alreadyLeft, didntShowUp };
  }, []);

  // Export functions
  const exportWallets = (category: string) => {
    const users = getCurrentUsers();
    const wallets = users.map(user => user.wallet).join('\n');
    const blob = new Blob([wallets], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category.toLowerCase().replace(/\s+/g, '_')}_wallets.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const getTabDisplayName = (tab: string) => {
    switch (tab) {
      case 'total_arrivals': return 'Total Arrivals';
      case 'early_arrivals': return 'Early Arrivals';
      case 'left_early': return 'Left Early';
      case 'stayed_longest': return 'Stayed Longest';
      case 'already_left': return 'Already Left';
      case 'currently_here': return 'Currently Here';
      case 'didnt_show_up': return "Didn't Show Up";
      default: return 'Unknown';
    }
  };

  // Chart configurations
  const visitorFlowChartData = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: 'Check-ins',
        data: chartData.map(d => d.checkins),
        backgroundColor: chartColors.arrivals,
        borderColor: chartColors.arrivalsBorder,
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Check-outs',
        data: chartData.map(d => d.checkouts),
        backgroundColor: chartColors.departures,
        borderColor: chartColors.departuresBorder,
        borderWidth: 2,
        fill: true,
      }
    ]
  };

  const visitorsOnSiteChartData = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: 'Visitors On Site',
        data: chartData.map(d => d.visitorsOnSite),
        backgroundColor: chartColors.present,
        borderColor: chartColors.presentBorder,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'GRIFTER-Regular, Helvetica'
          },
          maxTicksLimit: 20,
          callback: function(value: any, index: number) {
            return index % 6 === 0 ? this.getLabelForValue(value) : '';
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'GRIFTER-Regular, Helvetica'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'total_arrivals': return categorizedUsers.totalVisitors.filter(user => user.status !== 'accepted_not_arrived');
      case 'early_arrivals': return categorizedUsers.earlyArrivals;
      case 'left_early': return categorizedUsers.leftEarly;
      case 'stayed_longest': return categorizedUsers.stayedLongest;
      case 'currently_here': return categorizedUsers.currentlyHere;
      case 'already_left': return categorizedUsers.alreadyLeft;
      case 'didnt_show_up': return categorizedUsers.didntShowUp;
      default: return categorizedUsers.totalVisitors.filter(user => user.status !== 'accepted_not_arrived');
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'total_arrivals': return categorizedUsers.totalVisitors.filter(user => user.status !== 'accepted_not_arrived').length;
      case 'early_arrivals': return categorizedUsers.earlyArrivals.length;
      case 'left_early': return categorizedUsers.leftEarly.length;
      case 'stayed_longest': return categorizedUsers.stayedLongest.length;
      case 'currently_here': return categorizedUsers.currentlyHere.length;
      case 'already_left': return categorizedUsers.alreadyLeft.length;
      case 'didnt_show_up': return categorizedUsers.didntShowUp.length;
      default: return 0;
    }
  };

  return (
    <div className="bg-gray-900 flex flex-row justify-center w-full min-h-screen relative">
      {/* Static Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-00"
        style={{ backgroundImage: 'url(/image.png)' }}
      />
      
      <Card className="bg-transparent overflow-hidden w-full max-w-[1512px] min-h-screen border-none relative">
        <CardContent className="p-0 relative min-h-screen flex flex-col">
          <div className="flex flex-col w-full min-h-screen relative z-10 p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <div className="flex-1">
                <h1 className="[font-family:'GRIFTER-Bold',Helvetica] font-bold text-white text-3xl drop-shadow-lg">
                  Superteam BLKN Party
                </h1>
              </div>
              <div className="flex items-center justify-center flex-1">
                <img
                  className="w-[50px] h-[55px] mr-4"
                  style={{ opacity: 0.75 }}
                  alt="Logo biq"
                  src="/logo_biq.svg"
                />
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center space-x-4">
                 
                  <div className="relative">
                    <button 
                      onClick={() => setIsExportOpen(!isExportOpen)}
                      className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-white bg-white/30 hover:bg-white/40 transition-colors px-6 py-2 rounded-lg border border-white/40 backdrop-blur-sm drop-shadow-lg flex items-center space-x-2"
                    >
                      <span>Export wallets</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExportOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-2xl z-50 min-w-[200px]">
                        {[
                          { key: 'total_arrivals', label: 'Total Arrivals' },
                          { key: 'early_arrivals', label: 'Early Arrivals' },
                          { key: 'left_early', label: 'Left Early' },
                          { key: 'stayed_longest', label: 'Stayed Longest' },
                          { key: 'already_left', label: 'Already Left' },
                          { key: 'currently_here', label: 'Currently Here' },
                          { key: 'didnt_show_up', label: "Didn't Show Up" }
                        ].map((option) => (
                          <button
                            key={option.key}
                            onClick={() => exportWallets(option.label)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700/60 transition-colors first:rounded-t-lg last:rounded-b-lg [font-family:'GRIFTER-Regular',Helvetica] font-normal text-white text-sm"
                          >
                            {option.label} ({getTabCount(option.key)})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-lg mb-2">
                  Total Accepted
                </h3>
                <p className="[font-family:'GRIFTER-Bold',Helvetica] font-bold text-white text-4xl">
                  {stats.totalAccepted}
                </p>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-lg mb-2">
                  Total Arrivals
                </h3>
                <p className="[font-family:'GRIFTER-Bold',Helvetica] font-bold text-white text-4xl">
                  {stats.totalArrivals}
                </p>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-lg mb-2">
                  Live Now
                </h3>
                <p className="[font-family:'GRIFTER-Bold',Helvetica] font-bold text-white text-4xl">
                  {stats.liveNow}
                </p>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-lg mb-2">
                  Avg. Visit Duration
                </h3>
                <p className="[font-family:'GRIFTER-Bold',Helvetica] font-bold text-white text-4xl">
                  {stats.avgDuration}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-white text-xl mb-2">
                  Visitor Flow
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-[rgba(255,165,100,0.8)] rounded"></div>
                    <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-sm">Check-ins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: chartColors.departures }}></div>
                    <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-sm">Check-outs</span>
                  </div>
                </div>
                <div className="h-64">
                  <Line data={visitorFlowChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-white text-xl mb-2">
                  Visitors On Site
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-3 rounded" style={{ backgroundColor: chartColors.present }}></div>
                  <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-sm">Visitors On Site</span>
                </div>
                <div className="h-64">
                  <Bar data={visitorsOnSiteChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* User List with Tabs */}
            <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl">
              {/* Tab Navigation */}
              <div className="flex bg-gray-700/90 backdrop-blur-md rounded-t-xl border-t border-l border-r border-gray-600/50">
                {[
                  { key: 'total_arrivals', label: 'Total Arrivals' },
                  { key: 'early_arrivals', label: 'Early Arrivals' },
                  { key: 'left_early', label: 'Left Early' },
                  { key: 'stayed_longest', label: 'Stayed Longest' },
                  { key: 'already_left', label: 'Already Left' },
                  { key: 'currently_here', label: 'Currently Here' },
                  { key: 'didnt_show_up', label: "Didn't Show Up" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 px-4 py-3 text-center border-r border-gray-600/50 last:border-r-0 ${
                      activeTab === tab.key
                        ? 'bg-gray-600/60 text-white shadow-inner'
                        : 'text-gray-300 bg-transparent'
                    }`}
                  >
                    <span className="[font-family:'GRIFTER-Regular',Helvetica] font-medium text-sm">
                      {tab.label}
                    </span>
                    <span className="ml-2 text-xs font-bold">
                      ({getTabCount(tab.key)})
                    </span>
                  </button>
                ))}
              </div>

              {/* User List */}
              <div className="p-4 bg-gray-800/90 backdrop-blur-md rounded-b-xl border-b border-l border-r border-gray-700/50 shadow-2xl">
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {getCurrentUsers().map((user, index) => (
                    <div key={user.userID} className="flex items-center justify-between px-6 py-4 h-[92px] bg-gray-700/90 backdrop-blur-md rounded-xl border border-gray-600/50 shadow-2xl">
                      <div className="flex items-center space-x-4">
                        <img
                          src={user.pfp}
                          alt={user.username}
                          className={`w-12 h-12 rounded-full border-2 border-gray-500/60 shadow-lg ${
                            user.status === 'present' ? 'ring-2 ring-green-400/50' : 
                            user.status === 'departed' ? 'ring-2 ring-red-400/50' : 
                            'ring-2 ring-gray-400/50'
                          }`}
                        />
                        <div>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-semibold text-white text-base">
                            {user.username}
                          </p>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-gray-300 text-sm">
                            {user.wallet?.slice(0, 6)}...{user.wallet?.slice(-4)}
                          </p>
                          <div className="flex items-center mt-2">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              user.status === 'present' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 
                              user.status === 'departed' ? 'bg-red-400 shadow-lg shadow-red-400/50' : 
                              'bg-gray-400 shadow-lg shadow-gray-400/50'
                            }`}></div>
                            <span className={`[font-family:'GRIFTER-Regular',Helvetica] font-semibold text-xs px-3 py-1 rounded-full backdrop-blur-sm border ${
                              user.status === 'present' ? 'text-green-200' : 
                              user.status === 'departed' ? 'text-red-200' : 
                              user.status === 'accepted_not_arrived' ? 'text-yellow-200' : 
                              'text-gray-200'
                            } ${
                              user.status === 'present' ? 'bg-green-400/30 border-green-400/50 shadow-green-400/20' : 
                              user.status === 'departed' ? 'bg-red-400/30 border-red-400/50 shadow-red-400/20' : 
                              user.status === 'accepted_not_arrived' ? 'bg-yellow-400/30 border-yellow-400/50 shadow-yellow-400/20' : 
                              'bg-gray-400/30 border-gray-400/50 shadow-gray-400/20'
                            }`}>
                              {user.status === 'present' ? 'Currently Here' : 
                               user.status === 'departed' ? 'Already Left' : 
                              user.status === 'accepted_not_arrived' ? "Didn't Show Up" : 
                              'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8 text-right">
                        <div>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-medium text-gray-400 text-xs">
                            Arrival
                          </p>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-bold text-white text-sm">
                            {format(parseISO(user.arrival), 'HH:mm')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-medium text-gray-400 text-xs">
                            Departure
                          </p>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-bold text-white text-sm">
                            {user.status === 'accepted_not_arrived' ? '--:--' : format(parseISO(user.departure), 'HH:mm')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-medium text-gray-400 text-xs">
                            Check-ins
                          </p>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-bold text-white text-sm">
                            {user.checkInCount}
                          </p>
                        </div>
                        
                        <div>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-medium text-gray-400 text-xs">
                            Rewards
                          </p>
                          <p className="[font-family:'GRIFTER-Regular',Helvetica] font-bold text-white text-sm">
                            {user.totalRewards} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};