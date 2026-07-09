import fs from 'fs';

const rawItems = [
"ACCELERATOR MOUNTING", "AIR FILTER", "AIR HORSE", "AXEL FOUNDATION", "AXEL FRONT", "AXEL REAR", "AXEL SLEEVE/HALF AXEL", "BEARING", "BRAKE CAM SET", "BRAKE LEVER", "BRAKE LIGHT SWITCH FRONT", "BRAKE LIGHT SWITCH REAR", "BRAKE PADEL", "BRAKE PEDAL SPRING", "BRAKE ROD", "BRAKE SHOE", "BULB BRAKE LIGHT", "BULB HEAD", "BULB METER", "BUTTONS", "C&B LEVER", "C.D.I. UNIT", "CABLE BRAKE", "CABLE CHOKE", "CABLE CLUTCH", "CABLE SPEEDO METER", "CABLE THROTTLE", "CAM SHAFT", "CARBON BRUSH", "CARBON PLATE ASSEMBLY", "CARBURATOR REPAIR KIT", "CHAIN ADJUSTER", "CHAIN ADJUSTER CAP", "Chain case", "CHAIN COVER", "CHAIN LOCK", "CHAIN SPROCKET SET", "CLUTCH LEVER", "CLUTCH PACKING", "CLUTCH PLATE", "CLUTCH PULLY", "CLUTCH ROLLER KIT", "CLUTCH ROLLER SET", "CLUTCH SHOE", "CONNECTING ROD KIT", "CUP CONE SET", "CYLINDER KIT WITH PISTON", "DAMPER RUBBER", "DRIVE CHAIN", "ENGINE VALVE", "FLASHER", "FLOATER NEEDLE", "FLOOR SIDE PANEL", "FOOT REST", "FOOT REST FRONT(ASSEMBLY)", "FOOT REST REAR(ASSEMBLY)", "FOOTREST ROD", "FORK BOOT RUBBER", "FORK LINK BUSH KIT", "FORK TUBE", "FREE WEEL", "FRONT MUDGUARD", "FRONT MUDGUARD BRACKET", "FRONT NOSE PANEL", "FRONT SPROCKET", "FUEL COCK", "GASKET FULL", "GASKET TOP", "GEAR PADEL", "GEAR SHAFT", "GREEN BUSH", "HALF GASKET", "HANDLE BAR", "HANDLE CUP SET", "HANDLE GRIP", "HANDLE GRIP COVER", "HANDLE SWITCH", "HEAD LIGHT ASSY", "HEAD LIGHT COWL", "HEAD LIGHT COWL WITH VISOR", "HEAD LIGHT DOOM", "HEAD LIGHT- KAN SET", "HEAD LIGHT VISOR", "HEAD RUBBER", "HUB DRIVE", "HUB FRONT", "HUB REAR", "IGNITION COIL", "KICK PEDAL", "KICK SHAFT", "KICK SPRING", "KIT CRANK CASE", "LOWER PANNEL", "MAGNET GASKET", "MAIN STAND SPRING", "MAIN STAND WITH SPRING &PIN", "MAIN SWITCH", "MIDDLE NOSE", "MUDGUARD FRONT", "NUT BOLT", "OIL FILTER", "OIL NUT", "OIL SEAL", "OIL SEAL FORK", "OIL SEAL KIT", "PACE DRIVE", "PATTI", "PETROL TUBE", "PISTON KIT", "PISTON RINGS", "PLUG CAP", "PRESSURE PLATE", "REAR MUDGAURD", "REAR SHOCK ABSORBER BUSH", "REGULATOR RECTIFIRE", "RIM WHEEL", "ROCKER ARM", "SEAT COVERS", "SHOCK ABSORBER", "SIDE MIRROR", "SIDE PANEL", "SIDE STAND", "SIGNAL LIGHT", "SIGNAL LIGHT FITTING CLAMP", "SIGNAL LIGHT LEFT", "SPARK PLUG", "SPEEDO METER WORM ASSY", "SPEEDO METER WORM SET", "SPOKES", "SPRING SIDE STAND", "SPROCKET REAR", "STARTER BRANDIX  ( IN VENDOR QU", "STARTER RELAY", "SWIM ARM BUSH", "SWING ARMS", "TAIL LIGHT ASSEMBLY", "TAIL PANEL", "TANK CAP", "TANK COWL", "TEAL PANEL", "TEAL SIDE COVER", "TIMING CHAIN", "TOOLS", "V BELT", "V PANEL", "VALVE RUBBER", "VARIATOR", "VISOR BRACKET"
];

