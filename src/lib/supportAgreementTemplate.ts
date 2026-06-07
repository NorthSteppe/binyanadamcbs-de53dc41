// Default Support Agreement template. Placeholders in {{double-braces}} are
// auto-filled from the client's profile (FBA intake / profile extras).

export const DEFAULT_SUPPORT_AGREEMENT_TEMPLATE = `SUPPORT AGREEMENT

This Support Agreement ("Agreement") is entered into between Blueprint ("the Practice")
and {{parent_name}} ("the Family"), in respect of support provided for {{child_name}}
(date of birth: {{date_of_birth}}; diagnosis: {{diagnosis}}).

1. Scope of Support
The Practice will provide assessment, consultation, and skill-based behavioural support
in line with the goals identified during the Functional Behaviour Assessment (FBA)
process. Specific objectives and session plans will be reviewed regularly with the Family.

2. Sessions and Attendance
Sessions will be scheduled by mutual agreement. The Family agrees to provide at least
24 hours' notice of cancellation. Sessions cancelled with less notice may be charged in full.

3. Confidentiality
All information shared during the course of support is confidential and will only be
disclosed with consent, or where required by law (for example safeguarding concerns).

4. Communication
Routine communication will be via the secure client portal. Urgent clinical concerns
should be discussed directly with the assigned therapist.

5. Fees and Payment
Fees for sessions and assessments will be agreed in writing prior to commencement.
Invoices are payable within 14 days of issue.

6. Consent and Participation
The Family confirms that they consent to the support described above and that they will
participate actively in the agreed plan, including practising strategies between sessions.

7. Review and Termination
Either party may end this Agreement in writing with 14 days' notice. The Practice will
support a safe handover where appropriate.

Contact: {{client_email}} | {{client_phone}}
Date: {{today}}
`;

export interface AgreementVars {
  parent_name?: string;
  child_name?: string;
  date_of_birth?: string;
  diagnosis?: string;
  client_email?: string;
  client_phone?: string;
}

export function applyTemplateVars(template: string, vars: AgreementVars) {
  const today = new Date().toLocaleDateString();
  const replacements: Record<string, string> = {
    parent_name: vars.parent_name || "_____________________",
    child_name: vars.child_name || "_____________________",
    date_of_birth: vars.date_of_birth || "____________",
    diagnosis: vars.diagnosis || "____________",
    client_email: vars.client_email || "____________",
    client_phone: vars.client_phone || "____________",
    today,
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => replacements[k] ?? `{{${k}}}`);
}
