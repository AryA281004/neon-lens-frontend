import React from "react";

import { useNavigate } from "react-router-dom";

const faqs = [
  {
    id: "getting-started",
    question: "How do I get started on NeonLens?",
    answer:
      "Create an account, verify your email, complete your profile, then start exploring or posting your work.",
    subquestions: [
      {
        q: "Do I need an account to browse?",
        a: "You can browse public pages, but posting and messaging require an account.",
      },
      {
        q: "What information is required at signup?",
        a: "You need your name, email, username, password, and a mobile number.",
      },
      {
        q: "How does email verification work?",
        a: "We send a one-time code to your inbox that you enter to confirm ownership.",
      },
      {
        q: "What if I do not receive the OTP?",
        a: "Check spam, wait a minute, then request a new code.",
      },
      {
        q: "Can I change my email later?",
        a: "Yes. Update it in settings and verify the new address.",
      },
    ],
  },
  {
    id: "login-security",
    question: "What login options are supported?",
    answer:
      "You can log in using your email, username, or mobile number with your password.",
    subquestions: [
      {
        q: "Can I log in with any of the three?",
        a: "Yes. Use whichever identifier you set during registration.",
      },
      {
        q: "Why does login fail even with correct details?",
        a: "Double-check caps lock, verify your email, and confirm your account is active.",
      },
      {
        q: "Is there a remember me option?",
        a: "Sessions stay active until you log out or clear cookies.",
      },
      {
        q: "How do I reset my password?",
        a: "Use the password reset flow on the login screen.",
      },
      {
        q: "How do I sign out of all devices?",
        a: "Sign out from settings to invalidate other sessions.",
      },
    ],
  },
  {
    id: "profile-edit",
    question: "How do I edit my profile?",
    answer:
      "Go to Settings to update your name, username, bio, and profile picture.",
    subquestions: [
      {
        q: "Are there username rules?",
        a: "Usernames can include letters, numbers, and underscores only.",
      },
      {
        q: "What size should the profile image be?",
        a: "Use a clear JPG or PNG under 5MB for best results.",
      },
      {
        q: "Can I remove my bio?",
        a: "Yes. Clear the field and save your changes.",
      },
      {
        q: "Why does it say no changes to save?",
        a: "The form matches your current profile data.",
      },
      {
        q: "Can I make my profile private?",
        a: "Private profiles are planned but not available yet.",
      },
    ],
  },
  {
    id: "posting-photos",
    question: "How do I create a post?",
    answer:
      "Open the Create page, upload an image, then add a caption, category, and location.",
    subquestions: [
      {
        q: "Which image formats are supported?",
        a: "JPG, PNG, and WEBP are recommended.",
      },
      {
        q: "What is the maximum file size?",
        a: "Keep uploads under 5MB for faster processing.",
      },
      {
        q: "Can I edit a post after publishing?",
        a: "Yes. Use the post menu to edit details.",
      },
      {
        q: "Can I delete a post?",
        a: "Yes. Use the post menu and confirm delete.",
      },
      {
        q: "Are drafts supported?",
        a: "Drafts are not available yet.",
      },
    ],
  },
  {
    id: "gallery",
    question: "How does the gallery work?",
    answer:
      "The gallery highlights recent and curated posts with filters for quick browsing.",
    subquestions: [
      {
        q: "Can I sort posts?",
        a: "Use available filters to adjust what you see.",
      },
      {
        q: "Can I save a post?",
        a: "Saving is in progress and will be available soon.",
      },
      {
        q: "Can I create collections?",
        a: "Collections are planned for a future update.",
      },
      {
        q: "Why is my post not visible?",
        a: "New posts can take a moment to appear in feeds.",
      },
      {
        q: "How do I refresh the grid?",
        a: "Reload the page or navigate away and back.",
      },
    ],
  },
  {
    id: "search-discover",
    question: "How do I search and discover content?",
    answer:
      "Use Search to find users, tags, or keywords in captions.",
    subquestions: [
      {
        q: "Can I search by username?",
        a: "Yes. Type a username to jump to profiles.",
      },
      {
        q: "Can I search by location?",
        a: "Search works best on tagged captions and metadata.",
      },
      {
        q: "Why am I getting no results?",
        a: "Try a shorter query or remove special characters.",
      },
      {
        q: "How do I clear search history?",
        a: "Clear the input and refresh the search page.",
      },
      {
        q: "Are trending tags available?",
        a: "Trending tags are coming soon.",
      },
    ],
  },
  {
    id: "messaging",
    question: "How do direct messages work?",
    answer:
      "Messages are private and only visible to participants in the conversation.",
    subquestions: [
      {
        q: "How do I start a conversation?",
        a: "Open a profile and choose the message option.",
      },
      {
        q: "Can I send images?",
        a: "Messaging is optimized for text at the moment.",
      },
      {
        q: "Can I delete a message?",
        a: "You can remove a conversation from your inbox.",
      },
      {
        q: "Can I mute a conversation?",
        a: "Mute options are planned for a future update.",
      },
      {
        q: "How do I report a message?",
        a: "Use the report option in the conversation menu.",
      },
    ],
  },
  {
    id: "notifications",
    question: "How do notifications work?",
    answer:
      "In-app notifications appear for follows, likes, comments, and messages.",
    subquestions: [
      {
        q: "Can I disable notifications?",
        a: "Yes. Turn off specific types in settings.",
      },
      {
        q: "Why did I miss a notification?",
        a: "Refresh the page and check your notification panel.",
      },
      {
        q: "Do you send email notifications?",
        a: "Emails are used mainly for security and verification.",
      },
      {
        q: "Can I mark all as read?",
        a: "Use the mark-all action in the notifications view.",
      },
      {
        q: "How fast are notifications delivered?",
        a: "Most notifications arrive in real time.",
      },
    ],
  },
  {
    id: "follow-system",
    question: "How do follows and followers work?",
    answer:
      "Follow creators to see their posts. Your followers appear on your profile.",
    subquestions: [
      {
        q: "How do I follow someone?",
        a: "Visit their profile and click Follow.",
      },
      {
        q: "How do I unfollow someone?",
        a: "Click Following on their profile to remove the follow.",
      },
      {
        q: "Why is follower count delayed?",
        a: "Counts can take a few minutes to sync.",
      },
      {
        q: "Can I remove a follower?",
        a: "Block and unblock the user to remove them from your list.",
      },
      {
        q: "Can I see mutual followers?",
        a: "Mutuals are shown on profile cards when available.",
      },
    ],
  },
  {
    id: "report-block",
    question: "How do I report or block content?",
    answer:
      "Use the more menu on a post or profile to report or block.",
    subquestions: [
      {
        q: "What happens after I report?",
        a: "Our team reviews the report and takes action if needed.",
      },
      {
        q: "What details should I include?",
        a: "Choose a reason and add context if prompted.",
      },
      {
        q: "Can I undo a report?",
        a: "Contact support if you reported by mistake.",
      },
      {
        q: "What does blocking do?",
        a: "Blocking hides content and prevents direct messages.",
      },
      {
        q: "Can blocked users see my profile?",
        a: "Blocked users cannot interact or view your profile details.",
      },
    ],
  },
  {
    id: "content-rules",
    question: "What are the content rules?",
    answer:
      "Post original work, respect others, and avoid copyrighted material without permission.",
    subquestions: [
      {
        q: "Can I post someone else's photo?",
        a: "Only if you have permission and provide credit.",
      },
      {
        q: "How should I add credit?",
        a: "Mention the creator in the caption and link where possible.",
      },
      {
        q: "Are watermarks allowed?",
        a: "Yes. Keep them subtle to preserve the viewing experience.",
      },
      {
        q: "Is commercial use allowed?",
        a: "You can share commercial work you own the rights to.",
      },
      {
        q: "Are AI-generated images allowed?",
        a: "Yes, but label them clearly for transparency.",
      },
    ],
  },
  {
    id: "privacy-data",
    question: "How do I manage my data and privacy?",
    answer:
      "You control what you share. We store only the data needed to run your account.",
    subquestions: [
      {
        q: "What data is stored?",
        a: "Profile info, posts, and messages required for core features.",
      },
      {
        q: "Can I download my data?",
        a: "Request an export through support.",
      },
      {
        q: "How do I delete my account?",
        a: "Use the account delete option or contact support.",
      },
      {
        q: "Do you store location data?",
        a: "Only if you add a location to a post.",
      },
      {
        q: "How are cookies used?",
        a: "Cookies keep your session secure and help with authentication.",
      },
    ],
  },
  {
    id: "compatibility",
    question: "What devices and browsers are supported?",
    answer:
      "NeonLens works best on modern desktop and mobile browsers.",
    subquestions: [
      {
        q: "Which browsers are recommended?",
        a: "Chrome, Edge, Firefox, and Safari are fully supported.",
      },
      {
        q: "Is there a mobile app?",
        a: "The web app is optimized for mobile use.",
      },
      {
        q: "Why do animations feel choppy?",
        a: "Close heavy tabs and enable hardware acceleration.",
      },
      {
        q: "Does it work on low bandwidth?",
        a: "Images are optimized to load progressively when possible.",
      },
      {
        q: "Is offline mode supported?",
        a: "Offline use is limited at the moment.",
      },
    ],
  },
  {
    id: "support",
    question: "How do I contact support?",
    answer:
      "Use the contact page to send a detailed request.",
    subquestions: [
      {
        q: "What is the usual response time?",
        a: "Most requests are answered within 24 to 72 hours.",
      },
      {
        q: "What details should I include?",
        a: "Your username, screenshots, and steps to reproduce.",
      },
      {
        q: "How do I follow up?",
        a: "Reply to the support email thread to keep context.",
      },
      {
        q: "Can I report a bug?",
        a: "Yes. Include device, browser, and error details.",
      },
      {
        q: "Is live chat available?",
        a: "Live chat is not available yet.",
      },
    ],
  },
  {
    id: "feature-requests",
    question: "How can I suggest new features?",
    answer:
      "We welcome feedback. Share ideas through the contact page or feedback prompts.",
    subquestions: [
      {
        q: "Where do I submit ideas?",
        a: "Use the Contact page and choose Feature Request.",
      },
      {
        q: "Do you run beta programs?",
        a: "Occasional beta invites are sent to active users.",
      },
      {
        q: "Can I vote on ideas?",
        a: "Community voting is planned for a future release.",
      },
      {
        q: "Is there a public roadmap?",
        a: "Roadmap updates are shared in announcements.",
      },
      {
        q: "How do I get notified about updates?",
        a: "Follow the blog or announcement feed.",
      },
    ],
  },
  {
    id: "billing",
    question: "Are there paid plans or billing features?",
    answer:
      "NeonLens is free to use today. Premium features may arrive later.",
    subquestions: [
      {
        q: "Is the core experience free?",
        a: "Yes. All core features are currently free.",
      },
      {
        q: "Will there be a premium plan?",
        a: "Premium tools are being explored for future releases.",
      },
      {
        q: "Will ads be shown?",
        a: "There are no ads right now.",
      },
      {
        q: "Can I donate or sponsor?",
        a: "Sponsorship options are not available yet.",
      },
      {
        q: "How will billing updates be announced?",
        a: "Changes are shared through announcements and email.",
      },
    ],
  },
  {
    id: "account-recovery",
    question: "What if I lose access to my account?",
    answer:
      "Use the recovery flow or contact support to verify ownership and regain access.",
    subquestions: [
      {
        q: "I forgot my password. What next?",
        a: "Use the password reset option on the login page.",
      },
      {
        q: "I lost access to my email. Can I recover?",
        a: "Contact support with proof of ownership.",
      },
      {
        q: "My account was locked. Why?",
        a: "Multiple failed logins can trigger a temporary lock.",
      },
      {
        q: "How long does recovery take?",
        a: "Most recoveries finish within a few business days.",
      },
      {
        q: "What information will support ask for?",
        a: "Recent activity, device details, and identifiers you used.",
      },
    ],
  },
];

