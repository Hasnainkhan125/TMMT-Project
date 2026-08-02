import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthView = 'login' | 'signup' | 'forgot-password';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export const AuthDrawer: React.FC<AuthDrawerProps> = ({
  isOpen,
  onClose,
  initialView = 'login'
}) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
  };

  const handleAppleSignIn = () => {
    console.log('Apple Sign In');
  };

  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentView === 'login') {
      console.log('Login with', email, password);
    } else if (currentView === 'signup') {
      console.log('Sign up with', fullName, email, password);
    } else {
      console.log('Reset password for', email);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const switchView = (newView: AuthView) => {
    const viewOrder: AuthView[] = ['login', 'signup', 'forgot-password'];
    const currentIndex = viewOrder.indexOf(currentView);
    const newIndex = viewOrder.indexOf(newView);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentView(newView);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content with smooth scroll */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="px-8 py-12 min-h-full flex flex-col">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentView}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Header */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentView === 'login' && t('auth.login')}
                        {currentView === 'signup' && t('auth.createYourAccount')}
                        {currentView === 'forgot-password' && t('auth.resetPassword')}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {currentView === 'login' && t('auth.welcomeBack')}
                        {currentView === 'signup' && (
                          <span>
                            {t('auth.getMostOutOf')} <span className="font-semibold">{t('auth.tammat')}</span>
                          </span>
                        )}
                        {currentView === 'forgot-password' && t('auth.resetLinkSentDescription')}
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleEmailPasswordSubmit} className="space-y-4 flex-1 flex flex-col">
                      {currentView === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                            {t('auth.fullName')}
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="fullName"
                              type="text"
                              placeholder={t('auth.enterFullName')}
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: currentView === 'signup' ? 0.2 : 0.1 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          {t('auth.email')}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder={t('auth.enterEmail')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </motion.div>

                      {currentView !== 'forgot-password' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: currentView === 'signup' ? 0.3 : 0.2 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                              {t('auth.password')}
                            </Label>
                            {currentView === 'login' && (
                              <button
                                type="button"
                                onClick={() => switchView('forgot-password')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {t('auth.forgotPasswordQuestion')}
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="password"
                              type="password"
                              placeholder={t('auth.enterPassword')}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="pt-2"
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                        >
                          {currentView === 'login' && t('auth.logIn')}
                          {currentView === 'signup' && t('auth.signUp')}
                          {currentView === 'forgot-password' && t('auth.sendResetLink')}
                        </Button>
                      </motion.div>

                      {/* Divider */}
                      {currentView !== 'forgot-password' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex items-center gap-3 py-4"
                        >
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-sm text-gray-500">{t('auth.or')}</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </motion.div>
                      )}

                      {/* Social Sign In */}
                      {currentView !== 'forgot-password' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="space-y-3"
                        >
                          <Button
                            type="button"
                            onClick={handleGoogleSignIn}
                            variant="outline"
                            className="w-full h-12 border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            {t('auth.continueWithGoogle')}
                          </Button>

                          <Button
                            type="button"
                            onClick={handleAppleSignIn}
                            variant="outline"
                            className="w-full h-12 border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
                          >
                            <Apple className="w-5 h-5" />
                            {t('auth.continueWithApple')}
                          </Button>
                        </motion.div>
                      )}

                      {/* Footer Links */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="pt-6 text-center space-y-3 mt-auto"
                      >
                        {currentView === 'login' && (
                          <p className="text-sm text-gray-600">
                            {t('auth.firstTimeHere')}{' '}
                            <button
                              type="button"
                              onClick={() => switchView('signup')}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {t('auth.createAccount')}
                            </button>
                          </p>
                        )}

                        {currentView === 'signup' && (
                          <p className="text-sm text-gray-600">
                            {t('auth.alreadyHaveAccount')}{' '}
                            <button
                              type="button"
                              onClick={() => switchView('login')}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {t('auth.logIn')}
                            </button>
                          </p>
                        )}

                        {currentView === 'forgot-password' && (
                          <button
                            type="button"
                            onClick={() => switchView('login')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {t('auth.backToSignIn')}
                          </button>
                        )}
                      </motion.div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Image - Mobile Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 pointer-events-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent h-20 -top-20" />
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400'%3E%3Crect width='200' height='400' rx='30' fill='%23000'/%3E%3Crect x='10' y='10' width='180' height='380' rx='25' fill='%23111'/%3E%3Crect x='20' y='30' width='160' height='280' rx='15' fill='%230066FF'/%3E%3C/svg%3E"
                  alt="Mobile Preview"
                  className="w-full opacity-20"
                />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


