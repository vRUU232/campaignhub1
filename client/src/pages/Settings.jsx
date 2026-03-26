import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Key,
  Shield,
  Bell,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, settingsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'twilio', label: 'Twilio', icon: Phone },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-3xl font-bold text-[#1f172f]">Settings</h1>
        <p className="text-[#6f677b] mt-1">
          Manage your account and integration settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1f172f]/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#f3a76a] text-[#f3a76a]'
                : 'border-transparent text-[#6f677b] hover:text-[#1f172f]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'twilio' && <TwilioSettings />}
      {activeTab === 'security' && <SecuritySettings />}
    </div>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TwilioSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSid, setShowSid] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    account_sid: '',
    auth_token: '',
    phone_number: '',
    messaging_service_sid: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getTwilio();
      if (res.data.settings) {
        setFormData({
          account_sid: res.data.settings.account_sid || '',
          auth_token: '', // Never returned from server
          phone_number: res.data.settings.phone_number || '',
          messaging_service_sid: res.data.settings.messaging_service_sid || '',
        });
        setStatus(res.data.settings.is_verified ? 'verified' : 'not_verified');
      }
    } catch {
      // No settings yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.updateTwilio(formData);
      toast.success('Twilio settings saved');
      setStatus('not_verified');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);

    try {
      await settingsAPI.testTwilio();
      toast.success('Twilio connection verified!');
      setStatus('verified');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Twilio connection failed');
      setStatus('failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#f3a76a]" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border-l-4 ${
        status === 'verified' ? 'border-l-[#7aa998]' :
        status === 'failed' ? 'border-l-red-500' :
        'border-l-[#f3a76a]'
      }`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {status === 'verified' ? (
              <CheckCircle className="w-6 h-6 text-[#7aa998]" />
            ) : (
              <AlertCircle className={`w-6 h-6 ${status === 'failed' ? 'text-red-500' : 'text-[#f3a76a]'}`} />
            )}
            <div>
              <p className="font-medium text-[#1f172f]">
                {status === 'verified' ? 'Twilio Connected' :
                 status === 'failed' ? 'Connection Failed' :
                 'Twilio Not Configured'}
              </p>
              <p className="text-sm text-[#6f677b]">
                {status === 'verified' ? 'Your Twilio account is connected and ready to send messages' :
                 status === 'failed' ? 'Please check your credentials and try again' :
                 'Configure your Twilio credentials to start sending SMS'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Form */}
      <Card>
        <CardHeader>
          <CardTitle>Twilio Credentials</CardTitle>
          <CardDescription>
            Enter your Twilio account credentials. You can find these in your{' '}
            <a
              href="https://console.twilio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f3a76a] hover:underline"
            >
              Twilio Console
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5 max-w-lg">
            <div className="relative">
              <Input
                label="Account SID"
                type={showSid ? 'text' : 'password'}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.account_sid}
                onChange={(e) => setFormData({ ...formData, account_sid: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowSid(!showSid)}
                className="absolute right-3 top-9 text-[#6f677b] hover:text-[#1f172f]"
              >
                {showSid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Auth Token"
                type={showToken ? 'text' : 'password'}
                placeholder="Enter your Auth Token"
                value={formData.auth_token}
                onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-9 text-[#6f677b] hover:text-[#1f172f]"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <p className="text-xs text-[#6f677b] mt-1">
                Leave blank to keep existing token
              </p>
            </div>

            <Input
              label="Twilio Phone Number"
              placeholder="+1234567890"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
            />

            <Input
              label="Messaging Service SID (optional)"
              placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={formData.messaging_service_sid}
              onChange={(e) => setFormData({ ...formData, messaging_service_sid: e.target.value })}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving}>
                Save Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                loading={testing}
                disabled={!formData.account_sid || !formData.phone_number}
              >
                Test Connection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#f6f0e8] rounded-xl">
              <h4 className="font-medium text-[#1f172f] mb-2">Getting Started with Twilio</h4>
              <ol className="text-sm text-[#6f677b] space-y-1 list-decimal list-inside">
                <li>Sign up at twilio.com</li>
                <li>Get your Account SID and Auth Token</li>
                <li>Purchase a phone number</li>
                <li>Enter credentials above</li>
              </ol>
            </div>
            <div className="p-4 bg-[#f6f0e8] rounded-xl">
              <h4 className="font-medium text-[#1f172f] mb-2">Webhook Setup</h4>
              <p className="text-sm text-[#6f677b] mb-2">
                Configure your Twilio webhook URL to receive replies:
              </p>
              <code className="text-xs bg-white px-2 py-1 rounded text-[#1f172f] block overflow-x-auto">
                {window.location.origin.replace('3000', '5000')}/api/webhooks/twilio
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.updateProfile({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      toast.success('Password updated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <Input
            label="Current Password"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          <Button type="submit" loading={loading}>
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
