import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  User,
  Shield,
  Lock,
  UserCog,
  Save,
  Mail,
  Phone,
  Palette,
  Eye,
  EyeOff,
  Users,
  Share2,
  Activity,
  Key,
  Trash2,
  UserX,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserSettings,
  saveUserSettings,
  getCollaborationCount,
  changePassword,
  deactivateAccount,
  deleteAccount,
  toggleTwoFactor,
  type UserSettings,
} from "../utils/settingsStorage";

interface SettingsPageProps {
  userName: string;
  userEmail: string;
  userPhone?: string;
  isDarkMode: boolean;
  onBack: () => void;
  onSaveProfile: (name: string, email: string, phone: string) => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onLogout?: () => void;
}

type SettingsTab = "profile" | "privacy" | "security" | "theme" | "account";

export function SettingsPage({
  userName,
  userEmail,
  userPhone,
  isDarkMode,
  onBack,
  onSaveProfile,
  onThemeChange,
  onLogout,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editPhone, setEditPhone] = useState(userPhone || "");
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>(getUserSettings(userEmail));
  const [collaborationCount, setCollaborationCount] = useState(0);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setSettings(getUserSettings(userEmail));
    setCollaborationCount(getCollaborationCount(userEmail));
  }, [userEmail]);

  const tabs: { id: SettingsTab; label: string; iconSrc: string }[] = [
    { id: "profile", label: "Profile Settings", iconSrc: "/icons/3d/user.svg" },
    { id: "privacy", label: "Privacy", iconSrc: "/icons/3d/shield.svg" },
    { id: "security", label: "Security", iconSrc: "/icons/3d/lock.svg" },
    { id: "theme", label: "Theme", iconSrc: "/icons/3d/palette.svg" },
    { id: "account", label: "Account", iconSrc: "/icons/3d/settings.svg" },
  ];

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveUserSettings(userEmail, newSettings);
  };

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (changePassword(userEmail, oldPassword, newPassword)) {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Current password is incorrect");
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.")) {
      if (confirm("This is your final warning. Delete account permanently?")) {
        deleteAccount(userEmail);
        toast.success("Account deleted successfully");
        setTimeout(() => onLogout?.(), 1500);
      }
    }
  };

  const handleDeactivateAccount = () => {
    if (confirm("Are you sure you want to deactivate your account? You can reactivate it later by logging in.")) {
      deactivateAccount(userEmail);
      toast.success("Account deactivated");
      setTimeout(() => onLogout?.(), 1500);
    }
  };

  const handleSave = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!editEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    // Save to localStorage
    localStorage.setItem(`user_name_${userEmail}`, editName);
    if (editEmail !== userEmail) {
      // Handle email change - migrate data
      const oldPassword = localStorage.getItem(`user_password_${userEmail}`);
      const oldPhone = localStorage.getItem(`user_phone_${userEmail}`);
      
      if (oldPassword) localStorage.setItem(`user_password_${editEmail}`, oldPassword);
      if (editPhone) localStorage.setItem(`user_phone_${editEmail}`, editPhone);
      localStorage.setItem(`user_name_${editEmail}`, editName);
      
      // Remove old entries
      localStorage.removeItem(`user_password_${userEmail}`);
      localStorage.removeItem(`user_phone_${userEmail}`);
      localStorage.removeItem(`user_name_${userEmail}`);
    } else {
      if (editPhone) localStorage.setItem(`user_phone_${userEmail}`, editPhone);
    }

    onSaveProfile(editName, editEmail, editPhone);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditName(userName);
    setEditEmail(userEmail);
    setEditPhone(userPhone || "");
    setIsEditing(false);
  };

  return (
    <div
      className="min-h-screen settings-page-container"
      style={{
        background: isDarkMode ? "#0a0a0a" : "#f5f5f5",
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          background: isDarkMode ? "#000000" : "#FFFFFF",
          borderColor: isDarkMode ? "#1f2937" : "#e5e7eb",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full"
              style={{
                border: isDarkMode ? "2px solid #4b5563" : "2px solid #FFD700",
              }}
            >
              <ArrowLeft
                className="w-5 h-5"
                style={{
                  color: isDarkMode ? "#fbbf24" : "#FFD700",
                }}
              />
            </Button>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                }}
              >
                Settings
              </h1>
              <p
                className="text-sm"
                style={{
                  color: isDarkMode ? "#CCCCCC" : "#666666",
                }}
              >
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div
              className="rounded-lg p-2"
              style={{
                background: isDarkMode ? "#000000" : "#FFFFFF",
                border: isDarkMode ? "1px solid #1f2937" : "1px solid #e5e7eb",
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(255, 207, 64, 0.5)' : 'rgba(255, 207, 64, 0.3)',
                      border: '2px solid #000000',
                      color: '#000000',
                      boxShadow: isActive ? '0 2px 8px rgba(255, 207, 64, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.2)',
                      fontWeight: isActive ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 207, 64, 0.45)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 207, 64, 0.3)';
                      }
                    }}
                  >
                    <img src={tab.iconSrc} alt={tab.label} style={{ width: '20px', height: '20px' }} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg p-6"
              style={{
                background: isDarkMode ? "#000000" : "#FFFFFF",
                border: isDarkMode ? "1px solid #1f2937" : "1px solid #e5e7eb",
              }}
            >
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Profile Settings
                      </h2>
                      <p
                        className="text-sm mt-1"
                        style={{
                          color: isDarkMode ? "#CCCCCC" : "#666666",
                        }}
                      >
                        Update your personal information
                      </p>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                          color: "#FFFFFF",
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <Label
                        htmlFor="name"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Full Name
                      </Label>
                      <div className="relative mt-2">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        />
                        <Input
                          id="name"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          style={{
                            background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label
                        htmlFor="email"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Email Address
                      </Label>
                      <div className="relative mt-2">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        />
                        <Input
                          id="email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          style={{
                            background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <Label
                        htmlFor="phone"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Phone Number
                      </Label>
                      <div className="relative mt-2">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        />
                        <Input
                          id="phone"
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter phone number"
                          className="pl-10"
                          style={{
                            background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSave}
                          className="flex items-center gap-2"
                          style={{
                            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          style={{
                            borderColor: isDarkMode ? "#374151" : "#d1d5db",
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode ? "#FFFFFF" : "#000000",
                      }}
                    >
                      Privacy Settings
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: isDarkMode ? "#CCCCCC" : "#666666",
                      }}
                    >
                      Control your data and privacy preferences
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Visibility */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Shield
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Profile Visibility
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            {settings.profileVisibility === "public"
                              ? "Your profile is visible to everyone"
                              : "Your profile is only visible to you"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.profileVisibility === "public"}
                        onCheckedChange={(checked) => {
                          updateSettings({ profileVisibility: checked ? "public" : "private" });
                          toast.success(
                            `Profile is now ${checked ? "public" : "private"}`
                          );
                        }}
                      />
                    </div>

                    {/* Collaboration Count */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Users
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Active Collaborations
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Number of shared spreadsheets you're collaborating on
                          </p>
                        </div>
                      </div>
                      <Badge
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "6px 12px",
                        }}
                      >
                        {collaborationCount}
                      </Badge>
                    </div>

                    {/* Allow Collaborations */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Users
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Allow Collaborations
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Let others invite you to collaborate on spreadsheets
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allowCollaborations}
                        onCheckedChange={(checked) => {
                          updateSettings({ allowCollaborations: checked });
                          toast.success(
                            `Collaborations ${checked ? "enabled" : "disabled"}`
                          );
                        }}
                      />
                    </div>

                    {/* Allow Sharing */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Share2
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Allow Sharing
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Let others share your spreadsheets with third parties
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allowSharing}
                        onCheckedChange={(checked) => {
                          updateSettings({ allowSharing: checked });
                          toast.success(`Sharing ${checked ? "enabled" : "disabled"}`);
                        }}
                      />
                    </div>

                    {/* Show Activity Status */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Activity
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Show Activity Status
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Display your online/offline status to collaborators
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.showActivityStatus}
                        onCheckedChange={(checked) => {
                          updateSettings({ showActivityStatus: checked });
                          toast.success(
                            `Activity status ${checked ? "visible" : "hidden"}`
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode ? "#FFFFFF" : "#000000",
                      }}
                    >
                      Security Settings
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: isDarkMode ? "#CCCCCC" : "#666666",
                      }}
                    >
                      Manage your password and security options
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Password Change Section */}
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Key
                          className="w-5 h-5"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <Label
                          style={{
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          Change Password
                        </Label>
                      </div>

                      <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <Label
                            htmlFor="old-password"
                            style={{
                              color: isDarkMode ? "#CCCCCC" : "#666666",
                            }}
                          >
                            Current Password
                          </Label>
                          <div className="relative mt-2">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            />
                            <Input
                              id="old-password"
                              type={showOldPassword ? "text" : "password"}
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="pl-10 pr-10"
                              style={{
                                background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showOldPassword ? (
                                <EyeOff
                                  className="w-5 h-5"
                                  style={{
                                    color: isDarkMode ? "#999999" : "#666666",
                                  }}
                                />
                              ) : (
                                <Eye
                                  className="w-5 h-5"
                                  style={{
                                    color: isDarkMode ? "#999999" : "#666666",
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <Label
                            htmlFor="new-password"
                            style={{
                              color: isDarkMode ? "#CCCCCC" : "#666666",
                            }}
                          >
                            New Password
                          </Label>
                          <div className="relative mt-2">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            />
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password (min 6 characters)"
                              className="pl-10 pr-10"
                              style={{
                                background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showNewPassword ? (
                                <EyeOff
                                  className="w-5 h-5"
                                  style={{
                                    color: isDarkMode ? "#999999" : "#666666",
                                  }}
                                />
                              ) : (
                                <Eye
                                  className="w-5 h-5"
                                  style={{
                                    color: isDarkMode ? "#999999" : "#666666",
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <Label
                            htmlFor="confirm-password"
                            style={{
                              color: isDarkMode ? "#CCCCCC" : "#666666",
                            }}
                          >
                            Confirm New Password
                          </Label>
                          <div className="relative mt-2">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            />
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              className="pl-10 pr-10"
                              style={{
                                background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showConfirmPassword ? (
                                <EyeOff
                                  className="w-5 h-5"
                                  style={{
                                    color: isDarkMode ? "#999999" : "#666666",
                                  }}
                                />
                              ) : (
                                <Eye
                                  className="w-5 h-5"
                                  style={{
                                    color: isDarkMode ? "#999999" : "#666666",
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        <Button
                          onClick={handlePasswordChange}
                          className="w-full mt-4"
                          style={{
                            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>

                        {settings.lastPasswordChange && (
                          <p
                            className="text-xs text-center mt-2"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Last changed: {new Date(settings.lastPasswordChange).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Shield
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Two-Factor Authentication
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          toggleTwoFactor(userEmail, checked);
                          updateSettings({ twoFactorEnabled: checked });
                          toast.success(
                            `Two-factor authentication ${checked ? "enabled" : "disabled"}`
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "theme" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode ? "#FFFFFF" : "#000000",
                      }}
                    >
                      Theme Settings
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: isDarkMode ? "#CCCCCC" : "#666666",
                      }}
                    >
                      Choose your preferred color theme
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Light Theme */}
                    <button
                      onClick={() => {
                        updateSettings({ theme: "light" });
                        onThemeChange?.("light");
                        toast.success("Theme changed to Light");
                      }}
                      className="w-full flex items-center gap-4 p-6 rounded-lg transition-all duration-200"
                      style={{
                        background: settings.theme === "light"
                          ? "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)"
                          : isDarkMode
                          ? "#1a1a1a"
                          : "#f9fafb",
                        border: settings.theme === "light"
                          ? "2px solid #FFD700"
                          : isDarkMode
                          ? "1px solid #374151"
                          : "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        }}
                      >
                        <Sun className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className="font-semibold"
                          style={{
                            color: settings.theme === "light"
                              ? "#FFD700"
                              : isDarkMode
                              ? "#FFFFFF"
                              : "#000000",
                          }}
                        >
                          Light Mode
                        </div>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        >
                          Bright and clean interface for daytime use
                        </p>
                      </div>
                      {settings.theme === "light" && (
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{
                            background: "#FFD700",
                            border: "2px solid #FFFFFF",
                          }}
                        />
                      )}
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => {
                        updateSettings({ theme: "dark" });
                        onThemeChange?.("dark");
                        toast.success("Theme changed to Dark");
                      }}
                      className="w-full flex items-center gap-4 p-6 rounded-lg transition-all duration-200"
                      style={{
                        background: settings.theme === "dark"
                          ? "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)"
                          : isDarkMode
                          ? "#1a1a1a"
                          : "#f9fafb",
                        border: settings.theme === "dark"
                          ? "2px solid #FFD700"
                          : isDarkMode
                          ? "1px solid #374151"
                          : "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #4B5563 0%, #1F2937 100%)",
                        }}
                      >
                        <Moon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className="font-semibold"
                          style={{
                            color: settings.theme === "dark"
                              ? "#FFD700"
                              : isDarkMode
                              ? "#FFFFFF"
                              : "#000000",
                          }}
                        >
                          Dark Mode
                        </div>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        >
                          Easy on the eyes for low-light environments
                        </p>
                      </div>
                      {settings.theme === "dark" && (
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{
                            background: "#FFD700",
                            border: "2px solid #FFFFFF",
                          }}
                        />
                      )}
                    </button>

                    {/* System Theme */}
                    <button
                      onClick={() => {
                        updateSettings({ theme: "system" });
                        onThemeChange?.("system");
                        toast.success("Theme changed to System");
                      }}
                      className="w-full flex items-center gap-4 p-6 rounded-lg transition-all duration-200"
                      style={{
                        background: settings.theme === "system"
                          ? "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)"
                          : isDarkMode
                          ? "#1a1a1a"
                          : "#f9fafb",
                        border: settings.theme === "system"
                          ? "2px solid #FFD700"
                          : isDarkMode
                          ? "1px solid #374151"
                          : "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                        }}
                      >
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className="font-semibold"
                          style={{
                            color: settings.theme === "system"
                              ? "#FFD700"
                              : isDarkMode
                              ? "#FFFFFF"
                              : "#000000",
                          }}
                        >
                          System Default
                        </div>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        >
                          Automatically match your device's theme
                        </p>
                      </div>
                      {settings.theme === "system" && (
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{
                            background: "#FFD700",
                            border: "2px solid #FFFFFF",
                          }}
                        />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode ? "#FFFFFF" : "#000000",
                      }}
                    >
                      Account Settings
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: isDarkMode ? "#CCCCCC" : "#666666",
                      }}
                    >
                      Manage your account preferences and status
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Account Status */}
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserCog
                            className="w-5 h-5"
                            style={{
                              color: "#FFD700",
                            }}
                          />
                          <div>
                            <Label
                              style={{
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                fontWeight: 600,
                              }}
                            >
                              Account Status
                            </Label>
                            <p
                              className="text-sm mt-1"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            >
                              Your account is currently{" "}
                              {settings.accountStatus === "active" ? "active" : "deactivated"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          style={{
                            background:
                              settings.accountStatus === "active"
                                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                                : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          {settings.accountStatus === "active" ? "Active" : "Deactivated"}
                        </Badge>
                      </div>
                    </div>

                    {/* Profile Visibility Status */}
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield
                            className="w-5 h-5"
                            style={{
                              color: "#FFD700",
                            }}
                          />
                          <div>
                            <Label
                              style={{
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                fontWeight: 600,
                              }}
                            >
                              Profile Visibility
                            </Label>
                            <p
                              className="text-sm mt-1"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            >
                              Your profile is{" "}
                              {settings.profileVisibility === "public" ? "public" : "private"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          style={{
                            background:
                              settings.profileVisibility === "public"
                                ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                                : "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          {settings.profileVisibility === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#FEF2F2",
                        border: isDarkMode ? "1px solid #7F1D1D" : "1px solid #FCA5A5",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Trash2
                          className="w-5 h-5"
                          style={{
                            color: "#EF4444",
                          }}
                        />
                        <Label
                          style={{
                            color: "#EF4444",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          Danger Zone
                        </Label>
                      </div>

                      <div className="space-y-4">
                        {/* Deactivate Account */}
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div
                                className="font-semibold mb-1"
                                style={{
                                  color: isDarkMode ? "#FFFFFF" : "#000000",
                                }}
                              >
                                Deactivate Account
                              </div>
                              <p
                                className="text-sm"
                                style={{
                                  color: isDarkMode ? "#999999" : "#666666",
                                }}
                              >
                                Temporarily disable your account. You can reactivate it anytime by
                                logging in again.
                              </p>
                            </div>
                            <Button
                              onClick={handleDeactivateAccount}
                              variant="outline"
                              style={{
                                borderColor: "#F59E0B",
                                color: "#F59E0B",
                                background: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
                                e.currentTarget.style.color = "#FFFFFF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#F59E0B";
                              }}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </Button>
                          </div>
                        </div>

                        {/* Delete Account */}
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div
                                className="font-semibold mb-1"
                                style={{
                                  color: isDarkMode ? "#FFFFFF" : "#000000",
                                }}
                              >
                                Delete Account
                              </div>
                              <p
                                className="text-sm"
                                style={{
                                  color: isDarkMode ? "#999999" : "#666666",
                                }}
                              >
                                Permanently delete your account and all associated data. This
                                action cannot be undone.
                              </p>
                            </div>
                            <Button
                              onClick={handleDeleteAccount}
                              variant="outline"
                              style={{
                                borderColor: "#EF4444",
                                color: "#EF4444",
                                background: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
                                e.currentTarget.style.color = "#FFFFFF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#EF4444";
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
