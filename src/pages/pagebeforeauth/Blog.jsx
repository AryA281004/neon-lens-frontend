import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const BLOG_POSTS = [
  { id: 'golden-hour-mastery', title: 'Golden Hour Mastery: Portraits, Landscapes, and Motion', excerpt: 'Read the exact lighting shapes and exposure choices that make golden hour frames feel cinematic and effortless.', category: 'Lighting', date: 'May 2026', readingTime: '7 min read', tags: ['Golden Hour', 'Exposure', 'Mood'] },
  { id: 'mixed-light-portraiture', title: 'Mixed Light Portraiture: Balancing Ambient and Artificial', excerpt: 'A hands-on guide to blending window light, LED panels, and practicals for natural-looking portraits.', category: 'Lighting', date: 'April 2026', readingTime: '8 min read', tags: ['Portrait', 'LED', 'Blending'] },
  { id: 'flash-scenic-blend', title: 'Flash and Scenic Blend: Keeping Backgrounds Alive', excerpt: 'Exactly how to control flash power and modifiers so subjects remain crisp without flattening the scene.', category: 'Lighting', date: 'April 2026', readingTime: '6 min read', tags: ['Flash', 'Modifiers', 'Scene'] },
  { id: 'backlight-silhouettes', title: 'Backlight and Silhouettes: Drama with Depth', excerpt: 'Technique for shaping highlights, preventing flare, and preserving separation in backlit compositions.', category: 'Lighting', date: 'March 2026', readingTime: '6 min read', tags: ['Backlight', 'Silhouette', 'Drama'] },
  { id: 'color-temperature-control', title: 'Color Temperature Control for Mood and Consistency', excerpt: 'Understand white balance decisions across mixed light to preserve mood while keeping skin tones believable.', category: 'Lighting', date: 'March 2026', readingTime: '7 min read', tags: ['White Balance', 'Mood', 'Consistency'] },
  { id: 'low-light-lens-choice', title: 'Low-Light Lens Choice: Sharpness vs. Speed', excerpt: 'Lens selection rules for low light work, plus when to trade aperture for compression or flare behavior.', category: 'Lighting', date: 'February 2026', readingTime: '5 min read', tags: ['Lens', 'Low Light', 'Sharpness'] },
  { id: 'texture-shadow-crafting', title: 'Texture and Shadow Crafting for Editorial Portraits', excerpt: 'How to use contrast and falling light to give portraits depth without losing subtle tonality.', category: 'Lighting', date: 'February 2026', readingTime: '6 min read', tags: ['Texture', 'Shadow', 'Portrait'] },
  { id: 'practical-light-shaping', title: 'Practical Light Shaping for Every Location', excerpt: 'A toolkit of reflectors, diffusers, and grids that work in the studio and on the street.', category: 'Lighting', date: 'January 2026', readingTime: '6 min read', tags: ['Reflectors', 'Diffusion', 'Practical'] },
  { id: 'natural-light-details', title: 'Natural Light Details: Shooting with Available Sources', excerpt: 'Workflow for spotting usable light, recognizing contrast, and locking exposure during fast sessions.', category: 'Lighting', date: 'January 2026', readingTime: '5 min read', tags: ['Available Light', 'Exposure', 'Workflow'] },
  { id: 'high-contrast-lighting', title: 'High-Contrast Lighting That Still Feels Soft', excerpt: 'Techniques for crisp contrast with smooth transitions so the image feels polished, not harsh.', category: 'Lighting', date: 'December 2025', readingTime: '7 min read', tags: ['Contrast', 'Softness', 'Style'] },

  { id: 'rule-of-thirds-revisited', title: 'Rule of Thirds Revisited: Structure without Restriction', excerpt: 'When to use thirds as a starting point and when to break it for more interesting compositions.', category: 'Composition', date: 'May 2026', readingTime: '7 min read', tags: ['Rule of Thirds', 'Intentional', 'Breaking Rules'] },
  { id: 'leading-lines-streets', title: 'Leading Lines in Street Photography', excerpt: 'Use roads, architecture, and shadows to pull the viewer through the frame with purpose.', category: 'Composition', date: 'April 2026', readingTime: '6 min read', tags: ['Street', 'Lines', 'Motion'] },
  { id: 'negative-space-power', title: 'The Power of Negative Space in Editorial Work', excerpt: 'Minimal compositions that create breathing room and stronger subject emphasis.', category: 'Composition', date: 'April 2026', readingTime: '6 min read', tags: ['Minimal', 'Negative Space', 'Focus'] },
  { id: 'symmetry-urban-series', title: 'Symmetry and Repetition for Urban Stories', excerpt: 'Building photo series around repeating forms, reflections, and mirrored details.', category: 'Composition', date: 'March 2026', readingTime: '6 min read', tags: ['Symmetry', 'Urban', 'Pattern'] },
  { id: 'framing-within-frame', title: 'Framing Within the Frame: Depth and Context', excerpt: 'How doorways, trees, and architecture can add layers and narrative to a single shot.', category: 'Composition', date: 'March 2026', readingTime: '7 min read', tags: ['Frame', 'Depth', 'Context'] },
  { id: 'diagonal-dynamics', title: 'Diagonal Dynamics for Energy and Flow', excerpt: 'Using diagonal lines to create movement and visual tension without making the image chaotic.', category: 'Composition', date: 'February 2026', readingTime: '5 min read', tags: ['Diagonals', 'Energy', 'Balance'] },
  { id: 'layered-backgrounds', title: 'Layered Backgrounds That Add Meaning', excerpt: 'Building a sense of place with foreground, midground, and background details.', category: 'Composition', date: 'February 2026', readingTime: '6 min read', tags: ['Layers', 'Background', 'Place'] },
  { id: 'scale-depth', title: 'Scale and Depth in Environmental Portraits', excerpt: 'Scale cues that make portraits feel cinematic and grounded in their surroundings.', category: 'Composition', date: 'January 2026', readingTime: '6 min read', tags: ['Scale', 'Depth', 'Portrait'] },
  { id: 'color-block-composition', title: 'Color Blocks for Strong Visual Hierarchy', excerpt: 'Using bold color fields to create structure in editorial and portrait work.', category: 'Composition', date: 'January 2026', readingTime: '5 min read', tags: ['Color', 'Hierarchy', 'Contrast'] },
  { id: 'narrative-composition', title: 'Narrative Composition: Leading the Eye Through the Story', excerpt: 'How compositional rhythm can guide attention and reveal story beats inside a frame.', category: 'Composition', date: 'December 2025', readingTime: '7 min read', tags: ['Narrative', 'Rhythm', 'Story'] },

  { id: 'filmic-color-grading', title: 'Filmic Color Grading for Editorial Work', excerpt: 'A practical process for rich, balanced color that feels polished without looking overdone.', category: 'Editing', date: 'May 2026', readingTime: '8 min read', tags: ['Color Grade', 'Film', 'Tone'] },
  { id: 'skin-tone-consistency', title: 'Skin Tone Consistency Across Scenes', excerpt: 'The exact steps to maintain natural, complementary skin tones across different lighting.', category: 'Editing', date: 'April 2026', readingTime: '7 min read', tags: ['Skin Tone', 'Consistency', 'Workflow'] },
  { id: 'dodging-burning', title: 'Dodging and Burning That Feels Invisible', excerpt: 'Selective contrast control to guide focus and preserve natural textures.', category: 'Editing', date: 'April 2026', readingTime: '6 min read', tags: ['Dodge Burn', 'Texture', 'Focus'] },
  { id: 'black-white-mood', title: 'Black and White Mood for Portraits', excerpt: 'Working in grayscale with contrast, grain, and shape to preserve emotion and tone.', category: 'Editing', date: 'March 2026', readingTime: '6 min read', tags: ['Black & White', 'Mood', 'Contrast'] },
  { id: 'editing-retouch-restraint', title: 'Retouch with Restraint: Clean but Real', excerpt: 'Practical retouching to refine skin and details without smoothing away personality.', category: 'Editing', date: 'March 2026', readingTime: '7 min read', tags: ['Retouch', 'Realism', 'Skin'] },
  { id: 'analog-grain-workflow', title: 'Analog Grain and Texture Workflow', excerpt: 'How to apply film-style grain, tonal curve, and subtle vignettes the right way.', category: 'Editing', date: 'February 2026', readingTime: '6 min read', tags: ['Grain', 'Analog', 'Texture'] },
  { id: 'contrast-management', title: 'Contrast Management for Maximum Impact', excerpt: 'Find the balance between bold highlights and preserved shadows in editorial images.', category: 'Editing', date: 'February 2026', readingTime: '5 min read', tags: ['Contrast', 'Highlight', 'Shadow'] },
  { id: 'color-contrast-storytelling', title: 'Color Contrast for Visual Storytelling', excerpt: 'Using color relationships to guide attention and evoke emotion in the final edit.', category: 'Editing', date: 'January 2026', readingTime: '6 min read', tags: ['Color', 'Story', 'Emotion'] },
  { id: 'metadata-archive-workflow', title: 'Metadata and Archive Workflow for Photographers', excerpt: 'Organize selects, keywords, and exports so the edit archive stays useful months later.', category: 'Editing', date: 'January 2026', readingTime: '6 min read', tags: ['Metadata', 'Archive', 'Workflow'] },
  { id: 'sharpening-web-delivery', title: 'Sharpening for Web Delivery and Print', excerpt: 'Keep details crisp on screens and prints without over-processing edges.', category: 'Editing', date: 'December 2025', readingTime: '7 min read', tags: ['Sharpening', 'Web', 'Print'] },

  { id: 'photo-series-structure', title: 'Photo Series Structure That Builds Momentum', excerpt: 'How to plan a photo series that grows stronger with each frame and keeps the viewer engaged.', category: 'Story', date: 'May 2026', readingTime: '7 min read', tags: ['Series', 'Momentum', 'Sequence'] },
  { id: 'editorial-storytelling', title: 'Editorial Storytelling for Personal Projects', excerpt: 'An approach to creating visual essays with coherent mood, pace, and character.', category: 'Story', date: 'April 2026', readingTime: '8 min read', tags: ['Editorial', 'Essay', 'Mood'] },
  { id: 'candid-emotion-series', title: 'Candid Emotion Series for Authentic Portraits', excerpt: 'Capturing authentic moments through relaxed direction and patient observation.', category: 'Story', date: 'April 2026', readingTime: '6 min read', tags: ['Candid', 'Emotion', 'Portrait'] },
  { id: 'subject-arc', title: 'Building a Subject Arc Across Frames', excerpt: 'Create a sequence that reveals more of the subject’s character with each image.', category: 'Story', date: 'March 2026', readingTime: '6 min read', tags: ['Subject', 'Arc', 'Character'] },
  { id: 'scene-setting-stories', title: 'Scene Setting for Strong Visual Storytelling', excerpt: 'Using location, props, and staging to anchor your images in a believable world.', category: 'Story', date: 'March 2026', readingTime: '7 min read', tags: ['Scene', 'Location', 'Setting'] },
  { id: 'detail-driven-story', title: 'Detail-Driven Storytelling with Close-Up Frames', excerpt: 'Small moments, textures, and gestures that add narrative weight to your body of work.', category: 'Story', date: 'February 2026', readingTime: '5 min read', tags: ['Detail', 'Close-Up', 'Narrative'] },
  { id: 'pacing-capture-order', title: 'Pacing Your Capture Order for Better Editing', excerpt: 'Why shooting in a deliberate order improves storytelling and saves editing time.', category: 'Story', date: 'February 2026', readingTime: '6 min read', tags: ['Pacing', 'Workflow', 'Editing'] },
  { id: 'environment-storytelling', title: 'Environment Storytelling for Portrait Work', excerpt: 'How setting and background detail reinforce what the subject is feeling or doing.', category: 'Story', date: 'January 2026', readingTime: '6 min read', tags: ['Environment', 'Portrait', 'Context'] },
  { id: 'ending-impact', title: 'Closing the Series: Endings That Feel Complete', excerpt: 'The last frame should settle the story. Here’s how to choose it without over-explaining.', category: 'Story', date: 'January 2026', readingTime: '5 min read', tags: ['Ending', 'Series', 'Conclusion'] },
  { id: 'character-journeys', title: 'Character Journeys Through a Portrait Series', excerpt: 'Build emotional arcs by showing change, context, and resilience inside a photographic series.', category: 'Story', date: 'December 2025', readingTime: '7 min read', tags: ['Character', 'Journey', 'Arc'] },

  { id: 'minimalist-gear-kit', title: 'Minimalist Gear Kit for Photographer Mobility', excerpt: 'A no-nonsense kit list for photographers who want reliability, creativity, and speed without excess weight.', category: 'Gear', date: 'May 2026', readingTime: '5 min read', tags: ['Gear', 'Mobility', 'Practical'] },
  { id: 'lens-choice-guide', title: 'Lens Choice Guide for Portrait and Street', excerpt: 'Lens selection rules for compression, background separation, and fast light.', category: 'Gear', date: 'April 2026', readingTime: '7 min read', tags: ['Lens', 'Portrait', 'Street'] },
  { id: 'tripod-mobility-kit', title: 'Tripod and Mobility Kit for Hybrid Shoots', excerpt: 'How to use lightweight support without losing flexibility during moving shoots.', category: 'Gear', date: 'April 2026', readingTime: '6 min read', tags: ['Tripod', 'Mobility', 'Support'] },
  { id: 'camera-settings-toolkit', title: 'Camera Settings Toolkit for Fast Shoots', excerpt: 'Exact settings templates for portraits, street work, and mixed light scenes.', category: 'Gear', date: 'March 2026', readingTime: '6 min read', tags: ['Settings', 'Exposure', 'Templates'] },
  { id: 'bag-organization-system', title: 'Bag Organization System for Every Shoot', excerpt: 'A packing method that keeps gear accessible and safe without wasting time.', category: 'Gear', date: 'March 2026', readingTime: '5 min read', tags: ['Bag', 'Organization', 'Workflow'] },
  { id: 'lighting-hardware-review', title: 'Compact Lighting Hardware Review for Location Work', excerpt: 'A practical comparison of portable lights, batteries, and modifiers for fast setups.', category: 'Gear', date: 'February 2026', readingTime: '7 min read', tags: ['Lighting', 'Portable', 'Review'] },
  { id: 'hybrid-film-digital', title: 'Hybrid Film/Digital Workflow for Editorial Shoots', excerpt: 'Combining film scans with digital captures to create a richer visual palette.', category: 'Gear', date: 'February 2026', readingTime: '6 min read', tags: ['Film', 'Digital', 'Hybrid'] },
  { id: 'audio-video-accessories', title: 'Audio and Video Accessories for Multimedia Shoots', excerpt: 'A lightweight accessory kit for photographers who also capture behind-the-scenes content.', category: 'Gear', date: 'January 2026', readingTime: '5 min read', tags: ['Audio', 'Video', 'BTS'] },
  { id: 'cleaning-care-checklist', title: 'Cleaning and Care Checklist for Long-Lasting Gear', excerpt: 'Simple maintenance habits that keep lenses and cameras reliable day after day.', category: 'Gear', date: 'January 2026', readingTime: '5 min read', tags: ['Maintenance', 'Care', 'Reliability'] },
  { id: 'battery-accessory-habits', title: 'Battery and Media Habits That Never Fail', excerpt: 'Exactly how to rotate batteries and storage media so you never lose a shoot.', category: 'Gear', date: 'December 2025', readingTime: '6 min read', tags: ['Battery', 'Media', 'Prep'] },

  { id: 'critique-culture', title: 'Critique Culture for Photographers Who Want Better Work', excerpt: 'How to give and receive feedback that improves your images without destroying morale.', category: 'Community', date: 'May 2026', readingTime: '7 min read', tags: ['Critique', 'Feedback', 'Growth'] },
  { id: 'portfolio-feedback-loop', title: 'Portfolio Feedback Loop for Confident Editing', excerpt: 'Use critique cycles to refine your best work and stop second-guessing story decisions.', category: 'Community', date: 'April 2026', readingTime: '6 min read', tags: ['Portfolio', 'Feedback', 'Editing'] },
  { id: 'collaborator-routines', title: 'Collaborator Routines for Smooth Shoots', excerpt: 'How to set expectations with models, stylists, and assistants before the first frame.', category: 'Community', date: 'April 2026', readingTime: '6 min read', tags: ['Collaboration', 'Preproduction', 'Ritual'] },
  { id: 'workshop-structure', title: 'Workshop Structure That Actually Teaches', excerpt: 'A practical workshop format for photographers that balances demonstration with hands-on shooting.', category: 'Community', date: 'March 2026', readingTime: '7 min read', tags: ['Workshop', 'Teaching', 'Practice'] },
  { id: 'sharing-process', title: 'Sharing Your Process Without Oversharing', excerpt: 'What to publish, when to hold back, and how to make process storytelling feel thoughtful.', category: 'Community', date: 'March 2026', readingTime: '5 min read', tags: ['Process', 'Story', 'Publish'] },
  { id: 'finding-mentors', title: 'Finding Mentors and Creative Peers in Photography', excerpt: 'How to connect with photographers who can help you improve while staying self-directed.', category: 'Community', date: 'February 2026', readingTime: '6 min read', tags: ['Mentorship', 'Community', 'Growth'] },
  { id: 'shooting-with-others', title: 'Shooting with Others: Shared Sessions That Stay Focused', excerpt: 'A structure for group shoots that keeps everyone productive and creatively aligned.', category: 'Community', date: 'February 2026', readingTime: '6 min read', tags: ['Group', 'Session', 'Focus'] },
  { id: 'publishing-investment', title: 'Investing in Publishing: Zines, Books, and Exhibitions', excerpt: 'Why publishing your work is the best way to sharpen your editorial decisions and build credibility.', category: 'Community', date: 'January 2026', readingTime: '7 min read', tags: ['Publishing', 'Zine', 'Exhibition'] },
  { id: 'creative-rituals', title: 'Creative Rituals for Consistent Photography Practice', excerpt: 'Simple weekly habits that keep your vision sharp and your portfolio moving forward.', category: 'Community', date: 'January 2026', readingTime: '5 min read', tags: ['Ritual', 'Practice', 'Consistency'] },
  { id: 'accountability-projects', title: 'Accountability Projects That Move Your Work Forward', excerpt: 'Project structures that force deadlines, iteration, and stronger story decisions.', category: 'Community', date: 'December 2025', readingTime: '6 min read', tags: ['Project', 'Accountability', 'Progress'] },
]

