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

const itemsToMove = [
  'HEAD LIGHT COWL',
  'HEAD LIGHT COWL WITH VISOR',
  'HEAD LIGHT DOOM',
  'HEAD LIGHT- KAN SET',
  'HEAD LIGHT VISOR'
];

async function run() {
  console.log("Fetching categories...");
  const catRef = doc(db, 'appData', 'categories');
  const catSnap = await (await import('firebase/firestore')).getDoc(catRef);
  let categories = catSnap.data().categories;

  // Move in categories array
  let electrical = categories.find(c => c.name === 'Electrical & Lights');
  let body = categories.find(c => c.name === 'Body & Panels');

  if (electrical && body) {
    electrical.subCategories = electrical.subCategories.filter(s => !itemsToMove.includes(s));
    itemsToMove.forEach(item => {
      if (!body.subCategories.includes(item)) {
        body.subCategories.push(item);
      }
    });
    body.subCategories.sort((a, b) => a.localeCompare(b));
    console.log("Saving categories...");
    await setDoc(catRef, { categories });
  }

  console.log("Fetching products...");
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  let updatedCount = 0;

  for (const docSnap of snapshot.docs) {
    const product = docSnap.data();
    let needsUpdate = false;
    
    // 1. Remove Emojis from category name
    const cleanCatName = product.category ? product.category.replace(/[^\x00-\x7F]/g, "").trim() : '';
    if (product.category !== cleanCatName) {
      product.category = cleanCatName;
      needsUpdate = true;
    }

    // 2. Change category for moved items
    if (itemsToMove.includes(product.subCategory)) {
      if (product.category !== 'Body & Panels') {
        product.category = 'Body & Panels';
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

// We need to load env vars for firebase config since we are running standalone script
run().catch(console.error);
