import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  Sparkles,
  FileText,
  BarChart3,
  FileSpreadsheet,
  Upload,
  Users,
  Shield,
  MessageSquare,
  Search,
  Bug,
  Lightbulb,
  Info,
  FileQuestion,
  Mail,
} from "lucide-react";
import { HelpPanel } from "../help/HelpPanel";
import { BugReportModal } from "../help/BugReportModal";
import { FeatureRequestModal } from "../help/FeatureRequestModal";
import { KeyboardShortcutsModal } from "../help/KeyboardShortcutsModal";
import { WhatsNewModal } from "../help/WhatsNewModal";
import { QuickTourOverlay } from "../help/QuickTourOverlay";
import { trackHelpAction } from "../../services/helpService";

interface HelpTabProps {
  isDarkMode?: boolean;
  userId?: string;
  spreadsheetId?: string;
}

export function HelpTab({ isDarkMode = false, userId = "guest", spreadsheetId = "" }: HelpTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showQuickTour, setShowQuickTour] = useState(false);
  const [helpTopic, setHelpTopic] = useState<string | null>(null);

  const buttonClass = `hover:bg-gray-100 dark:hover:bg-gray-800 ${
    isDarkMode ? "text-white" : "text-gray-900"
  }`;
  const inputClass = `${
    isDarkMode
      ? "bg-gray-900 text-white border-gray-700"
      : "bg-white text-gray-900 border-gray-300"
  }`;

  const handleHelpClick = (topic: string) => {
    trackHelpAction("help_click", { topic });

    // Close all modals first
    setShowHelpPanel(false);
    setShowBugReport(false);
    setShowFeatureRequest(false);
    setShowKeyboardShortcuts(false);
    setShowWhatsNew(false);
    setShowQuickTour(false);

    // Open appropriate modal based on topic
    switch (topic) {
      case "quick-tour":
        setShowQuickTour(true);
        break;
      case "keyboard-shortcuts":
        setShowKeyboardShortcuts(true);
        break;
      case "whats-new":
        setShowWhatsNew(true);
        break;
      case "report-bug":
        setShowBugReport(true);
        break;
      case "request-feature":
        setShowFeatureRequest(true);
        break;
      default:
        // For all other topics, open the help panel
        setHelpTopic(topic);
        setShowHelpPanel(true);
        break;
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackHelpAction("help_search", { query: searchQuery });
      setHelpTopic(`search:${searchQuery}`);
      setShowHelpPanel(true);
    }
  };

  const handleReportBug = () => {
    trackHelpAction("bug_report_open");
    handleHelpClick("report-bug");
  };

  const handleRequestFeature = () => {
    trackHelpAction("feature_request_open");
    handleHelpClick("request-feature");
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-4 py-3" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>
          {/* Getting Started Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Getting Started</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("quick-tour")}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs">Quick Tour</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("keyboard-shortcuts")}
              >
                <Keyboard className="w-5 h-5" />
                <span className="text-xs">Shortcuts</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("whats-new")}
              >
                <Info className="w-5 h-5" />
                <span className="text-xs">What's New</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

          {/* Collaboration Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Collaboration</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("sharing")}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs">Share & Permissions</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("live-collab")}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Live Collaboration</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("comments")}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">Comments</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

          {/* Support Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Support</div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Search help..."
                  className={`h-7 px-2 text-xs border rounded w-32 ${inputClass}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${buttonClass}`}
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={handleReportBug}
              >
                <Bug className="w-5 h-5" />
                <span className="text-xs">Report Bug</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={handleRequestFeature}
              >
                <Lightbulb className="w-5 h-5" />
                <span className="text-xs">Request Feature</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

          {/* About Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>About</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("version")}
              >
                <Info className="w-5 h-5" />
                <span className="text-xs">Version Info</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("terms")}
              >
                <FileQuestion className="w-5 h-5" />
                <span className="text-xs">Terms & Privacy</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => handleHelpClick("contact")}
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs">Contact Support</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <HelpPanel
        isOpen={showHelpPanel}
        onClose={() => setShowHelpPanel(false)}
        initialTopic={helpTopic}
        isDarkMode={isDarkMode}
      />
      <BugReportModal
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
        userId={userId}
        spreadsheetId={spreadsheetId}
        isDarkMode={isDarkMode}
      />
      <FeatureRequestModal
        isOpen={showFeatureRequest}
        onClose={() => setShowFeatureRequest(false)}
        userId={userId}
        isDarkMode={isDarkMode}
      />
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        isDarkMode={isDarkMode}
      />
      <WhatsNewModal
        isOpen={showWhatsNew}
        onClose={() => setShowWhatsNew(false)}
        isDarkMode={isDarkMode}
      />
      <QuickTourOverlay
        isOpen={showQuickTour}
        onClose={() => setShowQuickTour(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
