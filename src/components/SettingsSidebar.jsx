import React from "react";
import { Link, useLocation } from "react-router-dom";

const sections = [
  {
    heading: "How you use Instagram",
    items: [
      { label: "Edit profile", icon: "profile", path: "/settings/edit" },
      { label: "Notifications", icon: "bell" },
    ],
  },
  {
    heading: "Who can see your content",
    items: [
      { label: "Account privacy", icon: "lock" },
      { label: "Close Friends", icon: "star" },
      { label: "Blocked", icon: "blocked" },
      { label: "Story and location", icon: "location" },
    ],
  },
  {
    heading: "How others can interact with you",
    items: [
      { label: "Messages and story replies", icon: "message" },
      { label: "Tags and mentions", icon: "tag" },
      { label: "Comments", icon: "comment" },
      { label: "Sharing", icon: "share" },
      { label: "Restricted accounts", icon: "hide" },
      { label: "Hidden Words", icon: "hidden" },
    ],
  },
];

const getIcon = (name) => {
  const commonProps = {
    className: "h-5 w-5",
    stroke: "currentColor",
    strokeWidth: 1.8,
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "profile":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M5.5 20c0-3.86 3.14-7 7-7s7 3.14 7 7" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M18 8a6 6 0 1 0-12 0c0 4.5-1.5 5.75-2 7h16c-.5-1.25-2-2.5-2-7Z" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="6" y="11" width="12" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="m12 17.25 5.4 3.15-1.45-6.35 5-4.35-6.4-.55L12 3.25 9.45 9.25l-6.4.55 5 4.35L12 17.25Z" />
        </svg>
      );
    case "blocked":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <circle cx="12" cy="12" r="7" />
          <path d="M8.5 8.5 15.5 15.5" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M12 21s8-6.5 8-11.5S15.5 3 12 3 4 5.5 4 9.5 12 21 12 21Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "message":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M4 7.5 12 12l8-4.5v9.5H4z" />
          <path d="M4 7.5 12 12 20 7.5" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M5 12 12 5l7 7-7 7-7-7Z" />
          <circle cx="9" cy="9" r="1.25" />
        </svg>
      );
    case "comment":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M4 5h16v11H8l-4 4V5Z" />
        </svg>
      );
    case "share":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M8 15V9m0 0 4 3-4 3" />
          <path d="M16 12H8" />
        </svg>
      );
    case "hide":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <path d="M8 12a4 4 0 0 0 8 0" />
        </svg>
      );
    case "hidden":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <path d="M15 9.5 8.5 16" />
          <path d="M8.5 9.5 15 16" />
        </svg>
      );
    default:
      return null;
  }
};

const SettingsSidebar = () => {
  const location = useLocation();

  return (
    <aside className="min-h-screen w-full rounded-[32px] border border-white/10 bg-[#02040c] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-5">
      <div className="grid gap-5">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gray-500">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => {
                const isActive = item.path && location.pathname === item.path;
                const isSelected = item.label === "Hidden Words";
                const itemStyle = isActive || isSelected
                  ? "bg-white/7 ring-1 ring-white/15 shadow-[0_8px_24px_rgba(255,255,255,0.05)]"
                  : "bg-white/5 hover:bg-white/10";

                const content = (
                  <div className={`flex items-center gap-3 rounded-[24px] border border-white/10 px-4 py-3 text-white transition ${itemStyle}`}>
                    <div className="flex h-12 w-12 min-w-[48px] items-center justify-center rounded-3xl bg-white/5 text-white/90">
                      {getIcon(item.icon)}
                    </div>
                    <p className="text-sm font-medium text-white truncate">{item.label}</p>
                  </div>
                );

                return item.path ? (
                  <Link key={item.label} to={item.path} className="block">
                    {content}
                  </Link>
                ) : (
                  <button key={item.label} type="button" className="block w-full text-left">
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SettingsSidebar;
