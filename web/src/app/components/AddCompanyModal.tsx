import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import Modal from './Modal';
import AnimatedPressable from './ui/AnimatedPressable';
import NeumorphicSelect from './ui/NeumorphicSelect';
import type { CreateCompanyInput } from '@core/types';
import { COMPANY_TYPES, INDIAN_STATES } from '@core/constants';
import { lookupPincode } from '@core/utils/pincode';

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-[#141420] rounded-xl text-white placeholder:text-[#6B7280] focus:outline-none font-medium';
const INPUT_STYLE = {
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
} as const;

const COMPANY_TYPE_OPTIONS = COMPANY_TYPES.map((t) => ({
  value: t.value,
  label: t.label,
}));

const STATE_OPTIONS = INDIAN_STATES.map((s) => ({ value: s, label: s }));

export interface AddCompanyFormValues {
  name: string;
  companyType: string;
  cin: string;
  gstin: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  logo: File | null;
  logoPreview: string | null;
  officialEmail: string;
  officialContact: string;
  officialMobile: string;
}

const EMPTY_FORM: AddCompanyFormValues = {
  name: '',
  companyType: '',
  cin: '',
  gstin: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  logo: null,
  logoPreview: null,
  officialEmail: '',
  officialContact: '',
  officialMobile: '',
};

function Label({
  children,
  optional,
  required,
}: {
  children: ReactNode;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
      {children}
      {required && <span className="text-[#EF4444] ml-0.5">*</span>}
      {optional && <span className="text-[#6B7280] font-normal ml-1">(Optional)</span>}
    </label>
  );
}

function toCreateInput(form: AddCompanyFormValues): CreateCompanyInput {
  return {
    name: form.name.trim(),
    companyType: form.companyType,
    cin: form.cin.trim() || undefined,
    gstin: form.gstin.trim() || undefined,
    addressLine1: form.addressLine1.trim() || undefined,
    addressLine2: form.addressLine2.trim() || undefined,
    city: form.city.trim(),
    state: form.state,
    pincode: form.pincode,
    logo: form.logo,
    officialEmail: form.officialEmail.trim() || undefined,
    officialContact: form.officialContact.trim() || undefined,
    officialMobile: form.officialMobile.trim() || undefined,
  };
}

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCompanyInput) => Promise<void>;
}

