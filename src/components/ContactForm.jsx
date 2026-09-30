import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendContactMessage } from "../api/api";
import toast from "react-hot-toast";

const ContactForm = ({
  title = "Let’s Build Something Worth Capturing.",
  subtitle = "Whether you're a photographer, creator, collaborator, or brand — NeonLens is built for people shaping visual stories. Reach out for partnerships, support, feedback, or anything worth creating together.",
  submitLabel = "Send Message",
  showContactReasons = true,
  reportOptions = [],
  customContactReasons = null,
}) => {
  const MAX_MESSAGE_LENGTH = 1000;
  const MESSAGE_WARNING_THRESHOLD = 850;
  const MAX_SUBJECT_LENGTH = 100;

  useEffect(() => {
    // Load Lord Icon from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.lordicon.com/lordicon.js";
    document.body.appendChild(script);
  }, []);

  const messageRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reportType, setReportType] = useState(reportOptions?.[0]?.value || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);

  const validateForm = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (reportOptions.length && !reportType) {
      toast.error("Please choose a report type.");
      return false;
    }

    if (!trimmedName) {
      toast.error("Please enter your name.");
      return false;
    }

    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters long.");
      return false;
    }

    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!trimmedSubject) {
      toast.error("Please enter a subject.");
      return false;
    }

    if (trimmedSubject.length < 5) {
      toast.error("Subject must be at least 5 characters long.");
      return false;
    }

    if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
      toast.error(`Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters.`);
      return false;
    }

    if (!trimmedMessage) {
      toast.error("Please enter a message.");
      return false;
    }

    if (trimmedMessage.length < 20) {
      toast.error("Message must be at least 20 characters long.");
      return false;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
      return false;
    }

    if (trimmedMessage.length >= MESSAGE_WARNING_THRESHOLD) {
      toast("Long message — consider shortening for readability.", {
        icon: "⚠️",
      });
    }

    return true;
  };

  const autoResizeTextarea = () => {
    const textarea = messageRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");

    if (messageRef.current) {
      messageRef.current.style.height = "140px";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const trimmedSubject = subject.trim();
      const subjectPayload = reportType
        ? `[${reportType}] ${trimmedSubject}`
        : trimmedSubject;

      const payload = {
        name: name.trim(),
        email: email.trim(),
        subject: subjectPayload,
        message: message.trim(),
      };

      const response = await sendContactMessage(
        payload.name,
        payload.email,
        payload.subject,
        payload.message,
      );

      resetForm();
      setShowSuccessState(true);
      toast.success(response?.message || "Message sent successfully!");
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  useEffect(() => {
    if (showSuccessState) {
      const timer = setTimeout(() => {
        setShowSuccessState(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessState]);

  const contactReasons = [
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/jdgfsfzr.json"
          trigger="hover"
          stroke="bold"
          colors="primary:#ffffff,secondary:#ffffff"
          style={{ width: "24px", height: "24px" }}
        ></lord-icon>
      ),
      title: "Partnerships",
      desc: "Brand deals, collabs, and creator opportunities.",
    },
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/fedbzost.json"
          trigger="hover"
          colors="primary:#ffffff"
          style={{ width: "24px", height: "24px" }}
        ></lord-icon>
      ),
      title: "Bug Reports",
      desc: "Found something broken? Tell us fast.",
    },
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/pewdpacd.json"
          trigger="hover"
          colors="primary:#ffffff"
          style={{ width: "24px", height: "24px" }}
        ></lord-icon>
      ),
      title: "Support",
      desc: "Need help using NeonLens or your account.",
    },
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/uwnsxkfm.json"
          trigger="hover"
          colors="primary:#ffffff"
          style={{ width: "24px", height: "24px" }}
        ></lord-icon>
      ),
      title: "Feedback",
      desc: "Feature ideas, UX thoughts, and product suggestions.",
    },
  ];

  const effectiveContactReasons = customContactReasons || contactReasons;

  const socials = [
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/cuwcpyqc.json"
          trigger="morph"
          stroke="bold"
          state="morph-alone"
          colors="primary:#ffffff,secondary:#ffffff"
          style={{ width: "40px", height: "40px" }}
        ></lord-icon>
      ),
      label: "Instagram",
      href: "https://www.instagram.com/infinitypx.echo/",
    },
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/euybrknk.json"
          trigger="morph"
          stroke="bold"
          state="morph-alone"
          colors="primary:#ffffff,secondary:#ffffff"
          style={{ width: "40px", height: "40px" }}
        ></lord-icon>
      ),
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/aryan-dudhat-7228b926b/",
    },
    {
      icon: (
        <lord-icon
          src="https://cdn.lordicon.com/uewqxptr.json"
          trigger="morph"
          stroke="bold"
          state="morph-circle"
          colors="primary:#ffffff,secondary:#ffffff"
          style={{ width: "40px", height: "40px" }}
        ></lord-icon>
      ),
      label: "Email",
      href: "mailto:neonlens.pictures@gmail.com",
    },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden text-white px-6 py-16">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 -z-10 ">
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-[28rem] h-[28rem] bg-white/5 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-12">
        {/* Left Side */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Visual Brand Identity */}
          <motion.div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-5"
            whileHover={{ scale: 1.03 }}
          >
            <div className="w-8 h-8  text-black flex items-center justify-center">
              <lord-icon
                src="https://cdn.lordicon.com/wsaaegar.json"
                trigger="hover"
                colors="primary:#ffffff,secondary:#ffffff"
                style={{ width: "250px", height: "250px" }}
              ></lord-icon>
            </div>
            <span className="text-sm uppercase tracking-[0.25em] text-zinc-300">
              NeonLens Studio
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-lg text-zinc-300 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {subtitle}
          </motion.p>

          {/* What You Can Contact Us For */}
          {showContactReasons && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {effectiveContactReasons.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4, scale: 1.015 }}
                  className="group border border-white/10 bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 text-white mb-2">
                    <span className="p-2 rounded-lg bg-white/10 group-hover:bg-white/15 transition">
                      {item.icon}
                    </span>
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Social / Secondary Contact */}
          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 mb-3">
              Other Ways to Reach Us
            </p>
            <div className="flex flex-wrap gap-3">
              {socials.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  target={item.label !== "Email" ? "_blank" : undefined}
                  rel={item.label !== "Email" ? "noreferrer" : undefined}
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 text-sm"
                >
                  {item.icon}
                  {item.label}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {showSuccessState ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-emerald-400/20 bg-emerald-500/10 backdrop-blur-xl rounded-3xl p-8 text-center"
              >
                <lord-icon
                  src="https://cdn.lordicon.com/uvofdfal.json"
                  trigger="morph"
                  state="morph-select"
                  colors="primary:#ffffff"
                  style={{ width: "80px", height: "80px" }}
                ></lord-icon>
                <h3 className="text-2xl font-semibold mb-2">Message Sent</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Your message is in. We’ll get back to you as soon as possible.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="relative border border-white/10 bg-white/5 backdrop-blur-2xl rounded-3xl p-6 space-y-5"
              >
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/okgbpdra.json"
                    trigger="hover"
                    colors="primary:#ffffff,secondary:#ffffff"
                    style={{ width: "250px", height: "250px" }}
                  ></lord-icon>
                  <span>Start the conversation</span>
                </div>

                {reportOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Report type
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border-2 border-white bg-black/20 px-4 py-3 text-white outline-none transition-all duration-300"
                    >
                      <option value="" disabled>
                        Select a report type
                      </option>
                      {reportOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {[
                  {
                    type: "text",
                    placeholder: "Your Name",
                    value: name,
                    setter: setName,
                  },
                  {
                    type: "email",
                    placeholder: "Your Email",
                    value: email,
                    setter: setEmail,
                  },
                  {
                    type: "text",
                    placeholder: "Subject",
                    value: subject,
                    setter: setSubject,
                  },
                ].map((field, i) => (
                  <motion.input
                    key={i}
                    whileFocus={{ scale: 1.01 }}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-3   border-2 border-white hover:shadow-[4px_4px_0_white] focus:shadow-[6px_6px_0_white] outline-none transition-all duration-300"
                  />
                ))}

                <div className="relative">
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    ref={messageRef}
                    placeholder="Tell us what’s on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={5}
                    className="w-full min-h-[140px] resize-none overflow-hidden p-3 pr-16   border-2 border-white hover:shadow-[4px_4px_0_white] focus:shadow-[6px_6px_0_white] outline-none transition-all duration-300"
                  />
                  <div
                    className={`absolute bottom-3 right-3 text-xs font-medium ${
                      message.length > 950
                        ? "text-red-400"
                        : message.length > 850
                          ? "text-yellow-400"
                          : "text-white/50"
                    }`}
                  >
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </div>
                </div>

                {/* Better Button Design + Microinteractions */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { y: -2, scale: 1.01 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.985 } : {}}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isSubmitting
                      ? "bg-white/10 text-white/60 cursor-not-allowed"
                      : "bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <lord-icon
                        src="https://cdn.lordicon.com/uvofdfal.json"
                        trigger="morph"
                        state="morph-select"
                        colors="primary:#ffffff"
                        style={{ width: "20px", height: "20px" }}
                      ></lord-icon>
                      Sending...
                    </>
                  ) : (
                    <>{submitLabel}</>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactForm;
