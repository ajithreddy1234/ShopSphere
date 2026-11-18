import { create } from 'zustand';
async function request(path,options) {
 try {
  const response=await fetch(path,options);const data=await response.json();
  if(!response.ok || !data.success) return {success:false,message:data.message||'Request failed. Please retry.'};
  return data;
 } catch {return {success:false,message:'Cannot reach the catalogue. Check your connection and retry.'};}
}
export const useProductStore=create((set)=>({
 products:[],loading:false,error:'',
 setProducts:products=>set({products}),
 fetchProducts:async()=>{
  set({loading:true,error:''});const data=await request('/api/products');
  set(data.success?{products:data.data,loading:false}:{loading:false,error:data.message});
 },
 createProduct:async product=>{
  if(!product.name.trim() || !product.image.trim() || Number(product.price)<=0)return {success:false,message:'Enter a name, positive price, and image URL.'};
  // Establish a workspace when arriving directly at /create.
  const session=await request('/api/products');if(!session.success)return session;
  const data=await request('/api/products',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(product)});
  if(data.success)set(state=>({products:[...state.products,data.data]}));return data;
 },
 deleteProduct:async id=>{
  const data=await request('/api/products/'+id,{method:'DELETE'});
  if(data.success)set(state=>({products:state.products.filter(p=>p._id!==id)}));return data;
 },
 updateProduct:async(id,product)=>{
  const data=await request('/api/products/'+id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(product)});
  if(data.success)set(state=>({products:state.products.map(p=>p._id===id?data.data:p)}));return data;
 },
}));