const CATEGORIES = ['All', 'Lighting', 'Composition', 'Editing', 'Story', 'Gear', 'Community']

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

function BlogCard({ post }) {
  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-400">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{post.category}</span>
        <span>{post.readingTime}</span>
      </div>
      <h2 className="mt-5 text-[1.35rem] font-bold leading-tight text-white">{post.title}</h2>
      <p className="mt-4 text-sm leading-6 text-slate-300">{post.excerpt}</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {post.tags.map(tag => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-[12px] uppercase tracking-[0.25em] text-cyan-300/80">
        <span>{post.date}</span>
        <button className="rounded-full border border-cyan-300/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/10">
          Read article
        </button>
      </div>
    </motion.article>
  )
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return BLOG_POSTS
    return BLOG_POSTS.filter(post => post.category === activeCategory)
  }, [activeCategory])

  const latestPost = filteredPosts[0] || BLOG_POSTS[0]

  return (
    <div className="relative min-h-screen overflow-hidden  text-white">
      <div className="absolute inset-0 -z-10 ">
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-[28rem] h-[28rem] bg-white/5 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16">
        <motion.div
          className="mb-12 grid gap-10 lg:grid-cols-[1.25fr_0.8fr]"
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={FADE_UP} className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.5em] text-cyan-300/60">Photography essays</p>
            <h1 className="text-[clamp(2.4rem,6vw,3.9rem)] font-black leading-[1.02] tracking-[-0.04em] text-white">
              Photography blog stories
              <span className="ml-2 text-[clamp(2.8rem,7vw,4.4rem)] text-transparent [-webkit-text-stroke:1.4px_rgba(226,232,240,0.75)]">
                for image makers
              </span>
            </h1>
            <p className="max-w-xl text-[14px] leading-7 text-slate-300">
              Accurate, practical photography writing that covers lighting, composition, editing, gear, and storytelling for photographers who want to improve every shoot.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-500/20">
                Explore latest
              </button>
              <button className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-slate-200 transition hover:border-white/20 hover:bg-white/10">
                Join the newsletter
              </button>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="grid gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Photography metrics</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { value: '30+', label: 'Published articles' },
                  { value: '6', label: 'Topics covered' },
                  { value: '75k', label: 'Monthly readers' },
                ].map(metric => (
                  <div key={metric.label} className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                    <p className="text-[26px] font-black text-white">{metric.value}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-400">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Editorial focus</p>
              <p className="mt-4 text-[13px] leading-7 text-slate-300">
                Practical photography insights built around craft, visual language, and the decisions that matter in a real shoot.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mb-10 grid gap-6 lg:grid-cols-[1.8fr_1fr]"
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={FADE_UP} className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">Featured story</p>
                <h2 className="mt-3 text-[clamp(1.8rem,3vw,2.7rem)] font-black text-white">{latestPost.title}</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-slate-300">
                {latestPost.date}
              </div>
            </div>
            <p className="mt-6 text-[15px] leading-8 text-slate-300">{latestPost.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {latestPost.tags.map(tag => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2">Field-tested advice</span>
              <span>{latestPost.readingTime}</span>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="grid gap-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Filter by category</p>
                <p className="mt-2 text-[24px] font-bold text-white">Refine your reading</p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-slate-300">
                {filteredPosts.length} results
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.15em] transition ${
                    activeCategory === category
                      ? 'border border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
          variants={STAGGER}
          initial="hidden"
          animate="show"
        >
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredPosts.slice(0, 10).map((post, index) => (
                <BlogCard key={post.id || `blog-${index}`} post={post} />
              ))}
            </div>
          </div>

          <aside className="grid gap-6">
            <motion.div
              variants={FADE_UP}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Newsletter</p>
              <h3 className="mt-4 text-[1.6rem] font-bold text-white">Get photography lessons in your inbox</h3>
              <p className="mt-4 text-[13px] leading-7 text-slate-300">
                Weekly essays on lighting, editing, composition, and how to build stronger bodies of work.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
                <button className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-cyan-400">
                  Subscribe
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={FADE_UP}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Top reads</p>
              <div className="mt-5 space-y-4">
                {BLOG_POSTS.slice(0, 3).map((post, index) => (
                  <div key={post.id || `top-read-${index}`} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      <span>{post.category}</span>
                      <span>{post.date}</span>
                    </div>
                    <h4 className="mt-3 text-[1rem] font-semibold text-white">{post.title}</h4>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={FADE_UP} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Why this blog</p>
              <ul className="mt-4 space-y-3 text-[13px] leading-7 text-slate-300">
                <li>Practical photography techniques, not vague theory.</li>
                <li>Built for image makers who shoot in the real world.</li>
                <li>Focuses on the craft of light, story, and edit decisions.</li>
              </ul>
            </motion.div>
          </aside>
        </motion.div>
      </div>
    </div>
  )
}
