async function fix() {
  try {
    const res = await fetch('http://localhost:3000/api/categories');
    const categories = await res.json();
    
    for (const cat of categories) {
      const cleanName = cat.name.replace(/[^\x00-\x7F]/g, "").trim();
      if (cleanName !== cat.name) {
        console.log(`Renaming: ${cat.name} -> ${cleanName}`);
        const patchRes = await fetch('http://localhost:3000/api/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'editMainCategory',
            oldName: cat.name,
            newName: cleanName
          })
        });
        const patchData = await patchRes.json();
        if (!patchRes.ok) {
          console.error(`Failed to rename ${cat.name}:`, patchData);
        }
      }
    }
    console.log("Done fixing categories!");
  } catch (error) {
    console.error("Error:", error);
  }
}
fix();
