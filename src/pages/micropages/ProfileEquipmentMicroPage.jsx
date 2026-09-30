import React, { useMemo, useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { getMyUserDetails, editEquipment } from "../../api/api.js";

const equipmentSections = [
  {
    title: "Camera Bodies",
    items: [
      "Sony A7 IV","Sony A7R V","Sony A7S III","Sony A7C II","Sony A7C R","Sony A9 III","Sony A1","Sony ZV-E1","Sony A6700","Sony A6400",
      "Fujifilm X-T5","Fujifilm X-T4","Fujifilm X-H2","Fujifilm X-H2S","Fujifilm X-S20","Fujifilm X100VI","Fujifilm X100V","Fujifilm GFX 100S","Fujifilm GFX 50S II","Fujifilm X-E4",
      "Canon EOS R6 Mark II","Canon EOS R5","Canon EOS R5 Mark II","Canon EOS R3","Canon EOS R7","Canon EOS R10","Canon EOS R50","Canon EOS R1","Canon EOS R8","Canon EOS 90D",
      "Nikon Z8","Nikon Z9","Nikon Z6 III","Nikon Z6 II","Nikon Z7 II","Nikon Z5 II","Nikon Z50 II","Nikon Zf","Nikon Z30","Nikon D780",
      "Panasonic Lumix S5 II","Panasonic Lumix S5 IIX","Panasonic Lumix S1R","Panasonic Lumix G9 II","Panasonic Lumix GH7","Panasonic Lumix S9",
      "OM System OM-1 Mark II","OM System OM-5","OM System OM-1",
      "Leica SL3","Leica M11","Leica Q3","Leica SL2-S",
      "Hasselblad X2D 100C","Phase One IQ4 150MP","Sigma fp L","Sigma fp",
      "Ricoh GR IIIx","Ricoh GR III","DJI Osmo Pocket 3","GoPro Hero 12 Black",
      "Sony RX1R II","Sony RX100 VII","Canon PowerShot G7 X III",
      "Blackmagic Pocket Cinema 6K Pro","Blackmagic Cinema 6K G2","RED KOMODO 6K",
      "ARRI Alexa Mini LF","Sony FX3","Sony FX6","Canon EOS C70","Nikon Z fc",
      "Canon EOS 5D Mark IV","Nikon D850","Pentax K-3 Mark III","Pentax 645Z",
    ],
  },
  {
    title: "Lenses",
    items: [
      "Sony FE 24-70mm f/2.8 GM II","Sony FE 70-200mm f/2.8 GM OSS II","Sony FE 16-35mm f/2.8 GM II","Sony FE 85mm f/1.4 GM","Sony FE 50mm f/1.2 GM",
      "Sony FE 35mm f/1.4 GM","Sony FE 24mm f/1.4 GM","Sony FE 135mm f/1.8 GM","Sony FE 200-600mm f/5.6-6.3 G OSS","Sony FE 12-24mm f/2.8 GM",
      "Sony FE 50mm f/2.5 G","Sony FE 24-105mm f/4 G OSS","Sony FE 70-300mm f/4.5-5.6 G OSS","Sony FE 100-400mm f/4.5-5.6 GM","Sony FE 400mm f/2.8 GM",
      "Sigma 35mm f/1.4 DG DN Art","Sigma 85mm f/1.4 DG DN Art","Sigma 50mm f/1.4 DG DN Art","Sigma 24-70mm f/2.8 DG DN Art","Sigma 70-200mm f/2.8 DG DN OS Sports",
      "Sigma 14-24mm f/2.8 DG DN Art","Sigma 100-400mm f/5-6.3 DG DN OS C","Sigma 18-50mm f/2.8 DC DN C","Sigma 56mm f/1.4 DC DN C","Sigma 30mm f/1.4 DC DN C",
      "Sigma 14mm f/1.8 DG HSM Art","Sigma 20mm f/1.4 DG DN Art","Sigma 24mm f/1.4 DG DN Art","Sigma 105mm f/2.8 DG DN Macro Art","Sigma 70mm f/2.8 DG Macro Art",
      "Canon RF 50mm f/1.2L USM","Canon RF 85mm f/1.2L USM","Canon RF 28-70mm f/2L USM","Canon RF 70-200mm f/2.8L IS USM","Canon RF 24-70mm f/2.8L IS USM",
      "Canon RF 15-35mm f/2.8L IS USM","Canon RF 100mm f/2.8L Macro IS USM","Canon RF 800mm f/5.6L IS USM","Canon RF 100-500mm f/4.5-7.1L IS USM","Canon RF 35mm f/1.8 IS STM",
      "Canon RF 50mm f/1.8 STM","Canon RF 16mm f/2.8 STM","Canon RF 24mm f/1.8 IS STM","Canon RF 135mm f/1.8L IS USM","Canon RF 200-800mm f/6.3-9 IS USM",
      "Nikon NIKKOR Z 50mm f/1.2 S","Nikon NIKKOR Z 85mm f/1.2 S","Nikon NIKKOR Z 24-70mm f/2.8 S","Nikon NIKKOR Z 70-200mm f/2.8 VR S","Nikon NIKKOR Z 14-24mm f/2.8 S",
      "Nikon NIKKOR Z 35mm f/1.8 S","Nikon NIKKOR Z 24mm f/1.8 S","Nikon NIKKOR Z 58mm f/0.95 S Noct","Nikon NIKKOR Z 180-600mm f/5.6-6.3 VR","Nikon NIKKOR Z 400mm f/4.5 VR S",
      "Nikon NIKKOR Z 105mm f/2.8 VR S","Nikon NIKKOR Z 24-200mm f/4-6.3 VR","Nikon NIKKOR Z 28mm f/2.8","Nikon NIKKOR Z 40mm f/2","Nikon NIKKOR Z 600mm f/6.3 VR S",
      "Tamron 35-150mm f/2-2.8 Di III VXD","Tamron 28-75mm f/2.8 Di III VXD G2","Tamron 70-180mm f/2.8 Di III VXD G2","Tamron 17-28mm f/2.8 Di III RXD","Tamron 150-500mm f/5-6.7 Di III VC VXD",
      "Tamron 20mm f/2.8 Di III OSD M1:2","Tamron 24mm f/2.8 Di III OSD M1:2","Tamron 35mm f/2.8 Di III OSD M1:2","Tamron 11-20mm f/2.8 Di III-A RXD","Tamron 18-300mm f/3.5-6.3 Di III-A VC VXD",
      "Fujifilm XF 23mm f/1.4 R LM WR","Fujifilm XF 33mm f/1.4 R LM WR","Fujifilm XF 56mm f/1.2 R WR","Fujifilm XF 50mm f/1.0 R WR","Fujifilm XF 16-55mm f/2.8 R LM WR",
      "Fujifilm XF 50-140mm f/2.8 R LM OIS WR","Fujifilm XF 100-400mm f/4.5-5.6 R LM OIS WR","Fujifilm XF 8-16mm f/2.8 R LM WR","Fujifilm XF 18mm f/1.4 R LM WR","Fujifilm XF 90mm f/2 R LM WR",
      "Voigtlander Nokton 50mm f/1.2 Aspherical","Voigtlander Nokton 35mm f/1.2 Aspherical III","Zeiss Milvus 85mm f/1.4","Zeiss Batis 85mm f/1.8","Zeiss Loxia 35mm f/2",
      "Laowa 15mm f/2 Zero-D","Laowa 12mm f/2.8 Zero-D","Laowa 25mm f/2.8 2.5-5x Ultra Macro","Laowa 85mm f/5.6 2x Ultra Macro APO","Laowa 9mm f/2.8 Zero-D",
      "Canon TS-E 24mm f/3.5L II","Canon TS-E 90mm f/2.8L Macro","Nikon PC-E 24mm f/3.5 ED","Irix 150mm f/2.8 Macro","Irix 45mm f/1.4 Dragonfly",
      "50mm f/1.4 Canon EF","35mm f/2 IS USM","85mm f/1.8 Nikon F","24mm f/2.8 Pancake","135mm f/2L USM","200mm f/2L IS USM","300mm f/2.8L IS II USM","400mm f/2.8L IS III USM",
      "24-70mm f/2.8 Canon EF","16-35mm f/4L IS USM","100-400mm f/4.5-5.6L IS II USM","70-300mm f/4.5-5.6 IS II USM","18-135mm f/3.5-5.6 IS USM",
      "Panasonic Lumix S 50mm f/1.8","Panasonic Lumix S 85mm f/1.8","Panasonic S Pro 50mm f/1.4","Panasonic S PRO 70-200mm f/4 OIS","OM System 12-40mm f/2.8 PRO II",
      "OM System 40-150mm f/2.8 PRO","OM System 7-14mm f/2.8 PRO","OM System 300mm f/4 IS PRO","Leica APO-Summicron-SL 35mm f/2 ASPH","Leica Vario-Elmarit-SL 24-90mm f/2.8-4 ASPH",
      "Samyang AF 85mm f/1.4 FE II","Samyang AF 35mm f/1.8 FE","Samyang AF 50mm f/1.4 FE II","Tokina atx-m 23mm f/1.4 E","Tokina atx-m 56mm f/1.4 E",
      "Viltrox AF 85mm f/1.8 FE II","Viltrox AF 56mm f/1.4 E","Viltrox AF 23mm f/1.4 E","Viltrox AF 13mm f/1.4 XF","Viltrox AF 27mm f/1.2 Pro XF",
      "7Artisans 50mm f/0.95","7Artisans 35mm f/0.95","7Artisans 25mm f/0.95","Mitakon Speedmaster 50mm f/0.95","TTArtisan 50mm f/0.95",
      "Meyer-Optik Trioplan 100mm f/2.8","Lensbaby Velvet 85mm f/1.8","Lensbaby Sol 45mm f/3.5","Lomography New Petzval 80.5mm f/1.9","Lomography Daguerreotype Achromat 64mm f/2.9",
    ],
  },
  {
    title: "Lighting",
    items: [
      "Godox AD200Pro","Godox AD300Pro","Godox AD400Pro","Godox AD600Pro","Godox AD100Pro",
      "Godox V1 Round Head Flash","Godox V860III","Godox V860IV","Godox TT685II","Godox V1 Pro",
      "Godox SL60IID","Godox SL150II","Godox SL200II","Godox SL300III","Godox ML60II",
      "Godox KNOWLED MG1200Bi","Godox KNOWLED MG200Bi","Godox KNOWLED MG400Bi","Godox LC500R RGB","Godox LC500 Bi-Color",
      "Aputure LS 600d Pro","Aputure LS 600x Pro","Aputure LS 300d II","Aputure LS 300x","Aputure LS 120d II",
      "Aputure Amaran 100d","Aputure Amaran 100x","Aputure Amaran 200d","Aputure Amaran 60d","Aputure Amaran 200x",
      "Aputure AL-MX","Aputure MC Pro","Aputure MC 4-Light Travel Kit","Aputure F22c","Aputure Nova P600c",
      "Profoto B10 Plus","Profoto B10X Plus","Profoto A10","Profoto D2 500 Monolight","Profoto D2 1000 Monolight",
      "Profoto Pro-11 2400 AirTTL","Profoto A2","Profoto C1 Plus",
      "Elinchrom ELC 500 TTL","Elinchrom ELC 1000 TTL","Elinchrom ONE","Elinchrom D-Lite RX 4","Elinchrom Five",
      "Nanlite Forza 300B II","Nanlite Forza 720B","Nanlite Pavotube II 30C","Nanlite Pavotube II 15C","Nanlite FS-200 Bi-Color",
      "Nanlite MixPanel 150","Nanlite Forza 500B II",
      "Canon Speedlite 600EX II-RT","Canon Speedlite EL-1","Nikon SB-5000","Nikon SB-700","Sony HVL-F60RM2",
      "Westcott FJ400","Westcott Rapid Box XXL","Flashpoint XPLOR 400 Pro TTL",
      "MagMod Speed Ring","Rogue FlashBender 3 XL Pro","Lastolite Ezybox Speed-Lite 2","Glow EZ Lock Octa",
    ],
  },
  {
    title: "Support",
    items: [
      "Peak Design Travel Tripod","Peak Design Carbon Travel Tripod","Gitzo Traveler GT1545T","Gitzo GT3543XLS","Gitzo Systematic GT4552S",
      "Manfrotto MT055CXPRO4","Manfrotto 190X","Manfrotto Befree Advanced","Joby GorillaPod 3K","Joby GorillaPod 5K",
      "Really Right Stuff TVC-34L","Really Right Stuff Ascend-14","Benro Mach3 TMA28CL","Benro Rhino 3 Series","Vanguard Alta Pro 264AB",
      "MeFOTO GlobeTrotter Carbon","Sirui ET-2004","Sirui 3T-35K","Zomei Z669C","ProMediaGear TR344L",
      "Manfrotto XPRO Ball Head","Manfrotto 496RC2","Really Right Stuff BH-40","Really Right Stuff BH-55","Arca-Swiss Monoball Z1 dp",
      "Kirk BH-1 Ball Head","Jobu Design Pro 2 HD","Acratech Ultimate GP","Benro G3 XL","Sirui K-40X",
      "Manfrotto 405 Pro Geared Head","Benro GD3WH Geared Head","Wimberley WH-200 Gimbal Head","Jobu Design BWG-M4 Gimbal",
      "Manfrotto XPRO 4-Section Monopod","Gitzo GM2562T Series 2 Carbon","Benro MAD49A","Vanguard VEO 2S AM-264TR",
      "DJI RS 4 Pro","DJI RS 4","DJI RS 3 Mini","Zhiyun Crane 4","Zhiyun Crane-M3 Pro",
      "Moza AirCross 3 Pro","FeiyuTech SCORP 2","Zhiyun Weebill 3S","DJI OM 6","Hohem iSteady V2 Pro",
      "Rhino Slider EVO Carbon 24in","Edelkrone SliderPlus Pro","Syrp Magic Carpet Carbon","Kessler Pocket Dolly","iFootage Wild Bull T1 Motorized Slider",
      "Syrp Genie II","Edelkrone HeadONE","Syrp Slingshot","Platypod Ultra","Platypod Max",
      "Really Right Stuff L-Plate Universal","Kirk Camera L-Bracket","Smallrig L-Bracket Universal","Arca-Swiss Universal L-Bracket","Sunwayfoto PCL-series L-bracket",
      "Smallrig Sony A7 IV Cage","Smallrig Canon R5 Cage","Tilta Full Camera Cage Universal","Shape Sony FX3 Cage","Vocas MB-436 Matte Box",
      "Manfrotto 244 Magic Arm","Kupo Grip Arm","Avenger C-Stand 30","Avenger A2033LCB Century Stand","Matthews C-Stand 40",
      "Kupo Baby Pin Adapter","Manfrotto Super Clamp","Impact Super Clamp","Noga Arm","Foba BOTO Camera Stand",
      "Kaiser Repro Stand RS 2XA","Neewer Table Top Studio Stand","Pedco UltraClamp",
    ],
  },
  {
    title: "Accessories",
    items: [
      "NiSi S6 150mm Filter Holder Kit","NiSi 100mm V7 ND Filter System","Kase Wolverine 100mm Magnetic ND System","Lee Filters 100mm Foundation Kit","Haida M10 Filter Holder",
      "NiSi 6-Stop ND1000","NiSi 10-Stop ND32000","B+W 77mm XS-Pro Nano MRC ND 1000","Tiffen Variable ND 2-8 Stop","Kase 150mm Soft Grad ND 0.9",
      "NiSi 82mm Circular CPL","Hoya HD Nano-ANT IX Circular PL","B+W 82mm Kaesemann CPL","Breakthrough Photography X4 UV","NiSi 77mm True Color CPL",
      "Sony NP-FZ100 OEM","Sony NP-FZ100 Patona Premium","Fujifilm NP-W235","Canon LP-E6NH","Nikon EN-EL15c",
      "SmallHD FOCUS 5 Monitor","Atomos Ninja V+","Atomos Shogun Ultra","SmallHD Cine 7","Feelworld LUT7S",
      "Anker 737 Power Bank","Mophie Powerstation Pro XL","Goal Zero Sherpa 100 AC","Jackery Explorer 240","Anker 545 Solar Generator",
      "SanDisk Extreme PRO 256GB CFexpress Type B","ProGrade Digital 650GB CFexpress Type B","Delkin Devices POWER CFexpress 256GB","SanDisk Extreme PRO 512GB V90","Lexar Professional 3500x 256GB CFexpress",
      "Samsung 990 Pro 2TB SSD","Samsung T9 4TB Portable SSD","SanDisk Pro-Blade SSD","OWC Envoy Pro FX 2TB","LaCie Rugged SSD Pro 4TB",
      "CalDigit TS4 Thunderbolt 4 Dock","OWC Thunderbolt Go Dock","Satechi USB-C Multiport Adapter","Belkin Thunderbolt 3 Dock","Anker USB-C Hub 10-in-1",
      "Rode VideoMic Pro+","Rode Wireless GO II","DJI Mic 2","Sennheiser MKE 400 Mobile Kit","Hollyland Lark M1 Duo",
      "Zoom H5 Field Recorder","Sony ECM-G1","Rode PodMic","Deity V-Mic D4 Duo","Saramonic Blink500 Pro X",
      "DJI Mini 4 Pro","DJI Air 3","DJI Mavic 3 Pro","Autel EVO Lite+","DJI Mini 3 Pro",
      "CamRanger 2","Tether Tools Case Relay Camera Power System","Miops Smart+ Camera Trigger","MIOPS Mobile Remote","Tethering USB-C Cable 15ft",
      "Peak Design Everyday Backpack 30L","Lowepro ProTactic BP 450 AW II","F-Stop Ajna 37L","Wandrd PRVKE 41L","Think Tank Photo Airport Roller Derby",
      "Peak Design Slide Lite Strap","BlackRapid Sport Breathe Strap","Cotton Carrier G3 Vest System","Spider Holster SpiderPro","Op/Tech Utility Sling",
      "X-Rite ColorChecker Passport","Datacolor Spyder X Ultra","X-Rite i1Display Pro Plus","Calibrite Display SL","DaVinci Resolve Color Checker",
      "Lens Align MkII Focus Calibration","Visible Dust EZ Sensor Cleaning Kit","LensPen Original Lens Cleaner","B+W Micro-Fiber Cleaning Cloth","Giottos Rocket Air Blower",
      "Pelican 1510 Carry-On Case","Pelican Storm iM2500 Case","SKB iSeries 1510-6 Case","HPRC 2550W Wheeled Case","Think Tank Airport Security V3.0",
      "Shimoda Action X50 Backpack","Tenba Solstice 12L Sling","F-Stop Large Pro ICU","Manfrotto Mbag80PN Tripod Bag","Peak Design Shell Rain Cover",
    ],
  },
];

// Searchable dropdown — drop-in replacement for the native <select>
const SearchableSelect = ({ sectionTitle, items, value, onChange }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? items.filter((i) => i.toLowerCase().includes(q)) : items;
  }, [query, items]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel =
    value === "none" ? "None" : value === "half" ? "50/50" : value;

  const select = (val) => {
    onChange(val);
    setQuery(val === "none" || val === "half" ? "" : val);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Input */}
      <input
        type="text"
        value={open ? query : displayLabel === "None" ? "" : displayLabel}
        placeholder={open ? `Search ${sectionTitle.toLowerCase()}…` : displayLabel}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(""); setOpen(true); }}
        className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition hover:border-white/20 w-full"
        style={{ cursor: "pointer" }}
      />

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-2xl border border-white/10 bg-black overflow-y-auto"
          style={{ maxHeight: 220, boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* None */}
          <div
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${value === "none" ? "text-cyan-300" : "text-gray-400"}`}
            onMouseDown={() => select("none")}
          >
            None
          </div>

          {/* Items */}
          {filtered.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500 italic">No results</div>
          )}
          {filtered.map((item) => (
            <div
              key={item}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${value === item ? "text-cyan-300" : "text-white"}`}
              onMouseDown={() => select(item)}
            >
              {item}
            </div>
          ))}

          {/* 50/50 */}
          <div
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${value === "half" ? "text-cyan-300" : "text-gray-400"}`}
            onMouseDown={() => select("half")}
          >
            50/50
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileEquipmentMicroPage = () => {
  const initialSelection = useMemo(
    () =>
      equipmentSections.reduce(
        (acc, section) => ({ ...acc, [section.title]: "none" }),
        {},
      ),
    [],
  );

  const [selection, setSelection] = useState(initialSelection);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSelectionChange = (sectionTitle, value) => {
    setSelection((prev) => ({ ...prev, [sectionTitle]: value }));
  };

  const selectedCount = useMemo(
    () => Object.values(selection).filter((value) => value !== "none").length,
    [selection],
  );

  const noneCount = useMemo(
    () => Object.values(selection).filter((value) => value === "none").length,
    [selection],
  );

  const hasChanges = useMemo(
    () =>
      Object.keys(initialSelection).some(
        (key) => initialSelection[key] !== selection[key],
      ),
    [initialSelection, selection],
  );

  useEffect(() => {
    let isMounted = true;

    const loadEquipment = async () => {
      try {
        setLoading(true);
        const response = await getMyUserDetails();
        const userEquipment = response?.user?.equipment;

        if (isMounted && userEquipment && typeof userEquipment === "object") {
          const nextSelection = { ...initialSelection };
          Object.keys(userEquipment).forEach((key) => {
            if (key in nextSelection) {
              nextSelection[key] = userEquipment[key] || "none";
            }
          });
          setSelection(nextSelection);
        }
      } catch (error) {
        console.warn("Unable to load equipment:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEquipment();

    return () => {
      isMounted = false;
    };
  }, [initialSelection]);

  const handleSaveEquipment = async () => {
    try {
      setSaving(true);
      await editEquipment(selection);
      toast.success("Equipment saved successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to save equipment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto ml-37 py-10 text-center text-white">
        Loading equipment...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto ml-37 space-y-6  py-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-wide">Equipment</h1>
        <p className="text-sm text-gray-400">
          Choose one option per category. For camera bodies, lenses, lighting, support,
          and accessories, select the gear you actually have from the dropdown.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="border-2 border-white bg-black shadow-[6px_6px_0_white] p-6 md:p-8 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                Equipment selector
              </p>
              <h2 className="text-lg font-semibold">Pick the gear you own</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300">
                {selectedCount}/{equipmentSections.length} categories selected
              </div>
              <button
                type="button"
                onClick={handleSaveEquipment}
                disabled={saving || !hasChanges}
                className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Equipment"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Selected</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-100">{selectedCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Not set</p>
              <p className="mt-2 text-2xl font-semibold text-gray-200">{noneCount}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-gray-300">
            <p className="font-semibold text-white">How to use</p>
            <p className="mt-3 leading-6">
              Use the dropdown inside each category to choose the one item you actually own.
              Select &ldquo;50/50&rdquo; if you can sometimes source a piece, or choose &ldquo;None&rdquo; if you
              currently don&rsquo;t own equipment in that category.
            </p>
          </div>
        </div>

        <div className="border-2 border-white bg-black shadow-[6px_6px_0_white] p-6 md:p-8 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
              Snapshot
            </p>
            <h2 className="text-lg font-semibold">Your active kit</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
            {equipmentSections.map((section) => (
              <div key={section.title} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-400">{section.title}</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-200">
                  {selection[section.title] === "none"
                    ? "None"
                    : selection[section.title] === "half"
                    ? "50/50"
                    : selection[section.title]}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-gray-300">
            <p className="font-semibold text-white">Tip</p>
            <p className="mt-3 leading-6">
              This makes each camera category behave like a single choice: one body,
              one favorite lens, one key lighting kit option, and so on.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {equipmentSections.map((section) => (
          <div
            key={section.title}
            className="border-2 border-white bg-black shadow-[6px_6px_0_white] p-6 md:p-7"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <p className="text-xs text-gray-400">Choose one option you own.</p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-gray-400">
                {section.items.length} choices
              </span>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <label className="flex flex-col gap-2 text-xs text-gray-400">
                <span className="text-sm text-white">I have this equipment</span>
                <SearchableSelect
                  sectionTitle={section.title}
                  items={section.items}
                  value={selection[section.title]}
                  onChange={(val) => handleSelectionChange(section.title, val)}
                />
              </label>
              <div className="mt-3 text-xs text-gray-400">
                Current:{" "}
                <span className="text-white">
                  {selection[section.title] === "none"
                    ? "None"
                    : selection[section.title] === "half"
                    ? "50/50"
                    : selection[section.title]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileEquipmentMicroPage;