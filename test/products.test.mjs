import test from 'node:test';
import assert from 'node:assert/strict';
import {NetlifyDB} from '@netlify/database-dev';
import {getDatabase} from '@netlify/database';
import {createHandler} from '../netlify/functions/products.mjs';
test('persistent isolated product CRUD, validation, stale edit protection and origin checks',async()=>{
 const local=new NetlifyDB();const db=getDatabase({connectionString:await local.start()});const api=createHandler(()=>db);const origin='https://shop.example';
 try {
  await local.applyMigrations('netlify/database/migrations');
  const first=await api(new Request(origin+'/api/products'));assert.equal(first.status,200);
  const cookie=first.headers.get('set-cookie').split(';')[0];const products=(await first.json()).data;assert.equal(products.length,6);
  async function send(method,path='',body,session=cookie,source=origin) {return api(new Request(origin+'/api/products'+path,{method,headers:{cookie:session,origin:source,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}));}
  const input={name:'Integration sample',price:1234.5,image:'https://example.com/item.png'};
  let res=await send('POST','',input);assert.equal(res.status,201);const item=(await res.json()).data;
  assert.equal((await send('GET')).status,200);
  res=await send('PUT','/'+item._id,{...input,name:'Edited',version:1});assert.equal(res.status,200);assert.equal((await res.json()).data.version,2);
  assert.equal((await send('PUT','/'+item._id,{...input,version:1})).status,409);
  const other=await api(new Request(origin+'/api/products'));const otherCookie=other.headers.get('set-cookie').split(';')[0];
  assert.equal((await send('DELETE','/'+item._id,null,otherCookie)).status,404);
  assert.equal((await send('POST','',{...input,image:'javascript:alert(1)'})).status,400);
  assert.equal((await send('POST','',input,cookie,'https://other.example')).status,403);
  assert.equal((await send('DELETE','/'+item._id)).status,200);
  assert.equal((await send('GET')).status,200);
 } finally {await db.pool.end();await local.stop();}
});