const FAQ = () => {
  const navigate = useNavigate();

  const handlecontactsupport = () => {
    navigate('/contact');
  };
  return (
    <section className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-10 ">
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-[28rem] h-[28rem] bg-white/5 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <header className="animate-fade-in">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em]">
            NeonLens FAQ
          </div>
          <h1
            className="mt-6 text-4xl font-semibold leading-tight md:text-6xl"
            style={{ fontFamily: "Walkingrush, 'Times New Roman', serif" }}
          >
            Answers for creators, viewers, and collaborators.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/75">
            Dive into the most common questions about NeonLens. Each topic
            includes deeper follow-ups so you can move from basics to details
            quickly.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Still searching?</p>
              <p className="text-xs text-white/60">
                Use keywords like account, profile, messaging, or privacy.
              </p>
            </div>
            <div className="flex-1 md:max-w-md">
              <input
                type="text"
                placeholder="Search FAQ topics"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>
        </header>

        <div className="mt-12 grid gap-6">
          {faqs.map((item, index) => (
            <details
              key={item.id}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-white/30"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xs font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.question}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">
                      {item.answer}
                    </p>
                  </div>
                </div>
                <span className="mt-1 text-2xl font-light text-white/60 transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {item.subquestions.map((sub, subIndex) => (
                    <details
                      key={`${item.id}-${subIndex}`}
                      className="rounded-xl border border-white/10 bg-black/40 p-4 transition hover:border-white/25"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-white/90">
                        {sub.q}
                      </summary>
                      <p className="mt-2 text-sm text-white/65">{sub.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: "Walkingrush, 'Times New Roman', serif" }}
          >
            Need a direct answer?
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Send a message from the contact page and we will get back to you.
          </p>
          <button
          onClick={() => handlecontactsupport()}
            type="button"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-2 text-xs uppercase tracking-[0.3em] transition hover:border-white/60 hover:bg-white/10"
          >
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
