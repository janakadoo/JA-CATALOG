import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PATCH - update product (e.g., upload image to existing product)
export async function PATCH(request, { params }) {
  try {
    console.log('Raw params:', params);
    const resolvedParams = await params;
    console.log('Resolved params:', resolvedParams);
    const { id } = resolvedParams;
    console.log('ID extracted:', id);
    const formData = await request.formData();

    const imageFile = formData.get('image');
    const name = formData.get('name');
    const price = formData.get('price');
    const description = formData.get('description');
    const category = formData.get('category');
    const subCategory = formData.get('subCategory');

    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updates = {};

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

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

      updates.imageUrl = uploadResult.secure_url;
    }

    if (name !== null && name !== undefined) updates.name = name;
    if (price !== null && price !== undefined) updates.price = price;
    if (description !== null && description !== undefined) updates.description = description;
    if (category !== null && category !== undefined) updates.category = category;
    if (subCategory !== null && subCategory !== undefined) updates.subCategory = subCategory;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();
    await updateDoc(productRef, updates);

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Error in PATCH /api/products/[id]:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - remove a product
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await deleteDoc(productRef);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
