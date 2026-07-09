import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import fs from 'fs/promises';
import path from 'path';

const CATEGORY_DOC_REF = doc(db, 'appData', 'categories');
const localDataFilePath = path.join(process.cwd(), 'data', 'categories.json');

async function getCategoriesData() {
  const docSnap = await getDoc(CATEGORY_DOC_REF);
  if (docSnap.exists()) {
    const data = docSnap.data().categories || [];
    if (data.length > 0) return data;
  }
  
  // Auto-seed from local JSON if Firestore is empty
  try {
    const fileContents = await fs.readFile(localDataFilePath, 'utf8');
    const localCategories = JSON.parse(fileContents);
    if (localCategories && localCategories.length > 0) {
      await setDoc(CATEGORY_DOC_REF, { categories: localCategories });
      return localCategories;
    }
  } catch (err) {
    console.log('No local categories to seed');
  }
  
  return [];
}

export async function GET() {
  try {
    const categories = await getCategoriesData();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action, mainCategory, subCategory } = await request.json();
    let categories = await getCategoriesData();

    if (action === 'addMainCategory') {
      if (!mainCategory) return NextResponse.json({ error: 'Main category name required' }, { status: 400 });
      if (categories.some(c => c.name === mainCategory)) {
        return NextResponse.json({ error: 'Main category already exists' }, { status: 400 });
      }
      categories.push({ name: mainCategory, subCategories: [] });
    } else if (action === 'addSubCategory') {
      if (!mainCategory || !subCategory) return NextResponse.json({ error: 'Main and sub category required' }, { status: 400 });
      const mainCat = categories.find(c => c.name === mainCategory);
      if (!mainCat) return NextResponse.json({ error: 'Main category not found' }, { status: 404 });
      if (mainCat.subCategories.includes(subCategory)) {
        return NextResponse.json({ error: 'Subcategory already exists' }, { status: 400 });
      }
      mainCat.subCategories.push(subCategory);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await setDoc(CATEGORY_DOC_REF, { categories });
    return NextResponse.json({ success: true, categories }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const mainCategory = url.searchParams.get('mainCategory');
    const subCategory = url.searchParams.get('subCategory');
    
    if (!mainCategory) {
      return NextResponse.json({ error: 'Main category name is required' }, { status: 400 });
    }

    let categories = await getCategoriesData();

    if (subCategory) {
      // Delete subcategory
      const mainCat = categories.find(c => c.name === mainCategory);
      if (mainCat) {
        mainCat.subCategories = mainCat.subCategories.filter(s => s !== subCategory);
      }
    } else {
      // Delete main category
      categories = categories.filter(c => c.name !== mainCategory);
    }

    await setDoc(CATEGORY_DOC_REF, { categories });
    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/categories:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { action, oldName, newName, mainCategory } = await request.json();
    let categories = await getCategoriesData();

    if (action === 'editMainCategory') {
      if (!oldName || !newName) return NextResponse.json({ error: 'Names required' }, { status: 400 });
      const catIndex = categories.findIndex(c => c.name === oldName);
      if (catIndex === -1) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      if (categories.some(c => c.name === newName && c.name !== oldName)) return NextResponse.json({ error: 'New name already exists' }, { status: 400 });
      categories[catIndex].name = newName;
    } else if (action === 'editSubCategory') {
      if (!mainCategory || !oldName || !newName) return NextResponse.json({ error: 'Names required' }, { status: 400 });
      const mainCat = categories.find(c => c.name === mainCategory);
      if (!mainCat) return NextResponse.json({ error: 'Main category not found' }, { status: 404 });
      const subIndex = mainCat.subCategories.indexOf(oldName);
      if (subIndex === -1) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
      if (mainCat.subCategories.includes(newName) && newName !== oldName) return NextResponse.json({ error: 'New subcategory already exists' }, { status: 400 });
      mainCat.subCategories[subIndex] = newName;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await setDoc(CATEGORY_DOC_REF, { categories });
    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/categories:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
