// Login page — authenticates existing users via JWT
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  // Form state and auth context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Submit credentials to the backend auth API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f0e8] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1f172f] to-[#2d2440] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#f3a76a] blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#7aa998] blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f3a76a] to-[#ad5f26] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="font-['Outfit'] font-bold text-2xl text-white">
              CampaignHub
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="font-['Outfit'] text-4xl font-bold text-white mb-4">
            Welcome back to your SMS marketing command center
          </h1>
          <p className="text-white/70 text-lg">
            Manage campaigns, engage with customers, and grow your business with powerful SMS marketing tools.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8">
          <div>
            <p className="font-['Outfit'] text-3xl font-bold text-white">10M+</p>
            <p className="text-white/60">Messages Sent</p>
          </div>
          <div>
            <p className="font-['Outfit'] text-3xl font-bold text-white">98%</p>
            <p className="text-white/60">Delivery Rate</p>
          </div>
          <div>
            <p className="font-['Outfit'] text-3xl font-bold text-white">5K+</p>
            <p className="text-white/60">Happy Users</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f3a76a] to-[#ad5f26] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="font-['Outfit'] font-bold text-2xl text-[#1f172f]">
                CampaignHub
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-[#1f172f]/8 p-8 shadow-xl shadow-[#1f172f]/5">
            <div className="text-center mb-8">
              <h2 className="font-['Outfit'] text-2xl font-bold text-[#1f172f] mb-2">
                Sign in to your account
              </h2>
              <p className="text-[#6f677b]">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="Email address"
                placeholder="you@example.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-[#6f677b]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#f3a76a] font-semibold hover:text-[#ad5f26] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
