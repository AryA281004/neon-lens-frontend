import React,{ useEffect} from "react";
import { motion } from "framer-motion";
import { createPost } from "../api/api";

const categories = [
  { value: "landscape", label: "🏔️ Landscape", icon: "https://cdn.lordicon.com/ijsqrapz.json" },
  { value: "portrait", label: "👤 Portrait", icon: "https://cdn.lordicon.com/ssartdnc.json" },
  { value: "wildlife", label: "🦁 Wildlife", icon: "https://cdn.lordicon.com/kdcogpuc.json" },
  { value: "street", label: "🏙️ Street", icon: "https://cdn.lordicon.com/rbsqvtgo.json" },
  { value: "macro", label: "🔍 Macro", icon: "https://cdn.lordicon.com/okpagiuc.json" },
  { value: "architecture", label: "🏛️ Architecture", icon: "https://cdn.lordicon.com/jlzdkwyu.json" },
  { value: "space", label: "⭐ Space", icon: "https://cdn.lordicon.com/vgwutnhw.json" },
    { value: "other", label: "📸 Other", icon: "https://cdn.lordicon.com/gzqofmcx.json" },
  
];

const PostForm = (postData) => {
  const [content, setContent] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [category, setCategory] = React.useState("landscape");
  const [tags, setTags] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);

  // IMAGE PREVIEW
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processImage(file);
  };

  useEffect(() => {
      // Load Lord Icon from CDN
      const script = document.createElement('script')
      script.src = 'https://cdn.lordicon.com/lordicon.js'
      document.body.appendChild(script)
    }, [])

  const processImage = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  // DRAG & DROP
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImage(files[0]);
    }
  };

  // TAGS HANDLER
  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  // Parse tags for preview
  const parsedTags = tags
    .split(",")
    .map((tag) => {
      const trimmed = tag.trim();
      return trimmed ? (trimmed.startsWith("#") ? trimmed : `#${trimmed}`) : null;
    })
    .filter(Boolean);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!image) {
        setError("📸 Please upload an image");
        setLoading(false);
        return;
      }

      const postData = {
        caption: content,
        category,
        tags: parsedTags,
        image: image,
        location: ""
      };

      await createPost(postData);

      // SUCCESS STATE
      setSuccess(true);

      // RESET
      setTimeout(() => {
        setContent("");
        setImage(null);
        setPreview(null);
        setTags("");
        setCategory("landscape");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("❌ Failed to create post. Please try again.");
    }

    setLoading(false);
  };

  const selectedCategory = categories.find(cat => cat.value === category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      
      className="w-[60vw]"
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex flex-col gap-6
          bg-linear-to-br from-white/10 to-white/5 backdrop-blur-2xl
          border border-white/20
          rounded-3xl p-8 shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="mb-2">
          <h2 className="text-3xl font-bold bg-linear-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
             Create Your Post
          </h2>
          <p className="text-white/50 text-sm mt-1">Share your Vision, Composition, Light, Angles and Exposure.</p>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-white/80 uppercase flex items-center tracking-widest">
             <lord-icon
    src="https://cdn.lordicon.com/wsaaegar.json"
    trigger="hover"
    stroke="bold"
    colors="primary:#ffffff,secondary:#ffffff"
   style={{width: '40px', height: '40px'}}>
</lord-icon> Upload Image
          </label>

          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              w-full h-56 flex flex-col items-center justify-center
              border-2 border-dashed rounded-2xl cursor-pointer
              transition-all duration-300 group
              ${dragActive 
                ? 'border-cyan-400/60 bg-cyan-500/10 scale-105' 
                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
              }
            `}
          >
            {preview ? (
              <div className="relative w-full h-full group">
                <img
                  src={preview}
                  alt="preview"
                  className="h-full w-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl flex items-center justify-center">
                  <span className="text-white/0 group-hover:text-white/70 text-sm font-semibold transition-all">
                    Change Image
                  </span>
                </div>
              </div>
            ) : (
              <>
                <lord-icon
                  src="https://cdn.lordicon.com/wsaaegar.json"
                  trigger="hover"
                    delay="1500"
                    state="reveal"
                    colors="primary:#ffffff,secondary:#ffffff"
                  style={{width: '150px', height: '150px'}}>
                </lord-icon>
                <span className="text-white/60 text-sm font-medium">
                  Drag image here or click to upload
                </span>
                <span className="text-white/40 text-xs mt-1">
                  PNG, JPG up to 5MB
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* CAPTION */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-white/80 flex items-center uppercase tracking-widest">
              <lord-icon
    src="https://cdn.lordicon.com/exymduqj.json"
    trigger="hover"
    delay="1500"
    stroke="bold"
    state="dynamic"
    colors="primary:#ffffff,secondary:#ffffff"
   style={{width: '40px', height: '40px'}}>
</lord-icon>Caption
            </label>
            <span className={`text-xs font-medium ${content.length > 1800 ? 'text-red-400' : 'text-white/40'}`}>
              {content.length}/2000
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 2000))}
            placeholder="Write something inspiring..."
            className="
              w-full px-4 py-4 rounded-xl
              bg-white/5 backdrop-blur-md
              border border-white/10
              text-white placeholder-white/30
              outline-none resize-none
              focus:border-white/40 focus:bg-white/10 focus:ring-1 focus:ring-white/20
              transition-all duration-200
              font-medium
            "
            rows={4}
          />
        </div>

        {/* CATEGORY */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold flex items-center text-white/80 uppercase tracking-widest">
            <lord-icon
    src="https://cdn.lordicon.com/dutqakce.json"
    trigger="hover"
    delay="1500"
    state="category"
    colors="primary:#ffffff"
   style={{width: '40px', height: '40px'}}>
</lord-icon>
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`
                  px-3 py-3 rounded-xl font-medium text-sm
                  transition-all duration-200 text-center flex items-center justify-center gap-2
                  ${category === cat.value
                    ? 'bg-linear-to-r from-white/30 to-white/20 border border-white/40 text-white shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <lord-icon
    src={cat.icon}    
    trigger="morph"
    stroke="bold"
    state="morph-sea"
    colors="primary:#ffffff,secondary:#ffffff"
    style={{width: '40px', height: '40px'}}>
</lord-icon> <span className="hidden sm:inline">{cat.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TAGS */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-white/80 flex items-center uppercase tracking-widest">
              <lord-icon
    src="https://cdn.lordicon.com/abgykmtd.json"
    trigger="hover"
    delay="1500"
    state="in-label"
    colors="primary:#ffffff"
   style={{width: '40px', height: '40px'}}>
</lord-icon> Tags
            </label>
            <span className="text-xs text-white/40">
              {parsedTags.length} tag{parsedTags.length !== 1 ? 's' : ''}
            </span>
          </div>
          <input
            type="text"
            value={tags}
            onChange={handleTagsChange}
            placeholder="#nature, #sunset, #travel"
            className="
              w-full px-4 py-3 rounded-xl
              bg-white/5
              border border-white/10
              text-white placeholder-white/30
              outline-none
              focus:border-white/40 focus:bg-white/10 focus:ring-1 focus:ring-white/20
              transition-all duration-200
              font-medium
            "
          />
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {parsedTags.map((tag, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="
                    px-3 py-1 rounded-full text-xs font-semibold
                    bg-linear-to-r from-cyan-400/30 to-blue-400/30
                    border border-cyan-400/50 text-cyan-200
                  "
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-300 text-sm bg-red-500/15 border border-red-500/30 px-4 py-3 rounded-xl backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {/* SUCCESS */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-green-300 text-sm bg-green-500/15 border border-green-500/30 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-2"
          >
            ✅ Post created successfully!
          </motion.div>
        )}

        {/* SUBMIT */}
        <motion.button
          type="submit"
          disabled={loading || success}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            py-4 px-6 rounded-xl font-bold text-lg
            transition-all duration-300
            ${success
              ? 'bg-linear-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-500/50'
              : loading
              ? 'bg-linear-to-r from-white/30 to-white/20 text-white cursor-wait'
              : 'bg-linear-to-r from-white via-white/95 to-white/90 text-black hover:shadow-2xl hover:shadow-white/30 hover:from-white hover:to-white'
            }
          `}
        >
          {success ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ✨ Posted!
            </motion.span>
          ) : loading ? (
            <span className="flex items-center gap-2 justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ⏳
              </motion.span>
              Posting...
            </span>
          ) : (
            "🚀 Create Post"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default PostForm;