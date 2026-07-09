import fs from 'fs';

async function testUpload() {
  const productsRes = await fetch('http://localhost:3000/api/products');
  const products = await productsRes.json();
  const targetProduct = products[0];
  
  if (!targetProduct) {
    console.log('No products found');
    return;
  }

  console.log(`Uploading dummy image for product ${targetProduct.id}...`);
  
  // Create a 1x1 dummy PNG
  const dummyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  
  const blob = new Blob([dummyImage], { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', blob, 'dummy.png');

  const res = await fetch(`http://localhost:3000/api/products/${targetProduct.id}`, {
    method: 'PATCH',
    body: formData
  });

  const data = await res.json();
  console.log('Response status:', res.status);
  console.log('Response body:', data);
}

testUpload();
