import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Trophy,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Star,
  Crown,
  Medal,
  Zap,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Commission {
  id: string
  applicationId: string
  applicantName: string
  serviceType: string
  amount: number
  commission: number
  status: 'pending' | 'approved' | 'paid'
  createdAt: string
  paidAt?: string
}

interface OfficerStats {
  totalCommissions: number
  monthlyCommissions: number
  applicationsProcessed: number
  rank: number
  target: number
  achievements: string[]
}

interface LeaderboardEntry {
  officerId: string
  officerName: string
  totalCommissions: number
  applicationsProcessed: number
  rank: number
  avatar?: string
}

interface CommissionTrackerProps {
  officerId: string
  className?: string
}

export const CommissionTracker: React.FC<CommissionTrackerProps> = ({ 
  officerId, 
  className = '' 
}) => {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [officerStats, setOfficerStats] = useState<OfficerStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCommissions: Commission[] = [
      {
        id: 'COM-001',
        applicationId: 'APP-001',
        applicantName: 'Ahmed Al-Rashid',
        serviceType: 'Wife Visa',
        amount: 1089,
        commission: 20,
        status: 'paid',
        createdAt: '2024-01-15',
        paidAt: '2024-01-20'
      },
      {
        id: 'COM-002',
        applicationId: 'APP-002',
        applicantName: 'Sarah Johnson',
        serviceType: 'Son Visa',
        amount: 1500,
        commission: 20,
        status: 'approved',
        createdAt: '2024-01-18'
      },
      {
        id: 'COM-003',
        applicationId: 'APP-003',
        applicantName: 'Mohammed Hassan',
        serviceType: 'Daughter Visa',
        amount: 1089,
        commission: 20,
        status: 'pending',
        createdAt: '2024-01-20'
      }
    ]

    const mockStats: OfficerStats = {
      totalCommissions: 60,
      monthlyCommissions: 40,
      applicationsProcessed: 15,
      rank: 3,
      target: 100,
      achievements: ['First 10 Applications', 'Monthly Target Achiever', 'Quality Excellence']
    }

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        officerId: 'OFF-001',
        officerName: 'Amer Officer 1',
        totalCommissions: 120,
        applicationsProcessed: 25,
        rank: 1
      },
      {
        officerId: 'OFF-002',
        officerName: 'Amer Officer 2',
        totalCommissions: 100,
        applicationsProcessed: 20,
        rank: 2
      },
      {
        officerId: officerId,
        officerName: 'You',
        totalCommissions: 60,
        applicationsProcessed: 15,
        rank: 3
      }
    ]

    setCommissions(mockCommissions)
    setOfficerStats(mockStats)
    setLeaderboard(mockLeaderboard)
  }, [officerId])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      paid: { color: 'bg-green-100 text-green-800', icon: DollarSign }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />
      default:
        return <Star className="w-5 h-5 text-blue-500" />
    }
  }

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('First')) return <Zap className="w-4 h-4 text-yellow-500" />
    if (achievement.includes('Target')) return <Target className="w-4 h-4 text-green-500" />
    if (achievement.includes('Quality')) return <Award className="w-4 h-4 text-purple-500" />
    return <Star className="w-4 h-4 text-blue-500" />
  }

  const progressPercentage = officerStats ? (officerStats.monthlyCommissions / officerStats.target) * 100 : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commission Tracker</h1>
          <p className="text-text-secondary">Track your earnings and compete with other officers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Commissions</p>
                <p className="text-xl font-bold text-foreground">AED {officerStats?.totalCommissions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Monthly Commissions</p>
                <p className="text-xl font-bold text-foreground">AED {officerStats?.monthlyCommissions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Applications Processed</p>
                <p className="text-xl font-bold text-foreground">{officerStats?.applicationsProcessed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                {getRankIcon(officerStats?.rank || 0)}
              </div>
              <div>
                <p className="text-sm text-text-secondary">Current Rank</p>
                <p className="text-xl font-bold text-foreground">#{officerStats?.rank || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Monthly Target Progress
          </CardTitle>
          <CardDescription>
            Track your progress towards the monthly commission target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AED {officerStats?.monthlyCommissions || 0} / AED {officerStats?.target || 0}</span>
              <span className="text-sm text-text-secondary">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {officerStats && officerStats.target - officerStats.monthlyCommissions > 0 
                  ? `AED ${officerStats.target - officerStats.monthlyCommissions} to reach target`
                  : 'Target achieved! 🎉'
                }
              </span>
              <Badge variant={progressPercentage >= 100 ? 'default' : 'outline'}>
                {progressPercentage >= 100 ? 'Target Achieved' : 'In Progress'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {officerStats?.achievements && officerStats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your recent accomplishments and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {officerStats.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  {getAchievementIcon(achievement)}
                  <span className="text-sm font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {showLeaderboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Officer Leaderboard
              </CardTitle>
              <CardDescription>
                Top performing Amer officers this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((officer) => (
                  <div
                    key={officer.officerId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      officer.officerId === officerId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-surface-light'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getRankIcon(officer.rank)}
                        <span className="font-bold text-lg">#{officer.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium">{officer.officerName}</p>
                        <p className="text-sm text-text-secondary">
                          {officer.applicationsProcessed} applications processed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">AED {officer.totalCommissions}</p>
                      <p className="text-sm text-text-secondary">Total commissions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Commission History
          </CardTitle>
          <CardDescription>
            Track all your commission earnings and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commission ID</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">{commission.id}</TableCell>
                    <TableCell>{commission.applicationId}</TableCell>
                    <TableCell>{commission.applicantName}</TableCell>
                    <TableCell>{commission.serviceType}</TableCell>
                    <TableCell>AED {commission.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">AED {commission.commission}</TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>{new Date(commission.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommissionTracker
