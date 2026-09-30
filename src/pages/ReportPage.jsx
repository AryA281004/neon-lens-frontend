import React from 'react'
import ContactForm from '../components/ContactForm'

const ReportPage = () => {
  const reportOptions = [
    { value: 'Bug report', label: 'Bug report' },
    { value: 'Abusive content', label: 'Abusive content' },
    { value: 'Account issue', label: 'Account issue' },
    { value: 'Feature request', label: 'Feature request' },
    { value: 'Other', label: 'Other' },
  ]

  return (
    <ContactForm
      title="Report a problem"
      subtitle="Use this form to report bugs, abusive content, or issues with your account. Our team reviews reports quickly and acts on critical issues first."
      submitLabel="Send report"
      showContactReasons={false}
      reportOptions={reportOptions}
    />
  )
}

export default ReportPage