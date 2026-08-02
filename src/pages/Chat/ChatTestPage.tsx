import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import ChatInterface from '@/components/ui/chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wifi, 
  WifiOff, 
  MessageCircle, 
  Phone, 
  Video, 
  Users, 
  Settings,
  LogIn,
  LogOut
} from 'lucide-react';

const ChatTestPage: React.FC = () => {
  const [authToken, setAuthToken] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('immigration-officer-001');
  const [showChat, setShowChat] = useState(false);

  const {
    isConnected,
    currentRoom,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    getConnectedUsers,
    getConnectedOfficers,
    getChatRooms,
    connectionError
  } = useWebSocket({
    onMessage: (message) => {
      console.log('New message received:', message);
    },
    onRoomJoined: (room) => {
      console.log('Joined room:', room);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  const mockOfficers = [
    { id: 'immigration-officer-001', name: 'Officer Ahmed', status: 'online', specialty: 'Family Visa' },
    { id: 'immigration-officer-002', name: 'Officer Sarah', status: 'online', specialty: 'Business Visa' },
    { id: 'immigration-officer-003', name: 'Officer Mohammed', status: 'away', specialty: 'Student Visa' },
    { id: 'immigration-officer-004', name: 'Officer Fatima', status: 'offline', specialty: 'Tourist Visa' }
  ];

  const handleConnect = () => {
    if (authToken.trim()) {
      connect(authToken);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleStartChat = () => {
    if (isConnected && selectedOfficer) {
      setShowChat(true);
    }
  };

  const handleEndChat = () => {
    if (currentRoom) {
      leaveRoom(currentRoom, 'user');
    }
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            TAMMAT WebSocket Chat Test
          </h1>
          <p className="text-lg text-text-secondary">
            Test real-time communication with immigration officers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-token">Authentication Token</Label>
                <Input
                  id="auth-token"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Enter JWT token..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleConnect}
                  disabled={!authToken.trim() || isConnected}
                  className="flex-1"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={!isConnected}
                  variant="outline"
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>

                {currentRoom && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Room:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {currentRoom}
                    </Badge>
                  </div>
                )}

                {connectionError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {connectionError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Officers Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Available Officers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {mockOfficers.map((officer) => (
                  <div
                    key={officer.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOfficer === officer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:border-border'
                    }`}
                    onClick={() => setSelectedOfficer(officer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">
                          {officer.name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {officer.specialty}
                        </div>
                      </div>
                      <Badge
                        variant={
                          officer.status === 'online'
                            ? 'default'
                            : officer.status === 'away'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {officer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleStartChat}
                disabled={!isConnected || !selectedOfficer}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showChat ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      Chatting with: {mockOfficers.find(o => o.id === selectedOfficer)?.name}
                    </span>
                    <Button
                      onClick={handleEndChat}
                      variant="outline"
                      size="sm"
                    >
                      End Chat
                    </Button>
                  </div>
                  <div className="h-96 overflow-hidden">
                    <ChatInterface
                      officerId={selectedOfficer}
                      officerName={mockOfficers.find(o => o.id === selectedOfficer)?.name || 'Officer'}
                      isConnected={isConnected}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select an officer and start chatting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* WebSocket Stats */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  WebSocket Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {isConnected ? 'Active' : 'Inactive'}
                    </div>
                    <div className="text-sm text-blue-600">Connection</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {currentRoom ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-green-600">Room Joined</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {mockOfficers.filter(o => o.status === 'online').length}
                    </div>
                    <div className="text-sm text-purple-600">Officers Online</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatTestPage; 