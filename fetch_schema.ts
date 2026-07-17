import fetch from 'node-fetch';

const url = 'https://ftqyzxrvghfdspgjampd.supabase.co/rest/v1/';
const key = 'sb_publishable_PRsJAks9Nw0fcT7Bvd0Y2Q_abzmKtne';

async function main() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json() as any;
  if (data.definitions) {
    console.log("Definitions (Tables):", Object.keys(data.definitions));
  } else {
    console.log("Response:", data);
  }
}

main().catch(console.error);
