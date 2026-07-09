import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name');
    const category = formData.get('category');
    const subCategory = formData.get('subCategory');
    const price = formData.get('price');
    const description = formData.get('description');
    const imageFile = formData.get('image');

    if (!name || !category || !imageFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'product_catalog' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = uploadResult.secure_url;
    const uniqueSuffix = Date.now().toString();

    // Add new product to Firestore
    const newProduct = {
      name,
      category,
      subCategory: subCategory || '',
      price: price || '',
      description: description || '',
      imageUrl,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'products', uniqueSuffix), newProduct);

    return NextResponse.json({ success: true, product: { id: uniqueSuffix, ...newProduct } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
