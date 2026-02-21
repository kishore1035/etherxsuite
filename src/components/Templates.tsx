import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { getAllTemplates, Template } from "../services/templateService";

interface TemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: string) => void;
}

// Icon color mapping for templates - All use white-gold gradient
const ICON_COLORS: Record<string, string> = {
  'business-report': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'attendance': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'gradebook': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'inventory': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'invoice': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'sales-tracker': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'project-tracker': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'budget': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'study': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'workout': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'meal': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'habit': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'social': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'playlist': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
  'selfcare': 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
};

// Icon mapping for templates
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Icons.FileText;

  const iconMap: Record<string, any> = {
    'TrendingUp': Icons.TrendingUp,
    'Users': Icons.Users,
    'BookOpen': Icons.BookOpen,
    'Boxes': Icons.Boxes,
    'FileText': Icons.FileText,
    'BarChart3': Icons.BarChart3,
    'Briefcase': Icons.Briefcase,
    'Wallet': Icons.Wallet,
    'GraduationCap': Icons.GraduationCap,
    'Dumbbell': Icons.Dumbbell,
    'ShoppingCart': Icons.ShoppingCart,
    'Calendar': Icons.Calendar,
    'Music': Icons.Music,
    'Flame': Icons.Flame,
    'Heart': Icons.Heart,
  };

  return iconMap[iconName] || Icons.FileText;
};

export function Templates({ open, onClose, onSelect }: TemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      getAllTemplates()
        .then((data) => {
          setTemplates(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load templates:', err);
          setError('Failed to load templates');
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-made template to jumpstart your spreadsheet
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No templates available</p>
            </div>
          ) : (
            templates.map((template, index) => {
              const IconComponent = getIconComponent(template.icon);
              const color = ICON_COLORS[template.id] || 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)';

              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onSelect(template.id);
                    onClose();
                  }}
                  className="text-left p-4 rounded-lg border-2 border-border hover:border-primary transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: color }}
                    >
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      {template.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.category}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
