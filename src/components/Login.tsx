import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { Lock, Mail, Users, ArrowRight, Building2, Sparkles, Heart, Zap } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success('Login successful!');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: Users, delay: 0, x: -100, y: -50 },
    { Icon: Heart, delay: 1, x: 100, y: -30 },
    { Icon: Zap, delay: 2, x: -80, y: 50 },
    { Icon: Sparkles, delay: 3, x: 80, y: 40 },
  ];

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/30"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating Icons */}
        {floatingIcons.map(({ Icon, delay, x, y }, index) => (
          <motion.div
            key={`icon-${index}`}
            className="absolute opacity-20"
            initial={{ x, y, scale: 0, rotate: 0 }}
            animate={{
              x: [x, x + 20, x - 20, x],
              y: [y, y - 30, y + 30, y],
              scale: [0, 1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + index * 20}%`,
              top: `${20 + index * 15}%`,
            }}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>
        ))}
      </div>

      {/* Main Login Card */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">

              {/* Login Form */}
              <motion.div
                className="p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.div
                  className="text-center mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Sign In</h2>
                  <p className="text-gray-600 text-sm">Access your account</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    className="space-y-2"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300"
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300"
                          disabled={isLoading}
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r bg-gray-600 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        disabled={isLoading}
                      >
                        <AnimatePresence mode="wait">
                          {isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <motion.div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                                Signing in...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="signin"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center gap-2"
                            >
                              <motion.div
                                whileHover={{ x: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                Sign In
                              </motion.div>
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>

                {/* Footer */}
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <p className="text-xs text-gray-500">
                    © 2024 Advanced HR Management System
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
