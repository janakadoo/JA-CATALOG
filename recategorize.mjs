import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const moves = {
  'Suspension & Steering': ['HANDLE BAR'],
  'Electrical & Lights': ['HANDLE SWITCH', 'CARBON BRUSH', 'CARBON PLATE ASSEMBLY'],
  'Engine & Exhaust': ['KICK PEDAL', 'OIL FILTER'],
  'Cables & Controls': ['CABLE CLUTCH', 'CLUTCH LEVER', 'C&B LEVER'],
  'Transmission & Clutch': ['V BELT', 'VARIATOR'],
  'Body & Panels': ['VISOR BRACKET']
};

async function run() {
  console.log("Fetching categories...");
  const catRef = doc(db, 'appData', 'categories');
  const catSnap = await (await import('firebase/firestore')).getDoc(catRef);
  let categories = catSnap.data().categories;

  // Track all items to move for product updating
  const itemToNewCategory = {};
  for (const [newCat, items] of Object.entries(moves)) {
    items.forEach(i => itemToNewCategory[i] = newCat);
  }

  // 1. Remove items from their old categories
  categories.forEach(cat => {
    cat.subCategories = cat.subCategories.filter(sub => !Object.keys(itemToNewCategory).includes(sub));
  });

  // 2. Add items to their new categories
  categories.forEach(cat => {
    if (moves[cat.name]) {
      moves[cat.name].forEach(item => {
        if (!cat.subCategories.includes(item)) {
          cat.subCategories.push(item);
        }
      });
      cat.subCategories.sort((a, b) => a.localeCompare(b));
    }
  });

  console.log("Saving categories...");
  await setDoc(catRef, { categories });

  console.log("Fetching products...");
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  let updatedCount = 0;

  for (const docSnap of snapshot.docs) {
    const product = docSnap.data();
    let needsUpdate = false;

    if (itemToNewCategory[product.subCategory]) {
      const targetCat = itemToNewCategory[product.subCategory];
      if (product.category !== targetCat) {
        product.category = targetCat;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Updating product: ${product.name} -> new category: ${product.category}`);
      await setDoc(doc(db, 'products', docSnap.id), product);
      updatedCount++;
    }
  }
  
  console.log(`Finished! Updated ${updatedCount} products.`);
  process.exit(0);
}

run().catch(console.error);
