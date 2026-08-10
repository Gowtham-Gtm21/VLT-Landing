import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitLead } from '../lib/api';
import { readAttribution } from '../lib/attribution';
import { saveLead } from '../lib/session';
import { track } from '../lib/tracking';
import { Arrow } from './Icons';

const SERVICES = [
  'Not sure yet',
  'Product engineering',
  'Drone & UAV systems',
  'IoT platform',
  'Web & mobile application',
  'AI & Cloud',
];

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: 'Not sure yet',
  projectDetails: '',
  website: '', // honeypot
};

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(values.email.trim()))
    errors.email = 'Enter a valid email address';
  const digits = values.phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) errors.phone = 'Enter a valid phone number';
  return errors;
}

export default function LeadForm({ presetService, onSubmitted }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // the "where are you at?" buttons preselect the service before scrolling here
  useEffect(() => {
    if (presetService) setValues((v) => ({ ...v, service: presetService }));
  }, [presetService]);

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSubmitting(true);

    try {
      const attribution = readAttribution();
      const res = await submitLead({ ...values, attribution });

      saveLead({
        id: res.leadId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        service: values.service,
        projectDetails: values.projectDetails,
        calendlyUrl: res.calendlyUrl || import.meta.env.VITE_CALENDLY_URL || '',
      });

      track('Lead', { content_name: values.service, content_category: 'landing_form' });
      onSubmitted?.();

      // Step 3 of the flow — no extra click, straight to the calendar.
      if (import.meta.env.VITE_CALENDLY_MODE === 'redirect' && res.calendlyUrl) {
        window.location.assign(res.calendlyUrl);
        return;
      }

      navigate('/schedule', { replace: true });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) {
        setErrors(err.fieldErrors);
      }
      setFormError(err.message || 'We could not send that. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <section className="card" id="enquiry" aria-labelledby="enquiry-title">
      <div className="card__head">
        <span>Enquiry form</span>
        <span>Step 01 / 03</span>
      </div>

      <div className="card__body">
        <h2 className="card__title" id="enquiry-title">
          Tell us what you are building
        </h2>
        <p className="card__note">
          Submit this and you land straight on the calendar to pick your slot. No waiting for a
          reply first.
        </p>

        {formError && (
          <p className="alert" role="alert">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">
              Full name <span className="req">*</span>
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={update('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              placeholder="Your full name"
            />
            {errors.name && (
              <span className="field__error" id="name-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="field--split">
            <div className="field">
              <label htmlFor="email">
                Work email <span className="req">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="you@company.com"
              />
              {errors.email && (
                <span className="field__error" id="email-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="phone">
                Phone <span className="req">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={update('phone')}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                placeholder="+91 00000 00000"
              />
              {errors.phone && (
                <span className="field__error" id="phone-error">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          <div className="field--split">
            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                autoComplete="organization"
                value={values.company}
                onChange={update('company')}
                placeholder="Your company"
              />
            </div>

            <div className="field">
              <label htmlFor="service">What do you need</label>
              <select id="service" name="service" value={values.service} onChange={update('service')}>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="projectDetails">Project details</label>
            <textarea
              id="projectDetails"
              name="projectDetails"
              value={values.projectDetails}
              onChange={update('projectDetails')}
              placeholder="Scope, timeline, budget range, anything already built"
            />
          </div>

          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Leave this empty</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
          </div>

          <button className="btn btn--block" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Continue to pick a time'}
            {!submitting && <Arrow />}
          </button>

          <p className="form__foot">
            Next is the calendar. Your details are used only to prepare for the call.
          </p>
        </form>
      </div>
    </section>
  );
}