export default function AddCompanyModal({ open, onClose, onSubmit }: AddCompanyModalProps) {
  const [form, setForm] = useState<AddCompanyFormValues>(EMPTY_FORM);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lastResolvedPinRef = useRef('');

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setPincodeError('');
    setFormError('');
    setSubmitting(false);
    lastResolvedPinRef.current = '';
  }, [open]);

  useEffect(() => {
    return () => {
      if (form.logoPreview) URL.revokeObjectURL(form.logoPreview);
    };
  }, [form.logoPreview]);

  const patch = (updates: Partial<AddCompanyFormValues>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handlePincodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    patch({ pincode: digits });
    if (digits.length < 6) {
      lastResolvedPinRef.current = '';
      setPincodeError('');
    }
  };

  useEffect(() => {
    if (form.pincode.length !== 6) {
      setPincodeLoading(false);
      return;
    }
    if (form.pincode === lastResolvedPinRef.current) return;

    let cancelled = false;
    setPincodeLoading(true);
    setPincodeError('');

    lookupPincode(form.pincode).then((result) => {
      if (cancelled) return;
      setPincodeLoading(false);

      if (!result) {
        setPincodeError('Could not find location for this PIN code. Select state manually.');
        return;
      }

      lastResolvedPinRef.current = form.pincode;
      setForm((prev) => ({ ...prev, state: result.state, city: result.city }));
    });

    return () => {
      cancelled = true;
    };
  }, [form.pincode]);

  const handleLogoChange = (file: File | null) => {
    if (form.logoPreview) URL.revokeObjectURL(form.logoPreview);
    if (!file) {
      patch({ logo: null, logoPreview: null });
      return;
    }
    patch({ logo: file, logoPreview: URL.createObjectURL(file) });
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Company name is required.';
    if (!form.companyType) return 'Please select a company type.';
    if (!/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit PIN code.';
    if (!form.city.trim()) return 'City is required.';
    if (!form.state) return 'State is required. Enter PIN code or select state.';
    if (form.gstin.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(form.gstin.trim())) {
      return 'Enter a valid 15-character GSTIN.';
    }
    if (form.officialEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.officialEmail.trim())) {
      return 'Enter a valid official email.';
    }
    if (form.officialMobile.trim() && !/^\d{10}$/.test(form.officialMobile.replace(/\D/g, '').slice(-10))) {
      return 'Official mobile must be a 10-digit number.';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      await onSubmit(toCreateInput(form));
      onClose();
    } catch {
      setFormError('Could not save company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Add New Company"
      subtitle="Register a company to manage sites and operations"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form className="space-y-6 pt-5" onSubmit={handleSubmit}>
        {/* Basic details */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Basic details</h3>

          <div>
            <Label required>Company Name</Label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="e.g. Metro Construction Ltd."
              required
            />
          </div>

          <div>
            <Label required>Company Type</Label>
            <NeumorphicSelect
              value={form.companyType}
              onChange={(v) => patch({ companyType: v })}
              placeholder="Select company type"
              options={COMPANY_TYPE_OPTIONS}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label optional>CIN</Label>
              <input
                type="text"
                value={form.cin}
                onChange={(e) => patch({ cin: e.target.value.toUpperCase() })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
                placeholder="U12345MH2020PTC123456"
                maxLength={21}
              />
            </div>
            <div>
              <Label optional>GSTIN</Label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => patch({ gstin: e.target.value.toUpperCase() })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
          </div>
        </section>

        {/* Head office */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Head office address</h3>

          <div>
            <Label optional>Address line 1</Label>
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) => patch({ addressLine1: e.target.value })}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="Building, street, area"
            />
          </div>

          <div>
            <Label optional>Address line 2</Label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => patch({ addressLine2: e.target.value })}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="Landmark, locality"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label required>PIN code</Label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className={INPUT_CLASS}
                  style={INPUT_STYLE}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  required
                />
                {pincodeLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6366F1] animate-spin" />
                )}
              </div>
              {pincodeError && (
                <p className="text-xs text-[#F59E0B] mt-1.5">{pincodeError}</p>
              )}
            </div>

            <div>
              <Label required>City</Label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => patch({ city: e.target.value })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
                placeholder="City / district"
                required
              />
            </div>

            <div>
              <Label required>State</Label>
              <NeumorphicSelect
                value={form.state}
                onChange={(v) => patch({ state: v })}
                placeholder="Select state"
                options={STATE_OPTIONS}
              />
              {form.pincode.length === 6 && form.state && !pincodeError && (
                <p className="text-xs text-[#6B7280] mt-1.5">Auto-filled from PIN code</p>
              )}
            </div>
          </div>
        </section>

        {/* Logo */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Branding</h3>
          <div>
            <Label optional>Company logo</Label>
            <AnimatedPressable
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="w-full bg-[#141420] rounded-xl p-6 text-center"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.25)',
              }}
            >
              {form.logoPreview ? (
                <img
                  src={form.logoPreview}
                  alt="Logo preview"
                  className="w-20 h-20 object-contain mx-auto mb-2 rounded-lg"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-[#6B7280] mx-auto mb-2" />
              )}
              <p className="text-sm text-[#9CA3AF] mb-1">
                {form.logo ? form.logo.name : 'Tap to upload logo'}
              </p>
              <p className="text-xs text-[#6B7280]">PNG, JPG up to 5MB</p>
            </AnimatedPressable>
            <input
              ref={logoInputRef}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
            />
            {form.logo && (
              <button
                type="button"
                onClick={() => handleLogoChange(null)}
                className="text-xs text-[#EF4444] mt-2 font-medium"
              >
                Remove logo
              </button>
            )}
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Official contact</h3>

          <div>
            <Label optional>Official email</Label>
            <input
              type="email"
              value={form.officialEmail}
              onChange={(e) => patch({ officialEmail: e.target.value })}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="contact@company.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label optional>Official contact (landline)</Label>
              <input
                type="tel"
                value={form.officialContact}
                onChange={(e) => patch({ officialContact: e.target.value })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
                placeholder="022 1234 5678"
              />
            </div>
            <div>
              <Label optional>Official mobile</Label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.officialMobile}
                onChange={(e) => patch({ officialMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
          </div>
        </section>

        {formError && (
          <p className="text-sm text-[#EF4444] font-medium">{formError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <AnimatedPressable
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-[#141420] rounded-xl text-[#9CA3AF] font-medium disabled:opacity-50"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            Cancel
          </AnimatedPressable>
          <AnimatedPressable
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
              boxShadow: '0 8px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {submitting ? 'Saving…' : 'Add Company'}
          </AnimatedPressable>
        </div>
      </form>
    </Modal>
  );
}