const mainCatMap = {
  "🏍️ Engine & Exhaust": ["CAM SHAFT", "CARBON BRUSH", "CARBON PLATE ASSEMBLY", "CONNECTING ROD KIT", "CYLINDER KIT WITH PISTON", "ENGINE VALVE", "GASKET FULL", "GASKET TOP", "HALF GASKET", "KICK SHAFT", "KICK SPRING", "KIT CRANK CASE", "MAGNET GASKET", "OIL NUT", "OIL SEAL", "OIL SEAL KIT", "PISTON KIT", "PISTON RINGS", "ROCKER ARM", "TIMING CHAIN", "VALVE RUBBER", "VARIATOR", "V BELT"],
  "⚙️ Transmission & Clutch": ["C&B LEVER", "CABLE CLUTCH", "CHAIN ADJUSTER", "CHAIN ADJUSTER CAP", "Chain case", "CHAIN COVER", "CHAIN LOCK", "CHAIN SPROCKET SET", "CLUTCH LEVER", "CLUTCH PACKING", "CLUTCH PLATE", "CLUTCH PULLY", "CLUTCH ROLLER KIT", "CLUTCH ROLLER SET", "CLUTCH SHOE", "DRIVE CHAIN", "FRONT SPROCKET", "GEAR PADEL", "GEAR SHAFT", "PACE DRIVE", "PRESSURE PLATE", "SPROCKET REAR"],
  "🛑 Brakes": ["BRAKE CAM SET", "BRAKE LEVER", "BRAKE LIGHT SWITCH FRONT", "BRAKE LIGHT SWITCH REAR", "BRAKE PADEL", "BRAKE PEDAL SPRING", "BRAKE ROD", "BRAKE SHOE", "CABLE BRAKE"],
  "🛠️ Suspension & Steering": ["CUP CONE SET", "DAMPER RUBBER", "FORK BOOT RUBBER", "FORK LINK BUSH KIT", "FORK TUBE", "HANDLE CUP SET", "OIL SEAL FORK", "REAR SHOCK ABSORBER BUSH", "SHOCK ABSORBER", "SWIM ARM BUSH", "SWING ARMS"],
  "🛞 Wheels & Hubs": ["AXEL FOUNDATION", "AXEL FRONT", "AXEL REAR", "AXEL SLEEVE/HALF AXEL", "BEARING", "FREE WEEL", "HUB DRIVE", "HUB FRONT", "HUB REAR", "RIM WHEEL", "SPOKES", "SPEEDO METER WORM ASSY", "SPEEDO METER WORM SET"],
  "⚡ Electrical & Lights": ["BULB BRAKE LIGHT", "BULB HEAD", "BULB METER", "C.D.I. UNIT", "FLASHER", "HEAD LIGHT ASSY", "HEAD LIGHT COWL", "HEAD LIGHT COWL WITH VISOR", "HEAD LIGHT DOOM", "HEAD LIGHT- KAN SET", "HEAD LIGHT VISOR", "IGNITION COIL", "MAIN SWITCH", "PLUG CAP", "REGULATOR RECTIFIRE", "SIGNAL LIGHT", "SIGNAL LIGHT FITTING CLAMP", "SIGNAL LIGHT LEFT", "SPARK PLUG", "STARTER BRANDIX  ( IN VENDOR QU", "STARTER RELAY", "TAIL LIGHT ASSEMBLY"],
  "🪑 Body & Panels": ["FLOOR SIDE PANEL", "FRONT MUDGUARD", "FRONT MUDGUARD BRACKET", "FRONT NOSE PANEL", "HEAD RUBBER", "LOWER PANNEL", "MIDDLE NOSE", "MUDGUARD FRONT", "REAR MUDGAURD", "SEAT COVERS", "SIDE PANEL", "TAIL PANEL", "TANK CAP", "TANK COWL", "TEAL PANEL", "TEAL SIDE COVER", "V PANEL"],
  "🏍️ Cables & Controls": ["ACCELERATOR MOUNTING", "BUTTONS", "CABLE CHOKE", "CABLE SPEEDO METER", "CABLE THROTTLE", "HANDLE BAR", "HANDLE GRIP", "HANDLE GRIP COVER", "HANDLE SWITCH", "KICK PEDAL"],
  "⛽ Fuel System": ["AIR FILTER", "AIR HORSE", "CARBURATOR REPAIR KIT", "FLOATER NEEDLE", "FUEL COCK", "PETROL TUBE"],
  "🧰 Accessories & Hardware": ["FOOT REST", "FOOT REST FRONT(ASSEMBLY)", "FOOT REST REAR(ASSEMBLY)", "FOOTREST ROD", "GREEN BUSH", "MAIN STAND SPRING", "MAIN STAND WITH SPRING &PIN", "NUT BOLT", "OIL FILTER", "PATTI", "SIDE MIRROR", "SIDE STAND", "SPRING SIDE STAND", "TOOLS", "VISOR BRACKET"]
};

