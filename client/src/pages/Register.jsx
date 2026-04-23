// Register page — creates a new user account and redirects to dashboard
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  // Registration form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company_name: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate passwords and submit registration to the API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
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
            Start your SMS marketing journey today
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Join thousands of businesses using CampaignHub to connect with their customers through powerful SMS campaigns.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              'Send personalized SMS campaigns to thousands',
              'Track delivery and engagement in real-time',
              'Manage contacts with smart segmentation',
              'Two-way messaging with unified inbox',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#7aa998] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <p className="text-white/90 italic mb-4">
            "CampaignHub transformed how we communicate with our customers. The delivery rates are incredible!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f3a76a] to-[#ad5f26] flex items-center justify-center text-white font-semibold">
              S
            </div>
            <div>
              <p className="text-white font-medium">Sarah Johnson</p>
              <p className="text-white/60 text-sm">Marketing Director, TechCorp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
                Create your account
              </h2>
              <p className="text-[#6f677b]">
                Get started with your free CampaignHub account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                label="Full name"
                placeholder="John Doe"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                type="email"
                name="email"
                label="Email address"
                placeholder="you@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                type="text"
                name="company_name"
                label="Company name (optional)"
                placeholder="Your company"
                icon={Building2}
                value={formData.company_name}
                onChange={handleChange}
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Create a strong password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm password"
                placeholder="Confirm your password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
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
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-[#6f677b]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#f3a76a] font-semibold hover:text-[#ad5f26] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
