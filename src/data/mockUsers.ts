export interface UserData {
  userID: string;
  username: string;
  wallet: string;
  pfp: string;
  arrival: string;
  departure: string;
  checkInCount: number;
  totalRewards: number;
  status: 'not_arrived' | 'present' | 'departed' | 'accepted_not_arrived';
}

// Real Twitter usernames and profile pictures
const twitterUsers = [
  { username: '@alexmasmej', pfp: 'https://pbs.twimg.com/profile_images/1926854835153825792/T5kA2Cjl_400x400.jpg' },
  { username: '@naval', pfp: 'https://pbs.twimg.com/profile_images/1950644160412647424/taWK3l0z_400x400.jpg' },
  { username: '@balajis', pfp: 'https://pbs.twimg.com/profile_images/1937526831915085824/MrSmM-EN_400x400.jpg' },
  { username: '@punk6529', pfp: 'https://pbs.twimg.com/profile_images/1851875588627435520/J5--F4Rq_400x400.jpg' },
  { username: '@stani', pfp: 'https://pbs.twimg.com/profile_images/1948082893432963072/kpCoKE30_400x400.jpg' },
  { username: '@haydenzadams', pfp: 'https://pbs.twimg.com/profile_images/1877781617227280385/SsgC-l4k_400x400.jpg' },
  { username: '@ryansadams', pfp: 'https://pbs.twimg.com/profile_images/1762551108252389376/dkRnTcQw_400x400.jpg' },
  { username: '@cdixon', pfp: 'https://pbs.twimg.com/profile_images/1947739462525505536/7pNlHSfl_400x400.png' },
  { username: '@fredwilson', pfp: 'https://pbs.twimg.com/profile_images/1951919825233862656/224qhxDU_400x400.png' },
  { username: '@elonmusk', pfp: 'https://pbs.twimg.com/profile_images/1875598166784913408/kZbn4GGW_400x400.jpg' }
];

function generateSolanaAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRealisticUsers(): UserData[] {
  const users: UserData[] = [];
  const totalAccepted = 300;
  const totalArrivals = 250; // Only 250 out of 300 actually came
  
  // Arrival patterns for the 250 people who actually came
  const arrivalPatterns = [
    { timeRange: [10, 10.5], percentage: 0.25 }, // 25% in first 30 minutes (10:00-10:30)
    { timeRange: [10.5, 11], percentage: 0.20 }, // 20% in next 30 minutes (10:30-11:00)
    { timeRange: [11, 12], percentage: 0.25 }, // 25% in next hour (11:00-12:00)
    { timeRange: [12, 14], percentage: 0.15 }, // 15% lunch time (12:00-14:00)
    { timeRange: [14, 16], percentage: 0.10 }, // 10% afternoon (14:00-16:00)
    { timeRange: [16, 22], percentage: 0.05 }  // 5% late arrivals (16:00-22:00)
  ];

  // Updated stay patterns with more variety
  const stayPatterns = [
    { minMinutes: 5, maxMinutes: 30, percentage: 0.10, name: 'very_quick' },      // 10% - very quick visits
    { minMinutes: 30, maxMinutes: 90, percentage: 0.15, name: 'quick_visits' },   // 15% - quick visits
    { minMinutes: 90, maxMinutes: 180, percentage: 0.25, name: 'short_stays' },   // 25% - short stays
    { minMinutes: 180, maxMinutes: 300, percentage: 0.25, name: 'medium_stays' }, // 25% - medium stays
    { minMinutes: 300, maxMinutes: 420, percentage: 0.15, name: 'long_stays' },   // 15% - long stays
    { minMinutes: 420, maxMinutes: 540, percentage: 0.10, name: 'very_long' }     // 10% - very long stays
  ];

  let userIndex = 0;

  // Generate users who actually arrived (250 people)
  arrivalPatterns.forEach(pattern => {
    const usersInPattern = Math.floor(totalArrivals * pattern.percentage);
    
    for (let i = 0; i < usersInPattern; i++) {
      // Random arrival time within the pattern range
      const arrivalHour = pattern.timeRange[0] + Math.random() * (pattern.timeRange[1] - pattern.timeRange[0]);
      const arrivalMinutes = Math.floor((arrivalHour % 1) * 60);
      const arrivalHourInt = Math.floor(arrivalHour);
      
      const arrivalTime = new Date(`2025-01-15T${arrivalHourInt.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}:00Z`);
      
      // Select stay pattern
      let selectedPattern = stayPatterns[0];
      const rand = Math.random();
      let cumulativeProb = 0;
      
      for (const stayPattern of stayPatterns) {
        cumulativeProb += stayPattern.percentage;
        if (rand <= cumulativeProb) {
          selectedPattern = stayPattern;
          break;
        }
      }
      
      // Calculate stay duration
      const stayMinutes = selectedPattern.minMinutes + 
        Math.random() * (selectedPattern.maxMinutes - selectedPattern.minMinutes);
      
      // Calculate departure time
      const departureTime = new Date(arrivalTime.getTime() + stayMinutes * 60 * 1000);
      
      // Ensure departure is not after 22:00 (event end)
      const eventEnd = new Date('2025-01-15T22:00:00Z');
      const finalDepartureTime = departureTime > eventEnd ? eventEnd : departureTime;
      
      // Determine current status (current time is 18:30)
      const currentTime = new Date('2025-01-15T18:30:00Z');
      let status: 'not_arrived' | 'present' | 'departed';
      
      if (arrivalTime > currentTime) {
        status = 'not_arrived';
      } else if (finalDepartureTime > currentTime) {
        status = 'present';
      } else {
        status = 'departed';
      }
      
      // Calculate check-ins based on stay duration (more check-ins for longer stays)
      const checkInCount = Math.max(1, Math.floor(stayMinutes / 90) + Math.floor(Math.random() * 3));
      
      // Calculate rewards based on check-ins and engagement
      const baseRewards = checkInCount * 50;
      const bonusRewards = Math.floor(Math.random() * 200);
      const totalRewards = baseRewards + bonusRewards;
      
      // Select random Twitter user (they repeat)
      const selectedUser = twitterUsers[userIndex % twitterUsers.length];
      
      users.push({
        userID: `user_${(userIndex + 1).toString().padStart(3, '0')}`,
        username: selectedUser.username,
        wallet: generateSolanaAddress(),
        pfp: selectedUser.pfp,
        arrival: arrivalTime.toISOString(),
        departure: finalDepartureTime.toISOString(),
        checkInCount,
        totalRewards,
        status
      });
      
      userIndex++;
    }
  });
  
  // Fill remaining arrivals if needed
  while (users.length < totalArrivals) {
    const arrivalTime = new Date(`2025-01-15T${10 + Math.floor(Math.random() * 7)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`);
    const stayMinutes = 60 + Math.random() * 300; // 1-6 hours
    const departureTime = new Date(arrivalTime.getTime() + stayMinutes * 60 * 1000);
    const eventEnd = new Date('2025-01-15T19:00:00Z');
    const finalDepartureTime = departureTime > eventEnd ? eventEnd : departureTime;
    
    const currentTime = new Date('2025-01-15T18:30:00Z');
    let status: 'not_arrived' | 'present' | 'departed';
    
    if (arrivalTime > currentTime) {
      status = 'not_arrived';
    } else if (finalDepartureTime > currentTime) {
      status = 'present';
    } else {
      status = 'departed';
    }
    
    const checkInCount = Math.max(1, Math.floor(stayMinutes / 90) + Math.floor(Math.random() * 3));
    const totalRewards = checkInCount * 50 + Math.floor(Math.random() * 200);
    
    const selectedUser = twitterUsers[users.length % twitterUsers.length];
    
    users.push({
      userID: `user_${users.length + 1}`,
      username: selectedUser.username,
      wallet: generateSolanaAddress(),
      pfp: selectedUser.pfp,
      arrival: arrivalTime.toISOString(),
      departure: finalDepartureTime.toISOString(),
      checkInCount,
      totalRewards,
      status
    });
  }
  
  // Add 50 people who were accepted but didn't show up
  const noShowCount = totalAccepted - totalArrivals; // 50 people
  for (let i = 0; i < noShowCount; i++) {
    const selectedUser = twitterUsers[users.length % twitterUsers.length];
    
    // These people have arrival/departure times but status is 'accepted_not_arrived'
    const plannedArrival = new Date(`2025-01-15T${10 + Math.floor(Math.random() * 12)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`);
    const plannedDeparture = new Date(plannedArrival.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000); // 2-6 hours planned stay
    
    users.push({
      userID: `user_${users.length + 1}`,
      username: selectedUser.username,
      wallet: generateSolanaAddress(),
      pfp: selectedUser.pfp,
      arrival: plannedArrival.toISOString(),
      departure: plannedDeparture.toISOString(),
      checkInCount: 0, // They didn't check in
      totalRewards: 0, // No rewards since they didn't come
      status: 'accepted_not_arrived'
    });
  }
  
  // Sort by planned arrival time
  return users.sort((a, b) => new Date(a.arrival).getTime() - new Date(b.arrival).getTime());
}

export const mockUsers = generateRealisticUsers();