function getCategory(item) {
  for (const [cat, items] of Object.entries(mainCatMap)) {
    if (items.includes(item)) return cat;
  }
  return "📦 General Items";
}

async function run() {
  console.log('Fetching existing products...');
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  
  console.log(`Deleting ${products.length} existing products...`);
  for (const p of products) {
    try {
      await fetch(`http://localhost:3000/api/products/${p.id}`, { method: 'DELETE' });
    } catch(e) {}
  }
  
  console.log('Fetching existing categories...');
  const catRes = await fetch('http://localhost:3000/api/categories');
  const categories = await catRes.json();
  
  console.log(`Deleting existing categories...`);
  for (const c of categories) {
    try {
      await fetch(`http://localhost:3000/api/categories?mainCategory=${encodeURIComponent(c.name)}`, { method: 'DELETE' });
    } catch(e) {}
  }
  
  console.log('Building new category structure...');
  const newCategories = {};
  for (const item of rawItems) {
    const main = getCategory(item);
    if (!newCategories[main]) newCategories[main] = [];
    newCategories[main].push(item);
  }
  
  // Write new categories to data/categories.json
  const categoriesJson = Object.keys(newCategories).map(k => ({ name: k, subCategories: newCategories[k] }));
  fs.writeFileSync('./data/categories.json', JSON.stringify(categoriesJson, null, 2));
  
  console.log('Seeding new categories to API...');
  for (const cat of categoriesJson) {
    await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addMainCategory', mainCategory: cat.name })
    });
    for (const sub of cat.subCategories) {
      await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addSubCategory', mainCategory: cat.name, subCategory: sub })
      });
    }
  }

  console.log(`Seeding ${rawItems.length} products...`);
  for (const item of rawItems) {
    const cat = getCategory(item);
    const formData = new FormData();
    formData.append('name', item);
    formData.append('category', cat);
    formData.append('subCategory', item);
    try {
      await fetch('http://localhost:3000/api/products', { method: 'POST', body: formData });
      console.log(`Added: ${item}`);
    } catch(e) {
      console.log(`Error adding ${item}`);
    }
  }
  console.log('Done!');
}

run();
