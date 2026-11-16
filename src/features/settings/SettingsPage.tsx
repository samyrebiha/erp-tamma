import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, Shield, Building2 } from 'lucide-react';
import { api } from '../../lib/api';
import { ShowroomSettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      await api.updateSettings(settings);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-text-muted">جاري تحميل إعدادات المعرض...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {successMsg && (
        <div className="p-3.5 rounded-card bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم حفظ وتحديث إعدادات المعرض بنجاح، وستنعكس فوراً على الوثائق الرسمية والطباعة.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* بيانات المعرض والترويسة الرسمية */}
        <Card
          title="بيانات المعرض والترويسة الرسمية"
          subtitle="تظهر هذه المعلومات في أعلى وثائق التسليم وبطاقات معلومات السيارات الرسمية A4"
        >
          <div className="space-y-4">
            <Input
              label="اسم المعرض التجاري"
              isRequired
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم الهاتف الأساسي"
                dir="ltr"
                placeholder="0550 12 34 56"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
              <Input
                label="البريد الإلكتروني للمعرض"
                dir="ltr"
                type="email"
                placeholder="contact@showroom.dz"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            <Input
              label="العنوان الجغرافي للمعرض"
              placeholder="الولاية، الدائرة، الشارع..."
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم السجل التجاري (RC)"
                dir="ltr"
                placeholder="مثال: 16/00-1234567B22"
                value={settings.commercial_register || ''}
                onChange={(e) => setSettings({ ...settings, commercial_register: e.target.value })}
              />
              <Input
                label="الرقم الجبائي / المعرف الإحصائي (NIF / NIS)"
                dir="ltr"
                placeholder="مثال: 002216012345678"
                value={settings.tax_number || ''}
                onChange={(e) => setSettings({ ...settings, tax_number: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* إعدادات العملة وشروط التسليم */}
        <Card
          title="العملة الرسمية ونصوص وثيقة التسليم"
          subtitle="تخصيص الشروط الافتراضية المطبوعة على وثيقة تسليم وإخراج السيارات"
        >
          <div className="space-y-4">
            <div className="w-full sm:w-1/2">
              <Input
                label="العملة المعتمدة في النظام"
                disabled
                value="د.ج (دينار جزائري - DZD)"
                helperText="العملة مثبتة بالنظام على الدينار الجزائري وفق متطلبات المشروع"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                الشروط والبنود الافتراضية في وثيقة التسليم (A4)
              </label>
              <textarea
                rows={3}
                value={settings.delivery_terms || ''}
                onChange={(e) => setSettings({ ...settings, delivery_terms: e.target.value })}
                placeholder="شروط معاينة السيارة، تسليم المفاتيح، والمسؤولية الفنية..."
                className="w-full rounded-[8px] border border-border bg-white p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </div>
  );
};

