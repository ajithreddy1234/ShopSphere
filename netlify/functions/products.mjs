import { randomUUID } from 'node:crypto';
import { getDatabase } from '@netlify/database';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const seeds = [['Studio headphones',4900,'headphones'],['Everyday backpack',2400,'bag'],['Desk light',1800,'lamp'],['Ceramic cup',650,'cup'],['Wireless keyboard',3200,'keyboard'],['Travel bottle',950,'bottle']];
function reply(data,status=200,cookie) {return Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff',...(cookie?{'set-cookie':cookie}:{})}});}
function validate(input) {
 if (!input || typeof input.name!=='string' || input.name.trim().length<2 || input.name.trim().length>100 || !['number','string'].includes(typeof input.price) || input.price==='' || !Number.isFinite(Number(input.price)) || Number(input.price)<=0 || Number(input.price)>10000000 || typeof input.image!=='string' || input.image.length>2000) return null;
 let validImage=/^\/samples\/[a-z]+\.svg$/.test(input.image);
 try {const url=new URL(input.image);validImage ||= url.protocol==='https:' && !url.username && !url.password;} catch {}
 if (!validImage) return null;
 return {name:input.name.trim(),price:Math.round(Number(input.price)*100)/100,image:input.image};
}
export function createHandler(provider=getDatabase) {
 let database;
 return async request=>{
  const url=new URL(request.url), db=database??=provider();
  const match=url.pathname.match(/^\/api\/products(?:\/([^/]+))?\/?$/);
  if (!match) return reply({success:false,message:'Not found'},404);
  const id=match[1];
  const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('shopsphere_workspace='))?.slice(21);
  let workspace=uuid.test(token??'')?token:null;
  try {
   if (request.method==='GET' && !id) {
    const exists=workspace && (await db.sql`SELECT id FROM shopsphere_workspaces WHERE id=${workspace}`).length;
    let cookie;
    if (!exists) {
     workspace=randomUUID();const client=await db.pool.connect();
     try {await client.query('BEGIN');await client.query('INSERT INTO shopsphere_workspaces(id) VALUES($1)',[workspace]);
      for (const [name,price,image] of seeds) await client.query('INSERT INTO shopsphere_products(id,workspace_id,name,price,image) VALUES($1,$2,$3,$4,$5)',[randomUUID(),workspace,name,price,'/samples/'+image+'.svg']);
      await client.query('COMMIT');
     } catch(error) {await client.query('ROLLBACK');throw error;} finally {client.release();}
     cookie='shopsphere_workspace='+workspace+'; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=2592000';
    }
    const data=await db.sql`SELECT id AS "_id",name,price::float8,image,version FROM shopsphere_products WHERE workspace_id=${workspace} ORDER BY created_at,id`;
    return reply({success:true,data,message:'Your private demo catalogue'},200,cookie);
   }
   if (!['POST','PUT','DELETE'].includes(request.method) || (request.method==='POST' && id) || (request.method!=='POST' && !id)) return reply({success:false,message:'Method not allowed'},405);
   if (request.headers.get('origin')!==url.origin) return reply({success:false,message:'Use the ShopSphere application'},403);
   if (!workspace) return reply({success:false,message:'Reload the catalogue to start your workspace'},401);
   if (id && !uuid.test(id)) return reply({success:false,message:'Product not found'},404);
   if (request.method==='DELETE') {
    const removed=await db.sql`DELETE FROM shopsphere_products WHERE id=${id} AND workspace_id=${workspace} RETURNING id`;
    return reply({success:!!removed.length,message:removed.length?'Product deleted':'Product not found'},removed.length?200:404);
   }
   if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({success:false,message:'Use JSON'},415);
   const text=await request.text();if(text.length>4000)return reply({success:false,message:'Request too large'},413);
   const input=JSON.parse(text),product=validate(input);
   if(!product)return reply({success:false,message:'Enter a name (2–100 characters), a positive price, and an HTTPS image URL.'},400);
   if(request.method==='POST') {
    const rows=await db.sql`INSERT INTO shopsphere_products(id,workspace_id,name,price,image)
      SELECT ${randomUUID()},id,${product.name},${product.price},${product.image} FROM shopsphere_workspaces
      WHERE id=${workspace} AND (SELECT count(*) FROM shopsphere_products WHERE workspace_id=${workspace})<100
      RETURNING id AS "_id",name,price::float8,image,version`;
    return rows.length?reply({success:true,data:rows[0],message:'Product created'},201):reply({success:false,message:'Workspace limit reached. Keep fewer than 100 products.'},409);
   }
   const rows=await db.sql`UPDATE shopsphere_products SET name=${product.name},price=${product.price},image=${product.image},version=version+1
      WHERE id=${id} AND workspace_id=${workspace} AND version=${Number.isInteger(input.version)?input.version:-1}
      RETURNING id AS "_id",name,price::float8,image,version`;
   return rows.length?reply({success:true,data:rows[0],message:'Product updated'}):reply({success:false,message:'This product changed or no longer exists. Reload before editing.'},409);
  } catch(error) {
   if(error instanceof SyntaxError)return reply({success:false,message:'Invalid JSON'},400);
   console.error('ShopSphere storage failure',error.code??error.name);
   return reply({success:false,message:'The catalogue service is unavailable. Please retry.'},503);
  }
 };
}
export default createHandler();
export const config={path:['/api/products','/api/products/*'],rateLimit:{windowLimit:50,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
