import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import Select from '../components/ui/Select.tsx';
import Tabs from '../components/ui/Tabs.tsx';
import '../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Settings page with tabbed interface for different setting categories.
 * Includes theme preview, account settings, and notification preferences.
 */
export default function Settings() {
  const { mode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Settings</h1>
        <p className="muted">Manage your account and application preferences</p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} variant="default" />
      </div>

      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <Card>
            <CardHeader title="Profile" subtitle="Update your personal information" />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <Input label="Display Name" placeholder="John Doe" />
                <Input label="Email" type="email" placeholder="john@example.com" />
                <Input
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  helperText="Brief description for your profile"
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Preferences" subtitle="Customize your experience" />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <Select
                  label="Language"
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' },
                  ]}
                />
                <Select
                  label="Timezone"
                  options={[
                    { value: 'utc', label: 'UTC' },
                    { value: 'est', label: 'EST' },
                    { value: 'pst', label: 'PST' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <Card>
          <CardHeader title="Appearance" subtitle="Customize the look and feel" />
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  Theme Mode
                </label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <Button
                    variant={mode === 'light' ? 'primary' : 'ghost'}
                    onClick={() => mode === 'dark' && toggleTheme()}
                  >
                    ☀️ Light
                  </Button>
                  <Button
                    variant={mode === 'dark' ? 'primary' : 'ghost'}
                    onClick={() => mode === 'light' && toggleTheme()}
                  >
                    🌙 Dark
                  </Button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  Theme Preview
                </label>
                <div
                  style={{
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-alt)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary)',
                        color: 'white',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Primary
                    </div>
                    <div
                      style={{
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-secondary)',
                        color: 'white',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Secondary
                    </div>
                    <div
                      style={{
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-success)',
                        color: 'white',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Success
                    </div>
                    <div
                      style={{
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-error)',
                        color: 'white',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Error
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  Reduce motion (respects system preference)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader title="Notifications" subtitle="Manage notification preferences" />
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <label>
                <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
                Email notifications
              </label>
              <label>
                <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
                Real-time updates
              </label>
              <label>
                <input type="checkbox" style={{ marginRight: '8px' }} />
                Marketing emails
              </label>
              <label>
                <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
                Security alerts
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <Card>
            <CardHeader title="Password" subtitle="Change your password" />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <Input label="Current Password" type="password" />
                <Input label="New Password" type="password" />
                <Input label="Confirm New Password" type="password" />
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="primary">Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security" />
            <CardContent>
              <p className="muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                Two-factor authentication is currently disabled.
              </p>
              <Button variant="secondary">Enable 2FA</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
